import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

async function assertOwnership(userId: string, monitorId: string) {
  const { data } = await supabaseAdmin
    .from("monitors")
    .select("id")
    .eq("id", monitorId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertOwnership(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("monitor_recipients")
    .select("*")
    .eq("monitor_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertOwnership(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("monitor_recipients")
    .insert({ monitor_id: id, email })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertOwnership(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { recipientId } = await req.json();
  if (!recipientId) return NextResponse.json({ error: "recipientId required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("monitor_recipients")
    .delete()
    .eq("id", recipientId)
    .eq("monitor_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
