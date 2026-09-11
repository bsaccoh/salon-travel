import { Request, Response, NextFunction } from 'express';
import { storageService, StorageService } from './service';
import { sendCreated, sendSuccess } from '../../common/responses';
import { DirectUploadInput, PresignedUrlInput } from './schemas';

export class StorageController {
  constructor(private readonly service: StorageService = storageService) {}

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as DirectUploadInput;
      const result = await this.service.uploadBase64(input);
      sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  };

  getPresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as PresignedUrlInput;
      const result = await this.service.generatePresignedUrl(input);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const storageController = new StorageController();
