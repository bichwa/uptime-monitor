import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const { data: monitor } = await supabaseAdmin
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("monitor_logs")
    .select("*")
    .eq("monitor_id", id)
    .gte("checked_at", since)
    .order("checked_at", { ascending: false })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
