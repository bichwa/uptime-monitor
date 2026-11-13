import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("monitors")
    .select("*, monitor_recipients(id, email)")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, url, method, interval_minutes, status } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (url !== undefined) updates.url = url;
  if (method !== undefined) updates.method = method;
  if (interval_minutes !== undefined) updates.interval_minutes = interval_minutes;
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabaseAdmin
    .from("monitors")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("monitors")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
