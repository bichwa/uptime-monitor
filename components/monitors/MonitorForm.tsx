"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Props = {
  defaultValues?: {
    name: string;
    url: string;
    method: string;
    interval_minutes: number;
    recipients: string[];
  };
  monitorId?: string;
};

export function MonitorForm({ defaultValues, monitorId }: Props) {
  const router = useRouter();
  const isEdit = !!monitorId;

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [url, setUrl] = useState(defaultValues?.url ?? "");
  const [method, setMethod] = useState(defaultValues?.method ?? "GET");
  const [interval, setInterval] = useState(
    String(defaultValues?.interval_minutes ?? "5")
  );
  const [recipients, setRecipients] = useState<string[]>(
    defaultValues?.recipients ?? [""]
  );
  const [loading, setLoading] = useState(false);

  const addRecipient = () => setRecipients((r) => [...r, ""]);
  const removeRecipient = (i: number) =>
    setRecipients((r) => r.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, val: string) =>
    setRecipients((r) => r.map((v, idx) => (idx === i ? val : v)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validRecipients = recipients.filter((r) => r.trim() !== "");
    const payload = {
      name,
      url,
      method,
      interval_minutes: parseInt(interval),
      recipients: validRecipients,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/monitors/${monitorId}` : "/api/monitors",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save monitor");
      }

      toast.success(isEdit ? "Monitor updated" : "Monitor created");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Monitor" : "Add Monitor"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Check interval</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every 1 minute</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="10">Every 10 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alert recipients</Label>
            {recipients.map((email, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => updateRecipient(i, e.target.value)}
                  placeholder="alert@example.com"
                />
                {recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRecipient(i)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRecipient}
            >
              + Add another email
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Monitor" : "Create Monitor"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
