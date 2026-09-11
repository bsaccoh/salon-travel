import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getRedis } from '../../config/redis';
import { IDEMPOTENCY_TTL_SECONDS } from '../../config/constants';
import { ConflictError } from '../errors';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('idempotency');

const IDEMPOTENCY_HEADER = 'idempotency-key';
const KEY_PREFIX = 'idem:';

interface CachedResponse {
  statusCode: number;
  body: unknown;
  payloadHash: string;
}

/**
 * Compute a hash of the request payload for mismatch detection.
 */
function hashPayload(body: unknown): string {
  const normalized = JSON.stringify(body || {});
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/**
 * Idempotency middleware factory.
 *
 * Ensures that mutating operations with the same Idempotency-Key
 * return the original response instead of executing again.
 *
 * Detects mismatched payload reuse of the same key (returns 409).
 *
 * @example
 * router.post('/bookings', authenticate, idempotency(), controller.create);
 * router.post('/payments/intents', authenticate, idempotency(), controller.createIntent);
 */
export function idempotency() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.headers[IDEMPOTENCY_HEADER] as string | undefined;

    if (!key) {
      // No idempotency key — proceed normally
      return next();
    }

    // Validate key format (UUID or string up to 255 chars)
    if (key.length > 255) {
      res.status(400).json({
        error: {
          code: 'INVALID_IDEMPOTENCY_KEY',
          message: 'Idempotency-Key must be 255 characters or fewer',
          requestId: req.id || 'unknown',
          details: {},
          fields: [],
        },
      });
      return;
    }

    const redis = getRedis();
    const redisKey = `${KEY_PREFIX}${key}`;
    const payloadHash = hashPayload(req.body);

    try {
      // Check for existing cached response
      const cached = await redis.get(redisKey);

      if (cached) {
        const parsed: CachedResponse = JSON.parse(cached);

        // Detect payload mismatch (same key, different payload)
        if (parsed.payloadHash !== payloadHash) {
          throw new ConflictError(
            'Idempotency-Key has been used with a different request payload',
            'IDEMPOTENCY_KEY_MISMATCH',
          );
        }

        // Return cached response
        log.debug({ key, requestId: req.id }, 'Returning cached idempotent response');
        res.status(parsed.statusCode).json(parsed.body);
        return;
      }

      // Intercept the response to cache it
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        // Cache the response
        const cached: CachedResponse = {
          statusCode: res.statusCode,
          body,
          payloadHash,
        };

        redis.setex(redisKey, IDEMPOTENCY_TTL_SECONDS, JSON.stringify(cached)).catch((err) => {
          log.error({ err, key }, 'Failed to cache idempotent response');
        });

        return originalJson(body);
      };

      next();
    } catch (err) {
      if (err instanceof ConflictError) {
        return next(err);
      }
      // If Redis is down, proceed without idempotency
      log.error({ err }, 'Idempotency check error — proceeding without');
      next();
    }
  };
}
