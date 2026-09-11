import { Request, Response, NextFunction } from 'express';
import { providerDocumentsService, ProviderDocumentsService } from './service';
import { sendCreated, sendSuccess, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { UploadDocumentInput } from './schemas';

export class ProviderDocumentController {
  constructor(private readonly service: ProviderDocumentsService = providerDocumentsService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const documents = await this.service.listDocuments(userId);

      sendSuccess(res, documents);
    } catch (err) {
      next(err);
    }
  };

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as UploadDocumentInput;
      const context = AuditService.contextFromRequest(req);

      const document = await this.service.uploadDocument(userId, input, context);

      sendCreated(res, document);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      await this.service.deleteDocument(userId, id, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const providerDocumentController = new ProviderDocumentController();
