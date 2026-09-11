import { Request, Response, NextFunction } from 'express';
import { bookingService, BookingService } from './service';
import { sendCreated, sendSuccess, sendCollection } from '../../common/responses';
import { AuditService } from '../audit';
import { UserRole } from '@prisma/client';
import { CreateBookingInput, BookingActionInput, ListBookingsQuery } from './schemas';

export class BookingController {
  constructor(private readonly service: BookingService = bookingService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const travelerId = req.user!.userId;
      const input = req.body as CreateBookingInput;
      const context = AuditService.contextFromRequest(req);

      const booking = await this.service.createBooking(travelerId, input, context);

      sendCreated(res, booking);
    } catch (err) {
      next(err);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const travelerId = req.user!.userId;
      const query = req.query as unknown as ListBookingsQuery;

      const result = await this.service.listTravelerBookings(travelerId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getProviderBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as ListBookingsQuery;

      const result = await this.service.listProviderBookings(userId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;
      const { id } = req.params;

      const booking = await this.service.getBookingById(userId, userRole, id);

      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  };

  accept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.acceptBooking(userId, id, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  decline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body as BookingActionInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.declineBooking(userId, id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;
      const { id } = req.params;
      const { reason } = req.body as BookingActionInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.cancelBooking(userId, userRole, id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.completeBooking(userId, id, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  noShow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body as BookingActionInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.noShowBooking(userId, id, reason, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };
}

export const bookingController = new BookingController();
