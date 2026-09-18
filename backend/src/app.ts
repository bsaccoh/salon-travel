import path from 'path';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestId } from './common/middleware/requestId';
import { requestLogger } from './common/middleware/requestLogger';
import { securityHeaders } from './common/middleware/securityHeaders';
import { errorHandler } from './common/middleware/errorHandler';
import { notFound } from './common/middleware/notFound';
import { prisma } from './config/database';
import { getRedis } from './config/redis';
import { MAX_REQUEST_BODY_SIZE, API_PREFIX } from './config/constants';
import { createV1Router } from './routes/v1';

/**
 * Create and configure the Express application.
 * Separated from server.ts to support supertest in tests.
 */
export function createApp() {
  const app = express();

  // Trust first proxy (for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // ── Pre-route middleware (order matters) ──────────────

  // 1. Request ID — first in pipeline
  app.use(requestId);

  // 2. Structured request logging
  app.use(requestLogger);

  // 3. Security headers
  app.use(securityHeaders);

  // 4. CORS
  const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
      exposedHeaders: [
        'X-Request-Id',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'Retry-After',
      ],
    }),
  );

  // 5. Body parsing with size limits
  app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: MAX_REQUEST_BODY_SIZE }));
  app.use(cookieParser());

  // 6. Response compression — skip payloads under 1 KB (gzip overhead not worth it)
  app.use(compression({ threshold: 1024 }));

  // 7. Static file serving for uploads (local storage)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ── Health endpoints (outside API versioning) ─────────

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get('/ready', async (_req, res) => {
    const checks: Record<string, { status: string; latencyMs?: number }> = {};

    // Check PostgreSQL
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      checks.database = { status: 'error' };
    }

    // Check Redis
    try {
      const start = Date.now();
      const redis = getRedis();
      await redis.ping();
      checks.redis = { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      checks.redis = { status: 'error' };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'ok');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  // ── API v1 routes ────────────────────────────────────
  const v1Router = createV1Router();
  app.use(API_PREFIX, v1Router);

  // ── Post-route middleware ─────────────────────────────

  // 404 catch-all
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
