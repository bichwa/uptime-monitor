import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { MonitorForm } from "@/components/monitors/MonitorForm";

export default async function EditMonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;

  const { data: monitor } = await supabaseAdmin
    .from("monitors")
    .select("*, monitor_recipients(email)")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!monitor) notFound();

  const recipients =
    (monitor.monitor_recipients as { email: string }[] | null)?.map(
      (r) => r.email
    ) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Monitor</h1>
      <MonitorForm
        monitorId={id}
        defaultValues={{
          name: monitor.name,
          url: monitor.url,
          method: monitor.method,
          interval_minutes: monitor.interval_minutes,
          recipients,
        }}
      />
    </div>
  );
}
