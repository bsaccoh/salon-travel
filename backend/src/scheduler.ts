import { env } from './config/env';
import { logger } from './config/logger';
import { getQueue, closeQueues, QUEUE_NAMES } from './jobs/queues';
import { disconnectRedis } from './config/redis';

const log = logger.child({ module: 'scheduler' });

interface ScheduledJobDef {
  queueName: string;
  jobName: string;
  data: Record<string, unknown>;
  cron: string;
}

const SCHEDULED_JOBS: ScheduledJobDef[] = [
  {
    queueName: QUEUE_NAMES.BOOKING,
    jobName: 'check-expired-bookings',
    data: { action: 'check_expired_bookings' },
    cron: '*/5 * * * *', // Every 5 minutes
  },
  {
    queueName: QUEUE_NAMES.MAINTENANCE,
    jobName: 'cleanup-stale-verifications',
    data: { action: 'cleanup_stale_verifications' },
    cron: '0 * * * *', // Every hour
  },
  {
    queueName: QUEUE_NAMES.MAINTENANCE,
    jobName: 'cleanup-expired-sessions',
    data: { action: 'cleanup_expired_sessions' },
    cron: '0 3 * * *', // Daily at 3:00 AM UTC
  },
];

async function startScheduler(): Promise<void> {
  log.info({ nodeEnv: env.NODE_ENV }, 'Starting Salone Travel Scheduler');

  // Register repeatable jobs in BullMQ queues
  for (const jobDef of SCHEDULED_JOBS) {
    const queue = getQueue(jobDef.queueName as any);

    // BullMQ deduplicates repeatable jobs across instances based on name + repeat pattern
    await queue.add(jobDef.jobName, jobDef.data, {
      repeat: {
        pattern: jobDef.cron,
      },
      jobId: `repeatable:${jobDef.jobName}`,
    });

    log.info(
      { jobName: jobDef.jobName, queue: jobDef.queueName, cron: jobDef.cron },
      'Registered scheduled repeatable job',
    );
  }

  log.info({ totalScheduledJobs: SCHEDULED_JOBS.length }, 'Scheduler running successfully');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.info({ signal }, 'Scheduler shutdown initiated');

    await closeQueues();
    await disconnectRedis();
    log.info('Scheduler closed — exiting');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startScheduler().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal scheduler error:', err);
  process.exit(1);
});
