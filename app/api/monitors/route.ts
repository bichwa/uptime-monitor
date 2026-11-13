import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("monitors")
    .select("*, monitor_recipients(email)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, url, method = "GET", interval_minutes = 5, recipients = [] } = body;

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  const { data: monitor, error } = await supabaseAdmin
    .from("monitors")
    .insert({ user_id: session.user.id, name, url, method, interval_minutes })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Add recipients if provided
  if (recipients.length > 0) {
    await supabaseAdmin.from("monitor_recipients").insert(
      recipients.map((email: string) => ({ monitor_id: monitor.id, email }))
    );
  }

  return NextResponse.json(monitor, { status: 201 });
}
