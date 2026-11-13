"use client";

import { Badge } from "@/components/ui/badge";

type Status = "up" | "down" | "paused";

const config: Record<Status, { label: string; className: string }> = {
  up: { label: "Up", className: "bg-green-100 text-green-800 border-green-200" },
  down: { label: "Down", className: "bg-red-100 text-red-800 border-red-200" },
  paused: { label: "Paused", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status] ?? config.paused;
  return (
    <Badge variant="outline" className={className}>
      <span
        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
          status === "up"
            ? "bg-green-500"
            : status === "down"
            ? "bg-red-500"
            : "bg-yellow-500"
        }`}
      />
      {label}
    </Badge>
  );
}
