"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { toast } from "sonner";
import type { Monitor } from "@/lib/supabase";

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonitors = useCallback(async () => {
    const res = await fetch("/api/monitors");
    if (res.ok) {
      setMonitors(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30_000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  const handlePauseToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "paused" ? "up" : "paused";
    const res = await fetch(`/api/monitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === "paused" ? "Monitor paused" : "Monitor resumed");
      fetchMonitors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this monitor and all its data?")) return;
    const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Monitor deleted");
      setMonitors((m) => m.filter((mon) => mon.id !== id));
    }
  };

  const stats = {
    up: monitors.filter((m) => m.status === "up").length,
    down: monitors.filter((m) => m.status === "down").length,
    paused: monitors.filter((m) => m.status === "paused").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monitors</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.up} up · {stats.down} down · {stats.paused} paused
            </p>
          )}
        </div>
        <Link href="/monitors/new">
          <Button>+ Add monitor</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : monitors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">No monitors yet</p>
          <p className="text-sm mb-6">Add your first URL to start monitoring</p>
          <Link href="/monitors/new">
            <Button>+ Add monitor</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onPauseToggle={handlePauseToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
