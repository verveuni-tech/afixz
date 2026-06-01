import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

/**
 * Sliding window rate limiter — distributed (Upstash Redis) when env vars set,
 * falls back to in-memory per-instance counter otherwise.
 *
 * In-memory mode is BYPASSABLE across cold/parallel serverless instances —
 * always configure Upstash for production:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  } catch (err) {
    console.error("Upstash init failed:", err);
  }
}

// ── In-memory fallback ───────────────────────────────────────────────────
interface RateLimitEntry {
  timestamps: number[];
}
const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs * 2;
  for (const [key, entry] of store) {
    const latest = entry.timestamps[entry.timestamps.length - 1] || 0;
    if (latest < cutoff) store.delete(key);
  }
}

type RateLimitConfig = {
  prefix: string;
  limit: number;
  windowMs: number;
};

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
 * NOTE: async now — must await.
 */
export async function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig,
  identifier?: string
): Promise<boolean> {
  const key = `rl:${config.prefix}:${identifier || getRateLimitKey(req)}`;
  const now = Date.now();
  const windowSec = Math.ceil(config.windowMs / 1000);

  // ── Distributed path (Upstash) ───────────────────────────────────
  if (redis) {
    try {
      // INCR + EXPIRE in pipeline. First hit sets TTL; subsequent hits keep it.
      const pipe = redis.pipeline();
      pipe.incr(key);
      pipe.expire(key, windowSec);
      const [count] = (await pipe.exec()) as [number, number];

      const remaining = Math.max(0, config.limit - count);
      res.setHeader("X-RateLimit-Limit", config.limit);
      res.setHeader("X-RateLimit-Remaining", remaining);

      if (count > config.limit) {
        const ttl = await redis.ttl(key);
        res.setHeader("Retry-After", Math.max(ttl, 1));
        res.status(429).json({ error: "Too many requests", retryAfter: ttl });
        return false;
      }
      return true;
    } catch (err) {
      console.error("Upstash rate limit failed, falling back:", err);
      // fall through to in-memory
    }
  }

  // ── In-memory fallback ───────────────────────────────────────────
  const windowStart = now - config.windowMs;
  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    res.setHeader("X-RateLimit-Limit", config.limit);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("Retry-After", Math.max(retryAfter, 1));
    res.status(429).json({ error: "Too many requests", retryAfter: Math.max(retryAfter, 1) });
    return false;
  }

  entry.timestamps.push(now);
  res.setHeader("X-RateLimit-Limit", config.limit);
  res.setHeader("X-RateLimit-Remaining", config.limit - entry.timestamps.length);
  return true;
}
