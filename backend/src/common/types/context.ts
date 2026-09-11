import { Request } from 'express';

export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
}

export function contextFromRequest(req: Request): RequestContext {
  return {
    requestId: (req as any).id || (req.headers['x-request-id'] as string) || 'req_unknown',
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
}
