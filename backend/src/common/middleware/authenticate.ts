import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthenticationError } from '../errors';

/** JWT payload structure matching our access token claims. */
export interface JwtPayload {
  sub: string; // userId
  role: string; // userRole
  jti: string; // sessionId
  iat: number;
  exp: number;
}

// Augment Express Request with authenticated user context
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user context (set by authenticate middleware) */
      user?: {
        userId: string;
        role: string;
        sessionId: string;
      };
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts and validates the Bearer token from the Authorization header.
 * Sets `req.user` with the decoded payload on success.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, env.JWT_SIGNING_KEY) as JwtPayload;

    req.user = {
      userId: decoded.sub,
      role: decoded.role,
      sessionId: decoded.jti,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token');
    }
    throw new AuthenticationError();
  }
}

/**
 * Optional authentication middleware.
 * Sets `req.user` if a valid token is present, but doesn't fail if missing.
 * Useful for endpoints that behave differently for authenticated vs anonymous users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SIGNING_KEY) as JwtPayload;
    req.user = {
      userId: decoded.sub,
      role: decoded.role,
      sessionId: decoded.jti,
    };
  } catch {
    // Invalid token in optional auth — proceed without user context
  }

  next();
}
