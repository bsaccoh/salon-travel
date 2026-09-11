/**
 * Base application error class.
 * All domain/operational errors should extend this.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details: Record<string, unknown>;
  public readonly fields: Array<{ field: string; message: string; code: string }>;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    isOperational?: boolean;
    details?: Record<string, unknown>;
    fields?: Array<{ field: string; message: string; code: string }>;
  }) {
    super(params.message);
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.isOperational = params.isOperational ?? true;
    this.details = params.details ?? {};
    this.fields = params.fields ?? [];

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 400 ─────────────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super({ statusCode: 400, code, message });
  }
}

// ── 401 ─────────────────────────────────────────────────
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTHENTICATION_ERROR') {
    super({ statusCode: 401, code, message });
  }
}

// ── 403 ─────────────────────────────────────────────────
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'AUTHORIZATION_ERROR') {
    super({ statusCode: 403, code, message });
  }
}

// ── 404 ─────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    super({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
    });
  }
}

// ── 409 ─────────────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super({ statusCode: 409, code, message });
  }
}

export class VersionMismatchError extends ConflictError {
  constructor(resource = 'Resource') {
    super(`${resource} has been modified by another request`, 'VERSION_MISMATCH');
  }
}

// ── 422 ─────────────────────────────────────────────────
export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    fields?: Array<{ field: string; message: string; code: string }>,
  ) {
    super({ statusCode: 422, code: 'VALIDATION_ERROR', message, fields });
  }
}

// ── 429 ─────────────────────────────────────────────────
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super({
      statusCode: 429,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: retryAfter ? { retryAfter } : {},
    });
  }
}

// ── 500 ─────────────────────────────────────────────────
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super({ statusCode: 500, code: 'INTERNAL_ERROR', message, isOperational: false });
  }
}

// ── 502 ─────────────────────────────────────────────────
export class UpstreamError extends AppError {
  constructor(service: string) {
    super({
      statusCode: 502,
      code: 'UPSTREAM_ERROR',
      message: `An upstream service (${service}) encountered an error`,
    });
  }
}

// ── 503 ─────────────────────────────────────────────────
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super({ statusCode: 503, code: 'SERVICE_UNAVAILABLE', message });
  }
}
