import pino from 'pino';
import { env } from './env';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'refreshToken',
  'refresh_token',
  'accessToken',
  'access_token',
  'secret',
  'apiKey',
  'api_key',
  'cvv',
  'cardNumber',
  'card_number',
  'signingKey',
  'signing_key',
];

export const logger = pino({
  name: 'salone-travel',
  level: env.LOG_LEVEL,
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

/**
 * Create a child logger scoped to a specific module.
 */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}
