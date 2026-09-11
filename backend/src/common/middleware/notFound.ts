import { Request, Response, NextFunction } from 'express';

/**
 * Catch-all 404 handler for unmatched routes.
 * Registered after all other routes but before the error handler.
 */
export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.id || 'unknown',
      details: {},
      fields: [],
    },
  });
}
