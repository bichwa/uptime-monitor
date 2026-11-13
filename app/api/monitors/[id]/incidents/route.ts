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

  const { data: monitor } = await supabaseAdmin
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("incidents")
    .select("*")
    .eq("monitor_id", id)
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
