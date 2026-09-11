import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../../config/logger';
import { isProduction } from '../../config/env';

/**
 * Global error handler — must be registered LAST in the middleware chain.
 *
 * Converts all errors into the standard error envelope:
 * { error: { code, message, requestId, details, fields } }
 *
 * Never exposes stack traces, SQL errors, or Prisma internals in production.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.id || 'unknown';

  // ── AppError (known operational or non-operational) ──
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, requestId, code: err.code }, 'Non-operational error');
    } else {
      logger.warn({ requestId, code: err.code, message: err.message }, 'Operational error');
    }

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
        fields: err.fields,
      },
    });
    return;
  }

  // ── Zod validation errors ────────────────────────────
  if (err instanceof ZodError) {
    const fields = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    logger.warn({ requestId, fieldCount: fields.length }, 'Validation error');

    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        requestId,
        details: {},
        fields,
      },
    });
    return;
  }

  // ── Express body-parser errors ───────────────────────
  if ('type' in err && (err as Record<string, unknown>).type === 'entity.too.large') {
    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the size limit',
        requestId,
        details: {},
        fields: [],
      },
    });
    return;
  }

  if ('type' in err && (err as Record<string, unknown>).type === 'entity.parse.failed') {
    res.status(400).json({
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'Could not parse request body',
        requestId,
        details: {},
        fields: [],
      },
    });
    return;
  }

  // ── Unknown / unhandled errors ───────────────────────
  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      requestId,
      details: {},
      fields: [],
    },
  });
}
