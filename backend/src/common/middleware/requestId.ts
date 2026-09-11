import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const REQUEST_ID_HEADER = 'x-request-id';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Augment Express Request type with `id`
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Assign a unique request ID to every incoming request.
 * Accepts a valid UUID from the client via X-Request-Id, or generates one.
 * Echoes the ID back in the response header.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const clientId = req.headers[REQUEST_ID_HEADER] as string | undefined;

  const id = clientId && UUID_REGEX.test(clientId) ? clientId : uuidv4();

  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);

  next();
}
