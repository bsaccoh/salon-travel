import { Request, Response, NextFunction } from 'express';
import { refundService, RefundService } from './service';
import { sendCreated, sendSuccess, sendCollection } from '../../common/responses';
import { AuditService } from '../audit';
import { UserRole } from '@prisma/client';
import { CreateRefundInput, ListRefundsQuery } from './schemas';

export class RefundController {
  constructor(private readonly service: RefundService = refundService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      const actorId = req.user!.userId;
      const actorRole = req.user!.role as UserRole;
      const input = req.body as CreateRefundInput;
      const context = AuditService.contextFromRequest(req);

      const refund = await this.service.createRefund(
        paymentId,
        actorId,
        actorRole,
        input,
        context,
      );

      sendCreated(res, refund);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const refund = await this.service.getRefundById(id);

      sendSuccess(res, refund);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListRefundsQuery;
      const result = await this.service.listRefunds(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };
}

export const refundController = new RefundController();
