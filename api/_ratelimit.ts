import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * In-memory sliding window rate limiter for Vercel serverless.
 *
 * - Zero external dependencies (no Redis/Upstash needed)
 * - Persists across warm invocations of the same serverless instance
 * - Resets on cold start (acceptable tradeoff for free tier)
 * - Auto-evicts stale entries to prevent memory leaks
 */

interface RateLimitEntry {
  timestamps: number[];
}

// Global store survives across warm invocations
const store = new Map<string, RateLimitEntry>();

// Evict stale entries every 60s to prevent memory growth
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs * 2; // Keep 2x window for safety
  for (const [key, entry] of store) {
    const latest = entry.timestamps[entry.timestamps.length - 1] || 0;
    if (latest < cutoff) {
      store.delete(key);
    }
  }
}

type RateLimitConfig = {
  /** Unique prefix for this endpoint */
  prefix: string;
  /** Max requests per window */
  limit: number;
  /** Window in milliseconds */
  windowMs: number;
};

/**
 * Get rate limit key from request. Uses UID if available, falls back to IP.
 */
export function getRateLimitKey(req: VercelRequest, uid?: string): string {
  if (uid) return `uid:${uid}`;
  const ip =
    (req.headers["x-real-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    "unknown";
  return `ip:${ip}`;
}

/**
 * Check rate limit. Returns true if allowed, false if blocked (429 sent).
 */
export function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig,
  identifier?: string
): boolean {
  const key = `${config.prefix}:${identifier || getRateLimitKey(req)}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Lazy cleanup
  cleanup(config.windowMs);

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  // Check limit
  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + config.windowMs - now) / 1000);

    res.setHeader("X-RateLimit-Limit", config.limit);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("Retry-After", Math.max(retryAfter, 1));
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.max(retryAfter, 1),
    });
    return false;
  }

  // Allow — record this request
  entry.timestamps.push(now);

  res.setHeader("X-RateLimit-Limit", config.limit);
  res.setHeader("X-RateLimit-Remaining", config.limit - entry.timestamps.length);

  return true;
}
