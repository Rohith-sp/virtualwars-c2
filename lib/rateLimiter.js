import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * Allows 10 requests per 60-second window per IP.
 * This module is safe to import from any API route.
 */
let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
    });
  } catch (e) {
    console.error('[VoteGuide] Failed to initialize rate limiter:', e.message);
  }
}

export { ratelimit };
