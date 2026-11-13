import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser / SSR (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Monitor = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "HEAD";
  interval_minutes: number;
  status: "up" | "down" | "paused";
  last_checked_at: string | null;
  last_status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
};

export type MonitorRecipient = {
  id: string;
  monitor_id: string;
  email: string;
};

export type Incident = {
  id: string;
  monitor_id: string;
  started_at: string;
  resolved_at: string | null;
  cause: string;
};

export type MonitorLog = {
  id: string;
  monitor_id: string;
  checked_at: string;
  status: "up" | "down";
  status_code: number | null;
  response_time_ms: number | null;
};
