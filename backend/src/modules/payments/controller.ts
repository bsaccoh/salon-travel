import { Request, Response, NextFunction } from 'express';
import { paymentService, PaymentService } from './service';
import { sendCreated, sendSuccess, sendCollection } from '../../common/responses';
import { AuditService } from '../audit';
import { CreatePaymentIntentInput, ListPaymentsQuery } from './schemas';

export class PaymentController {
  constructor(private readonly service: PaymentService = paymentService) {}

  createIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const travelerId = req.user!.userId;
      const input = req.body as CreatePaymentIntentInput;
      const idempotencyKey = req.header('Idempotency-Key');
      const context = AuditService.contextFromRequest(req);

      const intent = await this.service.createPaymentIntent(
        travelerId,
        input,
        idempotencyKey,
        context,
      );

      sendCreated(res, intent);
    } catch (err) {
      next(err);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'];
      const rawBody = (req as any).rawBody || req.body;
      const context = AuditService.contextFromRequest(req);

      const result = await this.service.handleWebhookEvent(rawBody, signature, context);

      res.status(result.duplicate ? 200 : 204).end();
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.service.getPaymentById(id);

      sendSuccess(res, payment);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListPaymentsQuery;
      const result = await this.service.listPayments(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };
}

export const paymentController = new PaymentController();
