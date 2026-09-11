import { Router } from 'express';
import { providerDocumentController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { uploadDocumentSchema } from './schemas';

export const providerDocumentRoutes = Router();

providerDocumentRoutes.get(
  '/',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  providerDocumentController.list,
);

providerDocumentRoutes.post(
  '/',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: uploadDocumentSchema }),
  providerDocumentController.upload,
);

providerDocumentRoutes.delete(
  '/:id',
  authenticate,
  rateLimit('WRITE'),
  providerDocumentController.delete,
);
