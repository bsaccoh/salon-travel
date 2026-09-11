import { Request, Response, NextFunction } from 'express';
import { destinationService, DestinationService } from './service';
import { sendCreated, sendSuccess, sendCollection, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { CreateDestinationInput, UpdateDestinationInput, ListDestinationsQuery } from './schemas';

export class DestinationController {
  constructor(private readonly service: DestinationService = destinationService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListDestinationsQuery;
      const isAdmin = req.user?.role === 'admin';
      const result = await this.service.list(query, isAdmin);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const isAdmin = req.user?.role === 'admin';
      const destination = await this.service.getBySlug(slug, isAdmin);

      sendSuccess(res, destination);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateDestinationInput;
      const context = AuditService.contextFromRequest(req);
      const destination = await this.service.create(input, context);

      sendCreated(res, destination);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input = req.body as UpdateDestinationInput;
      const context = AuditService.contextFromRequest(req);
      const updated = await this.service.update(id, input, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);
      await this.service.softDelete(id, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const destinationController = new DestinationController();
