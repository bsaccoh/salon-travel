import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './env';

const prismaLogger = logger.child({ module: 'prisma' });

const LOG_QUERIES = env.NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: LOG_QUERIES
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ]
    : [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
});

// Prisma event listeners
if (LOG_QUERIES) {
  prisma.$on('query', (e) => {
    prismaLogger.debug({ query: e.query, duration: `${e.duration}ms` }, 'query');
  });
}

prisma.$on('error', (e) => {
  prismaLogger.error({ target: e.target, message: e.message }, 'error');
});

prisma.$on('warn', (e) => {
  prismaLogger.warn({ target: e.target, message: e.message }, 'warning');
});

/**
 * Connect to PostgreSQL and verify connectivity.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    prismaLogger.info('Database connection established');
  } catch (error) {
    prismaLogger.fatal({ error }, 'Failed to connect to database');
    throw error;
  }
}

/**
 * Gracefully disconnect from PostgreSQL.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  prismaLogger.info('Database connection closed');
}
