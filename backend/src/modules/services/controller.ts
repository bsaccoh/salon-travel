import { Request, Response, NextFunction } from 'express';
import { servicesService, ServicesService } from './service';
import { sendCreated, sendSuccess, sendCollection, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { CreateServiceInput, UpdateServiceInput, ListServicesQuery } from './schemas';

export class ServiceController {
  constructor(private readonly service: ServicesService = servicesService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as CreateServiceInput;
      const context = AuditService.contextFromRequest(req);

      const created = await this.service.createService(userId, input, context);

      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  listOwn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as ListServicesQuery;

      const result = await this.service.getOwnServices(userId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getOwnById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const service = await this.service.getOwnServiceById(userId, id);

      sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  };

  updateOwn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const input = req.body as UpdateServiceInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.updateOwnService(userId, id, input, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deleteOwn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      await this.service.deleteOwnService(userId, id, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  listPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { providerId } = req.params;
      const query = req.query as unknown as ListServicesQuery;

      const result = await this.service.listPublicProviderServices(providerId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  listPublicAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListServicesQuery;
      const result = await this.service.listPublicAllServices(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getPublicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.service.getPublicServiceById(id);

      sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  };
}

export const serviceController = new ServiceController();
