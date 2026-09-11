import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis, getRedis } from './config/redis';
import { setupWebSocketServer } from './websocket/server';

async function bootstrap(): Promise<void> {
  logger.info({ nodeEnv: env.NODE_ENV, port: env.PORT }, 'Starting Salone Travel Concierge API');

  // Connect to PostgreSQL
  await connectDatabase();

  // Verify Redis connectivity (optional — app works without it in dev)
  try {
    const redis = getRedis();
    await redis.ping();
    logger.info('Redis connection verified');
  } catch (err) {
    logger.warn('Redis unavailable — running without cache/sessions. Install Redis for full functionality.');
  }

  // Create Express app
  const app = createApp();

  // Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server listening');
  });

  // Attach WebSocket Server
  setupWebSocketServer(server);

  // ── Graceful shutdown ─────────────────────────────────

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('All connections closed — exiting');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection');
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start application:', err);
  process.exit(1);
});
