-- Enable pg_cron extension (requires Supabase dashboard:
-- Database → Extensions → pg_cron → Enable)
create extension if not exists pg_cron with schema extensions;

-- Grant usage so the cron job can run under the postgres role
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Delete monitor_logs older than 30 days, runs daily at 03:00 UTC
select cron.schedule(
  'purge-old-monitor-logs',
  '0 3 * * *',
  $$
    delete from monitor_logs
    where checked_at < now() - interval '30 days';
  $$
);
