"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { MonitorLog } from "@/lib/supabase";

type Props = {
  logs: MonitorLog[];
};

export function ResponseTimeChart({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No data yet
      </p>
    );
  }

  const data = logs.map((l) => ({
    time: new Date(l.checked_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    ms: l.response_time_ms ?? 0,
    status: l.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11 }} unit="ms" width={55} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-popover border rounded p-2 text-xs shadow">
                <p>{d.time}</p>
                <p className="font-medium">{d.ms}ms</p>
                <p className={d.status === "up" ? "text-green-600" : "text-red-600"}>
                  {d.status}
                </p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="ms"
          stroke="#6366f1"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
