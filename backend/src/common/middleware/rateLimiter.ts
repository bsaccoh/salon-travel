import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../../config/redis';
import { RATE_LIMITS } from '../../config/constants';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('rate-limiter');

type RateLimitTier = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
}

/**
 * Check rate limit using Redis sliding-window counter.
 */
async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSec;

  const multi = redis.multi();
  // Remove expired entries
  multi.zremrangebyscore(key, 0, windowStart);
  // Add current request
  multi.zadd(key, now.toString(), `${now}:${Math.random().toString(36).slice(2)}`);
  // Count requests in window
  multi.zcard(key);
  // Set TTL to auto-cleanup
  multi.expire(key, windowSec);

  const results = await multi.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    allowed: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt: now + windowSec,
  };
}

/**
 * Set rate-limit response headers.
 */
function setRateLimitHeaders(res: Response, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt);
}

/**
 * Rate limiting middleware factory.
 *
 * Uses Redis sorted sets for a sliding-window counter per key.
 * Keys are based on authenticated user ID or client IP.
 *
 * @example
 * router.post('/auth/login', rateLimit('AUTH_UNAUTHENTICATED'), controller.login);
 * router.get('/services', rateLimit('READ_AUTHENTICATED'), controller.list);
 */
export function rateLimit(tier: RateLimitTier) {
  const config = RATE_LIMITS[tier];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Build rate limit key: use user ID if authenticated, otherwise IP
      const identifier = req.user?.userId || req.ip || 'unknown';
      const key = `rl:${tier}:${identifier}`;

      const result = await checkRateLimit(key, config.max, config.windowSec);
      setRateLimitHeaders(res, result);

      if (!result.allowed) {
        const retryAfter = result.resetAt - Math.floor(Date.now() / 1000);
        res.setHeader('Retry-After', Math.max(1, retryAfter));

        res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
            requestId: req.id || 'unknown',
            details: { retryAfter: Math.max(1, retryAfter) },
            fields: [],
          },
        });
        return;
      }

      next();
    } catch (err) {
      // If Redis is down, allow the request through but log the error
      log.error({ err, tier }, 'Rate limiter error — allowing request');
      next();
    }
  };
}
