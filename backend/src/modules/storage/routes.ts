import { Router } from 'express';
import { storageController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { directUploadSchema, presignedUrlSchema } from './schemas';

export const storageRoutes = Router();

storageRoutes.post(
  '/upload',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: directUploadSchema }),
  storageController.upload,
);

storageRoutes.post(
  '/presigned-url',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: presignedUrlSchema }),
  storageController.getPresignedUrl,
);
