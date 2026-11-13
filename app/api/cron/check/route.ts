import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUrl } from "@/lib/checker";
import { sendDownAlert, sendRecoveryAlert, formatDuration } from "@/lib/resend";
import type { Monitor, MonitorRecipient, Incident } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all non-paused monitors
  const { data: monitors, error } = await supabaseAdmin
    .from("monitors")
    .select("*")
    .neq("status", "paused");

  if (error) {
    console.error("Cron: failed to fetch monitors", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Filter monitors that are due for a check
  const due = (monitors as Monitor[]).filter((m) => {
    if (!m.last_checked_at) return true;
    const last = new Date(m.last_checked_at).getTime();
    const intervalMs = m.interval_minutes * 60 * 1000;
    return now.getTime() - last >= intervalMs;
  });

  if (due.length === 0) {
    return NextResponse.json({ checked: 0 });
  }

  // Check all due monitors in parallel
  await Promise.all(due.map((monitor) => processMonitor(monitor, now)));

  return NextResponse.json({ checked: due.length });
}

async function processMonitor(monitor: Monitor, now: Date) {
  const result = await checkUrl(monitor.url, monitor.method);
  const checkedAt = now.toISOString();

  // Write log entry
  await supabaseAdmin.from("monitor_logs").insert({
    monitor_id: monitor.id,
    checked_at: checkedAt,
    status: result.status,
    status_code: result.statusCode,
    response_time_ms: result.responseTimeMs,
  });

  // Update monitor's last check info
  await supabaseAdmin
    .from("monitors")
    .update({
      status: result.status,
      last_checked_at: checkedAt,
      last_status_code: result.statusCode,
      response_time_ms: result.responseTimeMs,
    })
    .eq("id", monitor.id);

  const previousStatus = monitor.status;

  // Site just went DOWN
  if (result.status === "down" && previousStatus !== "down") {
    await supabaseAdmin.from("incidents").insert({
      monitor_id: monitor.id,
      started_at: checkedAt,
      cause: result.cause ?? "Unknown error",
    });

    const recipients = await getRecipients(monitor.id);
    if (recipients.length > 0) {
      try {
        await sendDownAlert({
          monitorName: monitor.name,
          url: monitor.url,
          cause: result.cause ?? "Unknown error",
          checkedAt,
          recipients,
        });
      } catch (err) {
        console.error(`Failed to send down alert for monitor ${monitor.id}:`, err);
      }
    }
  }

  // Site just RECOVERED
  if (result.status === "up" && previousStatus === "down") {
    // Find the open incident
    const { data: incident } = await supabaseAdmin
      .from("incidents")
      .select("*")
      .eq("monitor_id", monitor.id)
      .is("resolved_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (incident) {
      const downtimeMs =
        now.getTime() - new Date((incident as Incident).started_at).getTime();

      await supabaseAdmin
        .from("incidents")
        .update({ resolved_at: checkedAt })
        .eq("id", incident.id);

      const recipients = await getRecipients(monitor.id);
      if (recipients.length > 0) {
        try {
          await sendRecoveryAlert({
            monitorName: monitor.name,
            url: monitor.url,
            downtimeDuration: formatDuration(downtimeMs),
            checkedAt,
            recipients,
          });
        } catch (err) {
          console.error(`Failed to send recovery alert for monitor ${monitor.id}:`, err);
        }
      }
    }
  }
}

async function getRecipients(monitorId: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from("monitor_recipients")
    .select("email")
    .eq("monitor_id", monitorId);

  return (data as MonitorRecipient[] | null)?.map((r) => r.email) ?? [];
}
