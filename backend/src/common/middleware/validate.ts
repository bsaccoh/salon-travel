import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Zod validation middleware factory.
 * Validates request body, query params, and/or route params against strict Zod schemas.
 * Returns 422 with per-field errors on validation failure.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: `params.${e.path.join('.')}`,
            message: e.message,
            code: e.code,
          })),
        );
      }
    }

    try {
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: `query.${e.path.join('.')}`,
            message: e.message,
            code: e.code,
          })),
        );
      }
    }

    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        );
      }
    }

    if (errors.length > 0) {
      _res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          requestId: req.id || 'unknown',
          details: {},
          fields: errors,
        },
      });
      return;
    }

    next();
  };
}
