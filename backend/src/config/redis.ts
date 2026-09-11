import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const redisLogger = logger.child({ module: 'redis' });

let redis: Redis | null = null;

/**
 * Get the shared Redis client instance.
 * Lazily created on first call.
 */
export function getRedis(): Redis {
  if (!redis) {
    redis = createRedisClient('main');
  }
  return redis;
}

/**
 * Create a new Redis client instance.
 * BullMQ requires its own connections, so this is also used for queue clients.
 */
export function createRedisClient(name = 'default'): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      // Don't retry at all in dev to prevent crashing when Redis is missing
      if (env.NODE_ENV === 'development') {
        redisLogger.warn({ name }, 'Redis not available in dev, disabling retries');
        return null;
      }
      if (times > 10) {
        redisLogger.error({ name }, 'Redis connection retries exhausted');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
  });

  client.on('error', () => {
    // Suppress error logs in dev to prevent spam when Redis is missing
    if (env.NODE_ENV !== 'development') {
      redisLogger.error({ name }, 'Redis client error');
    }
  });

  return client;
}

/**
 * Gracefully close the shared Redis connection.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    redisLogger.info('Redis connection closed');
  }
}
