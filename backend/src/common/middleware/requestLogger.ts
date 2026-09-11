import pinoHttp from 'pino-http';
import { logger } from '../../config/logger';
import type { IncomingMessage } from 'http';

/**
 * Structured HTTP request/response logging via pino-http.
 * Uses the request ID set by the requestId middleware.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => {
    return (req as IncomingMessage & { id?: string }).id || 'unknown';
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed ${res.statusCode}`;
  },
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} errored ${res.statusCode}`;
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
