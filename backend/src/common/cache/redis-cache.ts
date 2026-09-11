import { getRedis } from '../../config/redis';
import { createModuleLogger } from '../../config/logger';
import crypto from 'crypto';

const log = createModuleLogger('redis-cache');

/**
 * Generic Redis cache-aside utility.
 *
 * Pattern: check Redis → if miss → execute fetcher → store result in Redis
 *
 * Gracefully degrades: if Redis is unavailable, falls through to the
 * fetcher and returns the result without caching.
 */
export class RedisCache {
  private static readonly PREFIX = 'cache:';

  /**
   * Retrieve a cached value by key, or execute the fetcher and cache the result.
   *
   * @param key    Logical cache key (will be prefixed automatically)
   * @param ttlSec Time-to-live in seconds
   * @param fetcher Async function that produces the value on cache miss
   */
  async getOrSet<T>(key: string, ttlSec: number, fetcher: () => Promise<T>): Promise<T> {
    const fullKey = `${RedisCache.PREFIX}${key}`;

    try {
      const redis = getRedis();
      const cached = await redis.get(fullKey);

      if (cached !== null) {
        log.debug({ key: fullKey }, 'cache hit');
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      // Redis unavailable — fall through to fetcher
      log.warn({ err, key: fullKey }, 'cache read failed — bypassing cache');
    }

    // Cache miss — execute fetcher
    const result = await fetcher();

    // Store in Redis (fire-and-forget, don't block the response)
    try {
      const redis = getRedis();
      await redis.setex(fullKey, ttlSec, JSON.stringify(result));
      log.debug({ key: fullKey, ttlSec }, 'cache set');
    } catch (err) {
      log.warn({ err, key: fullKey }, 'cache write failed');
    }

    return result;
  }

  /**
   * Invalidate cache entries matching a glob pattern.
   *
   * @example
   *   cache.invalidate('destinations:*')   — clears all destination caches
   *   cache.invalidate('providers:slug:my-hotel') — clears a specific provider
   */
  async invalidate(pattern: string): Promise<number> {
    const fullPattern = `${RedisCache.PREFIX}${pattern}`;
    let deletedCount = 0;

    try {
      const redis = getRedis();
      let cursor = '0';

      // Use SCAN to find matching keys without blocking Redis
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      if (deletedCount > 0) {
        log.info({ pattern: fullPattern, deletedCount }, 'cache invalidated');
      }
    } catch (err) {
      log.warn({ err, pattern: fullPattern }, 'cache invalidation failed');
    }

    return deletedCount;
  }

  /**
   * Delete a single cache entry.
   */
  async delete(key: string): Promise<void> {
    const fullKey = `${RedisCache.PREFIX}${key}`;
    try {
      const redis = getRedis();
      await redis.del(fullKey);
      log.debug({ key: fullKey }, 'cache entry deleted');
    } catch (err) {
      log.warn({ err, key: fullKey }, 'cache delete failed');
    }
  }

  /**
   * Build a deterministic cache key from query parameters.
   * Sorts keys to ensure consistent hashing regardless of parameter order.
   */
  static hashQuery(params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .sort()
      .map((k) => `${k}=${String(params[k])}`)
      .join('&');

    return crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 12);
  }
}

/** Shared singleton instance */
export const cache = new RedisCache();

// ── Cache TTL Constants ──────────────────────────────────

/** Destinations change infrequently — longer TTL */
export const CACHE_TTL_DESTINATIONS = 5 * 60; // 5 minutes

/** Providers list / detail — moderate TTL */
export const CACHE_TTL_PROVIDERS = 2 * 60; // 2 minutes

/** Services catalog — moderate TTL */
export const CACHE_TTL_SERVICES = 2 * 60; // 2 minutes

/** Provider dashboard stats — shorter TTL (includes live booking data) */
export const CACHE_TTL_DASHBOARD = 30; // 30 seconds
