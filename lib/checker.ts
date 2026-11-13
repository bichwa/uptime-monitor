export type CheckResult = {
  status: "up" | "down";
  statusCode: number | null;
  responseTimeMs: number;
  cause: string | null;
};

export async function checkUrl(
  url: string,
  method: string = "GET"
): Promise<CheckResult> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "UptimeMonitor/1.0" },
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - start;
    const isUp = response.status < 400;

    return {
      status: isUp ? "up" : "down",
      statusCode: response.status,
      responseTimeMs,
      cause: isUp ? null : `HTTP ${response.status}`,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Timeout after 10s"
          : err.message
        : "Unknown error";

    return {
      status: "down",
      statusCode: null,
      responseTimeMs,
      cause: message,
    };
  }
}
