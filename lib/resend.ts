import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "alerts@yourdomain.com";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** i));
      }
    }
  }
  throw lastError;
}

export async function sendDownAlert(opts: {
  monitorName: string;
  url: string;
  cause: string;
  checkedAt: string;
  recipients: string[];
}) {
  if (opts.recipients.length === 0) return;

  await withRetry(() => resend.emails.send({
    from: FROM,
    to: opts.recipients,
    subject: `🔴 DOWN: ${opts.monitorName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;">
        <h2 style="color:#dc2626;">🔴 Site is DOWN</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;font-weight:bold;width:140px;">Monitor</td><td style="padding:8px;">${esc(opts.monitorName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">URL</td><td style="padding:8px;"><a href="${esc(opts.url)}">${esc(opts.url)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Cause</td><td style="padding:8px;">${esc(opts.cause)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Detected at</td><td style="padding:8px;">${new Date(opts.checkedAt).toUTCString()}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">You are receiving this because you are subscribed to alerts for this monitor.</p>
      </div>
    `,
  }));
}

export async function sendRecoveryAlert(opts: {
  monitorName: string;
  url: string;
  downtimeDuration: string;
  checkedAt: string;
  recipients: string[];
}) {
  if (opts.recipients.length === 0) return;

  await withRetry(() => resend.emails.send({
    from: FROM,
    to: opts.recipients,
    subject: `✅ RECOVERED: ${opts.monitorName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;">
        <h2 style="color:#16a34a;">✅ Site has RECOVERED</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;font-weight:bold;width:140px;">Monitor</td><td style="padding:8px;">${esc(opts.monitorName)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">URL</td><td style="padding:8px;"><a href="${esc(opts.url)}">${esc(opts.url)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Downtime</td><td style="padding:8px;">${esc(opts.downtimeDuration)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Recovered at</td><td style="padding:8px;">${new Date(opts.checkedAt).toUTCString()}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">You are receiving this because you are subscribed to alerts for this monitor.</p>
      </div>
    `,
  }));
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
