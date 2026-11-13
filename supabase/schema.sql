-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- NextAuth / Auth.js required tables (SupabaseAdapter)
-- ============================================================
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  name text,
  email text unique,
  "emailVerified" timestamptz,
  image text
);

create table if not exists accounts (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, "providerAccountId")
);

create table if not exists sessions (
  id uuid default uuid_generate_v4() primary key,
  "sessionToken" text not null unique,
  "userId" uuid not null references users(id) on delete cascade,
  expires timestamptz not null
);

create table if not exists verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- ============================================================
-- Uptime Monitor tables
-- ============================================================
create table if not exists monitors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  url text not null,
  method text not null default 'GET',
  interval_minutes int not null default 5,
  status text not null default 'up',
  last_checked_at timestamptz,
  last_status_code int,
  response_time_ms int,
  created_at timestamptz default now()
);

create table if not exists monitor_recipients (
  id uuid default uuid_generate_v4() primary key,
  monitor_id uuid not null references monitors(id) on delete cascade,
  email text not null,
  unique(monitor_id, email)
);

create table if not exists incidents (
  id uuid default uuid_generate_v4() primary key,
  monitor_id uuid not null references monitors(id) on delete cascade,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  cause text not null
);

create table if not exists monitor_logs (
  id uuid default uuid_generate_v4() primary key,
  monitor_id uuid not null references monitors(id) on delete cascade,
  checked_at timestamptz not null default now(),
  status text not null,
  status_code int,
  response_time_ms int
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table monitors enable row level security;
alter table monitor_recipients enable row level security;
alter table incidents enable row level security;
alter table monitor_logs enable row level security;

-- Monitors: users can only access their own
create policy "monitors_select" on monitors for select using (user_id = auth.uid());
create policy "monitors_insert" on monitors for insert with check (user_id = auth.uid());
create policy "monitors_update" on monitors for update using (user_id = auth.uid());
create policy "monitors_delete" on monitors for delete using (user_id = auth.uid());

-- Recipients: through monitor ownership
create policy "recipients_select" on monitor_recipients for select
  using (exists (select 1 from monitors where monitors.id = monitor_id and monitors.user_id = auth.uid()));
create policy "recipients_insert" on monitor_recipients for insert
  with check (exists (select 1 from monitors where monitors.id = monitor_id and monitors.user_id = auth.uid()));
create policy "recipients_delete" on monitor_recipients for delete
  using (exists (select 1 from monitors where monitors.id = monitor_id and monitors.user_id = auth.uid()));

-- Incidents: through monitor ownership
create policy "incidents_select" on incidents for select
  using (exists (select 1 from monitors where monitors.id = monitor_id and monitors.user_id = auth.uid()));

-- Logs: through monitor ownership
create policy "logs_select" on monitor_logs for select
  using (exists (select 1 from monitors where monitors.id = monitor_id and monitors.user_id = auth.uid()));

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_monitors_user_id on monitors(user_id);
create index if not exists idx_monitor_logs_monitor_id on monitor_logs(monitor_id);
create index if not exists idx_monitor_logs_checked_at on monitor_logs(checked_at desc);
create index if not exists idx_incidents_monitor_id on incidents(monitor_id);
create index if not exists idx_incidents_resolved_at on incidents(resolved_at);
