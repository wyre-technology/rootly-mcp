/**
 * Simple token-bucket rate limiter for Rootly write operations.
 * Rootly enforces max 3 write calls per 60 seconds.
 */

const WRITE_LIMIT = 3;
const WINDOW_MS = 60_000;

const writeTimes: number[] = [];

export function checkWriteRateLimit(): void {
  const now = Date.now();
  // Remove timestamps outside the window
  while (writeTimes.length > 0 && writeTimes[0]! < now - WINDOW_MS) {
    writeTimes.shift();
  }

  if (writeTimes.length >= WRITE_LIMIT) {
    const oldest = writeTimes[0]!;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    throw new Error(
      `Rootly write rate limit exceeded (${WRITE_LIMIT} writes/60s). ` +
      `Retry after ${Math.ceil(retryAfterMs / 1000)}s.`
    );
  }

  writeTimes.push(now);
}
