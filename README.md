# Uptime Monitor

A Next.js app that monitors URLs at configurable intervals, tracks incidents, and sends email alerts when sites go down or recover.

## Features

- **Cron-based health checks** — Vercel cron hits `/api/cron/check` every minute, checking all due monitors in parallel (concurrency-capped at 5)
- **Incident tracking** — automatically opens and closes incidents on status transitions; calculates total downtime on recovery
- **Email alerts** — down and recovery emails via Resend with HTML-safe rendering
- **Two auth providers** — GitHub OAuth and magic link email via NextAuth v5
- **Per-user data isolation** — Supabase Row Level Security ensures users only see their own monitors
- **Log retention** — pg_cron job purges `monitor_logs` older than 30 days daily at 03:00 UTC

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components, Server Actions, Route Handlers
- [Supabase](https://supabase.com) — Postgres database, Row Level Security, `@auth/supabase-adapter`
- [NextAuth v5](https://authjs.dev) — GitHub OAuth + Resend magic link
- [Resend](https://resend.com) — transactional email
- [Vercel](https://vercel.com) — hosting + cron scheduling
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS — UI components
- [Recharts](https://recharts.org) — response time and uptime charts

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/bichwa/uptime-monitor.git
cd uptime-monitor
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor to create all tables, RLS policies, and indexes
3. Run `supabase/migrations/001_log_retention.sql` to set up the pg_cron log retention job (requires enabling the `pg_cron` extension under Database → Extensions first)

### 3. Configure environment variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
AUTH_SECRET=your-secret   # generate with: openssl rand -base64 32

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Resend (https://resend.com)
RESEND_API_KEY=your-api-key
RESEND_FROM_EMAIL=alerts@yourdomain.com

# Vercel cron secret (any random string)
CRON_SECRET=your-cron-secret
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Add all environment variables in the Vercel dashboard. The cron job in `vercel.json` runs every minute automatically on Vercel's infrastructure and injects `CRON_SECRET` as a bearer token.

## Project Structure

```
app/
  (auth)/login/        # Login page (magic link + GitHub OAuth)
  (dashboard)/         # Protected dashboard — monitors list, detail, new, edit
  api/
    auth/              # NextAuth handler
    cron/check/        # Cron endpoint — checks all due monitors
    monitors/          # CRUD API for monitors, incidents, logs, recipients
lib/
  auth.ts              # NextAuth config
  checker.ts           # URL health check with 10s timeout
  resend.ts            # Down/recovery alert emails
  supabase.ts          # Supabase clients + TypeScript types
components/
  monitors/            # MonitorCard, MonitorForm, StatusBadge, charts
  ui/                  # shadcn/ui components
supabase/
  schema.sql           # Full database schema + RLS policies + indexes
  migrations/          # Incremental migrations (pg_cron log retention)
```
