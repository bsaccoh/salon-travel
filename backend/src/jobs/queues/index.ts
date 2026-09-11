import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { createRedisClient } from '../../config/redis';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('bullmq-queues');

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  BOOKING: 'booking',
  PAYMENTS: 'payments',
  MEDIA: 'media',
  ANALYTICS: 'analytics',
  MAINTENANCE: 'maintenance',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s, 8s, 16s
  },
  removeOnComplete: {
    count: 1000,
    age: 24 * 3600, // 24 hours
  },
  removeOnFail: {
    count: 5000,
    age: 7 * 24 * 3600, // 7 days
  },
};

const queues: Map<string, Queue> = new Map();

/**
 * Get or create a BullMQ Queue instance.
 */
export function getQueue<T = any>(name: QueueName): Queue<T> {
  if (!queues.has(name)) {
    const connection = createRedisClient(`queue:${name}`);
    const queueOptions: QueueOptions = {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    };

    const queue = new Queue<T>(name, queueOptions);
    queues.set(name, queue);
    log.info({ queueName: name }, 'Queue initialized');
  }

  return queues.get(name) as Queue<T>;
}

/**
 * Close all queue connections gracefully.
 */
export async function closeQueues(): Promise<void> {
  for (const [name, queue] of queues.entries()) {
    try {
      await queue.close();
      log.info({ queueName: name }, 'Queue closed');
    } catch (err) {
      log.error({ err, queueName: name }, 'Error closing queue');
    }
  }
  queues.clear();
}
