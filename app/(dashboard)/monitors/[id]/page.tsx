"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { UptimeChart } from "@/components/monitors/UptimeChart";
import { ResponseTimeChart } from "@/components/monitors/ResponseTimeChart";
import { toast } from "sonner";
import type { Monitor, MonitorRecipient, Incident, MonitorLog } from "@/lib/supabase";

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [logs, setLogs] = useState<MonitorLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recipients, setRecipients] = useState<MonitorRecipient[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [monRes, logRes, incRes, recRes] = await Promise.all([
        fetch(`/api/monitors/${id}`),
        fetch(`/api/monitors/${id}/logs?days=30`),
        fetch(`/api/monitors/${id}/incidents`),
        fetch(`/api/monitors/${id}/recipients`),
      ]);
      if (!monRes.ok) { router.push("/"); return; }
      const [mon, logData, incData, recData] = await Promise.all([
        monRes.json(), logRes.json(), incRes.json(), recRes.json(),
      ]);
      setMonitor(mon);
      setLogs(logData);
      setIncidents(incData);
      setRecipients(recData);
      setLoading(false);
    };
    load();
  }, [id, router]);

  const addRecipient = async () => {
    if (!newEmail.trim()) return;
    const res = await fetch(`/api/monitors/${id}/recipients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim() }),
    });
    if (res.ok) {
      const rec = await res.json();
      setRecipients((r) => [...r, rec]);
      setNewEmail("");
      toast.success("Recipient added");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to add recipient");
    }
  };

  const removeRecipient = async (recipientId: string) => {
    const res = await fetch(`/api/monitors/${id}/recipients`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    if (res.ok) {
      setRecipients((r) => r.filter((rec) => rec.id !== recipientId));
      toast.success("Recipient removed");
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!monitor) return null;

  const uptimePct =
    logs.length === 0
      ? 100
      : Math.round((logs.filter((l) => l.status === "up").length / logs.length) * 100);

  const avgResponse =
    logs.length === 0
      ? null
      : Math.round(
          logs
            .filter((l) => l.response_time_ms != null)
            .reduce((s, l) => s + (l.response_time_ms ?? 0), 0) /
            logs.filter((l) => l.response_time_ms != null).length
        );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{monitor.name}</h1>
            <StatusBadge status={monitor.status as "up" | "down" | "paused"} />
          </div>
          <a
            href={monitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            {monitor.url}
          </a>
        </div>
        <div className="flex gap-2">
          <Link href={`/monitors/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "30-day uptime", value: `${uptimePct}%` },
          { label: "Avg response", value: avgResponse != null ? `${avgResponse}ms` : "—" },
          { label: "Check interval", value: `${monitor.interval_minutes}m` },
          { label: "Last checked", value: monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleTimeString() : "Never" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader><CardTitle className="text-base">30-day uptime</CardTitle></CardHeader>
        <CardContent><UptimeChart logs={logs} days={30} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Response time (last 100 checks)</CardTitle></CardHeader>
        <CardContent><ResponseTimeChart logs={logs.slice(0, 100).reverse()} /></CardContent>
      </Card>

      {/* Tabs: Incidents / Recipients */}
      <Tabs defaultValue="incidents">
        <TabsList>
          <TabsTrigger value="incidents">
            Incidents ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="recipients">
            Alert recipients ({recipients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <Card>
            <CardContent className="pt-4">
              {incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No incidents recorded
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cause</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => (
                      <TableRow key={inc.id}>
                        <TableCell className="text-sm">
                          {new Date(inc.started_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDuration(inc.started_at, inc.resolved_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inc.cause}
                        </TableCell>
                        <TableCell>
                          {inc.resolved_at ? (
                            <span className="text-xs text-green-600 font-medium">Resolved</span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">Ongoing</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Add email address..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                />
                <Button onClick={addRecipient}>Add</Button>
              </div>
              {recipients.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No recipients — alerts will not be sent
                </p>
              ) : (
                <ul className="space-y-2">
                  {recipients.map((r) => (
                    <li key={r.id} className="flex items-center justify-between text-sm">
                      <span>{r.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 h-7"
                        onClick={() => removeRecipient(r.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
