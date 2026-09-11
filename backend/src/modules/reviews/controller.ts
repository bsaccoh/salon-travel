import { Request, Response, NextFunction } from 'express';
import { reviewService, ReviewService } from './service';
import { sendCreated, sendSuccess, sendCollection } from '../../common/responses';
import { AuditService } from '../audit';
import { CreateReviewInput, UpdateReviewInput, ModerateReviewInput, ListReviewsQuery } from './schemas';

export class ReviewController {
  constructor(private readonly service: ReviewService = reviewService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as CreateReviewInput;
      const context = AuditService.contextFromRequest(req);

      const review = await this.service.createReview(userId, input, context);

      sendCreated(res, review);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const input = req.body as UpdateReviewInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.updateReview(userId, id, input, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  moderate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const input = req.body as ModerateReviewInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.moderateReview(adminId, id, input, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  listByProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { providerId } = req.params;
      const query = req.query as unknown as ListReviewsQuery;

      const result = await this.service.listProviderReviews(providerId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };
}

export const reviewController = new ReviewController();
