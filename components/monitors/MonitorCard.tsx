"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { Monitor } from "@/lib/supabase";

type Props = {
  monitor: Monitor;
  onPauseToggle: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
};

export function MonitorCard({ monitor, onPauseToggle, onDelete }: Props) {
  const uptimePercent = null; // Computed on detail page

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/monitors/${monitor.id}`}
              className="font-semibold text-base hover:underline truncate block"
            >
              {monitor.name}
            </Link>
            <p className="text-sm text-muted-foreground truncate">{monitor.url}</p>
          </div>
          <StatusBadge status={monitor.status as "up" | "down" | "paused"} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div>
            <p className="text-muted-foreground text-xs">Response</p>
            <p className="font-medium">
              {monitor.response_time_ms != null
                ? `${monitor.response_time_ms}ms`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Interval</p>
            <p className="font-medium">{monitor.interval_minutes}m</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Last check</p>
            <p className="font-medium">
              {monitor.last_checked_at
                ? new Date(monitor.last_checked_at).toLocaleTimeString()
                : "Never"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/monitors/${monitor.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Details
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPauseToggle(monitor.id, monitor.status)}
          >
            {monitor.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(monitor.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
