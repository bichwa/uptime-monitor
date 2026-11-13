"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { MonitorLog } from "@/lib/supabase";

type DayData = {
  date: string;
  upChecks: number;
  totalChecks: number;
  uptimePct: number;
};

function buildDailyData(logs: MonitorLog[], days: number): DayData[] {
  const result: DayData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayLogs = logs.filter(
      (l) => l.checked_at.slice(0, 10) === dateStr
    );
    const total = dayLogs.length;
    const up = dayLogs.filter((l) => l.status === "up").length;

    result.push({
      date: dateStr,
      upChecks: up,
      totalChecks: total,
      uptimePct: total === 0 ? 100 : Math.round((up / total) * 100),
    });
  }

  return result;
}

type Props = {
  logs: MonitorLog[];
  days?: number;
};

export function UptimeChart({ logs, days = 30 }: Props) {
  const data = buildDailyData(logs, days);

  const overallUptime =
    logs.length === 0
      ? 100
      : Math.round(
          (logs.filter((l) => l.status === "up").length / logs.length) * 100
        );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {days}-day uptime
        </span>
        <span
          className={`text-lg font-bold ${
            overallUptime >= 99
              ? "text-green-600"
              : overallUptime >= 95
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {overallUptime}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={data} barCategoryGap={2}>
          <XAxis dataKey="date" hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as DayData;
              return (
                <div className="bg-popover border rounded p-2 text-xs shadow">
                  <p className="font-medium">{d.date}</p>
                  <p>
                    {d.upChecks}/{d.totalChecks} checks passed ({d.uptimePct}%)
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="uptimePct" radius={2}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.totalChecks === 0
                    ? "#e5e7eb"
                    : entry.uptimePct >= 99
                    ? "#22c55e"
                    : entry.uptimePct >= 90
                    ? "#eab308"
                    : "#ef4444"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
