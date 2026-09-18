import { Request, Response, NextFunction } from 'express';
import { adminService, AdminService } from './service';
import { sendSuccess, sendCollection, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { ListUsersQuery, UserStatusActionInput, CreateUserInput } from './schemas';
import { ListBookingsQuery } from '../bookings/schemas';
import { ListReviewsQuery } from '../reviews/schemas';

export class AdminController {
  constructor(private readonly service: AdminService = adminService) {}

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListUsersQuery;
      const result = await this.service.listUsers(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);

      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateUserInput;
      const user = await this.service.createUser(input);
      sendSuccess(res, user, 201);
    } catch (err) {
      next(err);
    }
  };

  suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input = req.body as UserStatusActionInput;
      const context = AuditService.contextFromRequest(req);

      await this.service.suspendUser(id, input, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  reactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      await this.service.reactivateUser(id, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  listBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListBookingsQuery;
      const result = await this.service.listBookings(query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this.service.getBookingById(id);

      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  };
  getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };

  listReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListReviewsQuery;
      const result = await this.service.listReviews(query);
      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getMonthlyChart = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chart = await this.service.getMonthlyChart();
      sendSuccess(res, chart);
    } catch (err) {
      next(err);
    }
  };

  getActivityFeed = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feed = await this.service.getActivityFeed();
      sendSuccess(res, feed);
    } catch (err) {
      next(err);
    }
  };

  getConciergeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conciergeId = req.user!.userId;
      const stats = await this.service.getConciergeStats(conciergeId);
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };
}

export const adminController = new AdminController();
