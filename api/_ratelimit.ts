import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Shared rate limiter for API endpoints.
 *
 * Requires two Vercel env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * If not configured, rate limiting is skipped (graceful fallback).
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// Lazy-init redis + limiters to avoid errors when env vars missing
let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: UPSTASH_URL!,
      token: UPSTASH_TOKEN!,
    });
  }
  return redis;
}

type RateLimitConfig = {
  /** Unique prefix for this endpoint (e.g. "set-role", "notify-order") */
  prefix: string;
  /** Max requests per window */
  limit: number;
  /** Window duration string (e.g. "1 m", "10 s", "1 h") */
  window: `${number} ${"s" | "m" | "h" | "d"}`;
};

function getLimiter(config: RateLimitConfig): Ratelimit {
  if (!limiters.has(config.prefix)) {
    limiters.set(
      config.prefix,
      new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(config.limit, config.window),
        prefix: `ratelimit:${config.prefix}`,
        analytics: true,
      })
    );
  }
  return limiters.get(config.prefix)!;
}

/**
 * Get a rate limit key from the request.
 * Uses Firebase UID if available (from decoded token), falls back to IP.
 */
export function getRateLimitKey(req: VercelRequest, uid?: string): string {
  if (uid) return `uid:${uid}`;
  // Vercel provides x-forwarded-for, x-real-ip
  const ip =
    (req.headers["x-real-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    "unknown";
  return `ip:${ip}`;
}

/**
 * Check rate limit. Returns true if request should proceed, false if blocked.
 * Sets appropriate headers on the response.
 *
 * If Upstash is not configured, always returns true (graceful fallback).
 */
export async function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig,
  identifier?: string
): Promise<boolean> {
  if (!isConfigured) return true; // Graceful fallback

  const key = identifier || getRateLimitKey(req);

  try {
    const limiter = getLimiter(config);
    const result = await limiter.limit(key);

    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", result.reset);

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        error: "Too many requests",
        retryAfter,
      });
      return false;
    }

    return true;
  } catch (err) {
    // Redis error — don't block the request, log and continue
    console.error(`Rate limit check failed (${config.prefix}):`, err);
    return true;
  }
}
