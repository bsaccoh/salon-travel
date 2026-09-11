import { Request, Response, NextFunction } from 'express';
import { providerService, ProviderService } from './service';
import { sendCreated, sendSuccess, sendCollection } from '../../common/responses';
import { AuditService } from '../audit';
import { CreateProviderInput, UpdateProviderInput, ListProvidersQuery, AdminProviderActionInput } from './schemas';

export class ProviderController {
  constructor(private readonly service: ProviderService = providerService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as CreateProviderInput;
      const context = AuditService.contextFromRequest(req);

      const provider = await this.service.createProvider(userId, input, context);

      sendCreated(res, provider);
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const provider = await this.service.getOwnProvider(userId);

      sendSuccess(res, provider);
    } catch (err) {
      next(err);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const provider = await this.service.getOwnProvider(userId);
      const stats = await this.service.getDashboardStats(provider.id);

      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as UpdateProviderInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.updateOwnProvider(userId, input, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  submitForVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.submitForVerification(userId, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  listPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListProvidersQuery;
      const result = await this.service.listPublic(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const provider = await this.service.getPublicBySlug(slug);

      sendSuccess(res, provider);
    } catch (err) {
      next(err);
    }
  };

  // ── Admin Handlers ─────────────────────────────────────

  listAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListProvidersQuery;
      const result = await this.service.listAdmin(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getAdminById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const provider = await this.service.getAdminById(id);

      sendSuccess(res, provider);
    } catch (err) {
      next(err);
    }
  };

  review = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.reviewProvider(id, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.approveProvider(id, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  requestChanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body as AdminProviderActionInput;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.requestChanges(id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body as AdminProviderActionInput;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.rejectProvider(id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  suspend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body as AdminProviderActionInput;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.suspendProvider(id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  reinstate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.reinstateProvider(id, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };
}

export const providerController = new ProviderController();
