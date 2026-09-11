import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('audit');

export interface AuditContext {
  actorId?: string;
  actorRole?: string;
  requestId?: string;
  ipAddress?: string;
}

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Audit Service — creates immutable audit log records for
 * security and business-significant actions.
 *
 * Separate from application logging. Writes to the `audit_logs` table.
 */
export class AuditService {
  /**
   * Log an auditable action.
   */
  async log(ctx: AuditContext, entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          actorRole: ctx.actorRole,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          requestId: ctx.requestId,
          ipAddress: ctx.ipAddress,
          metadata: entry.metadata ?? Prisma.JsonNull,
        },
      });

      log.debug(
        {
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          actorId: ctx.actorId,
        },
        'Audit event recorded',
      );
    } catch (err) {
      // Audit failures should not crash the application,
      // but MUST be logged prominently for investigation
      log.error(
        {
          err,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
        },
        'CRITICAL: Failed to write audit log',
      );
    }
  }

  /**
   * Log an audit event within an existing Prisma transaction.
   * Use this when the audit record must be committed atomically
   * with the domain state change.
   */
  async logInTransaction(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    ctx: AuditContext,
    entry: AuditEntry,
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        actorId: ctx.actorId,
        actorRole: ctx.actorRole,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        metadata: entry.metadata ?? Prisma.JsonNull,
      },
    });
  }

  /**
   * Build an AuditContext from an Express request.
   */
  static contextFromRequest(req: {
    id?: unknown;
    user?: { userId: string; role: string };
    ip?: string;
  }): AuditContext {
    return {
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      requestId: req.id ? String(req.id) : undefined,
      ipAddress: req.ip,
    };
  }
}

// Singleton instance
export const auditService = new AuditService();
