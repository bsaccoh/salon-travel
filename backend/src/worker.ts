import { Worker } from 'bullmq';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { createRedisClient, disconnectRedis } from './config/redis';
import { QUEUE_NAMES } from './jobs/queues';
import { NotificationProcessor, MaintenanceProcessor, BookingProcessor } from './jobs/processors';

const log = logger.child({ module: 'worker' });

async function startWorker(): Promise<void> {
  log.info({ nodeEnv: env.NODE_ENV }, 'Starting Salone Travel Background Worker');

  // Connect to PostgreSQL
  await connectDatabase();

  const notificationProcessor = new NotificationProcessor();
  const maintenanceProcessor = new MaintenanceProcessor();
  const bookingProcessor = new BookingProcessor();

  const workers: Worker[] = [];

  // 1. Notifications Worker
  const notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => notificationProcessor.process(job),
    {
      connection: createRedisClient('worker:notifications'),
      concurrency: 5,
    },
  );
  workers.push(notificationWorker);

  // 2. Booking Worker
  const bookingWorker = new Worker(
    QUEUE_NAMES.BOOKING,
    async (job) => bookingProcessor.process(job),
    {
      connection: createRedisClient('worker:booking'),
      concurrency: 3,
    },
  );
  workers.push(bookingWorker);

  // 3. Maintenance Worker
  const maintenanceWorker = new Worker(
    QUEUE_NAMES.MAINTENANCE,
    async (job) => maintenanceProcessor.process(job),
    {
      connection: createRedisClient('worker:maintenance'),
      concurrency: 1,
    },
  );
  workers.push(maintenanceWorker);

  // Register worker event listeners
  for (const worker of workers) {
    worker.on('completed', (job) => {
      log.info({ queueName: worker.name, jobId: job.id }, 'Job completed successfully');
    });

    worker.on('failed', (job, err) => {
      log.error(
        { queueName: worker.name, jobId: job?.id, attemptsMade: job?.attemptsMade, err },
        'Job failed',
      );
    });

    worker.on('error', (err) => {
      log.error({ queueName: worker.name, err }, 'Worker error occurred');
    });
  }

  log.info(
    { workerCount: workers.length },
    'All background workers started and listening for jobs',
  );

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.info({ signal }, 'Worker shutdown initiated');

    for (const worker of workers) {
      await worker.close();
      log.info({ queueName: worker.name }, 'Worker closed');
    }

    await disconnectDatabase();
    await disconnectRedis();
    log.info('All worker connections closed — exiting');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startWorker().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal worker error:', err);
  process.exit(1);
});
