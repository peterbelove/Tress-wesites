type Bucket = { count: number; resetAt: number };

const globalForRl = globalThis as typeof globalThis & { __tresRateBuckets?: Map<string, Bucket> };
const buckets = globalForRl.__tresRateBuckets ?? new Map<string, Bucket>();
globalForRl.__tresRateBuckets = buckets;

/**
 * Simple in-memory fixed-window rate limiter. Suitable for a single-instance
 * deployment; swap for a shared store when scaling horizontally.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

export function clientKey(headers: Headers, scope: string) {
  const fwd = headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
