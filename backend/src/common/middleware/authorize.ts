import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError, NotFoundError } from '../errors';
import type { UserRole } from '../../config/constants';

/**
 * Role-based authorization middleware factory.
 *
 * Level 1: Role permission check.
 * Verifies the authenticated user has one of the allowed roles.
 *
 * @example
 * router.get('/admin/users', authenticate, authorize('admin'), controller.listUsers);
 * router.get('/dashboard', authenticate, authorize('admin', 'concierge'), controller.dashboard);
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AuthorizationError('You do not have permission to access this resource');
    }

    next();
  };
}

/**
 * Resource ownership check helper.
 *
 * Level 2: Resource ownership.
 * Returns 404 (not 403) when a user tries to access another user's resource,
 * to avoid revealing that the resource exists.
 *
 * This is NOT middleware — it's a helper used inside controllers/services
 * after the resource is loaded from the database.
 *
 * @example
 * const booking = await bookingRepository.findById(req.params.id);
 * if (!booking) throw new NotFoundError('Booking');
 * assertOwnership(req, booking.travelerId);
 */
export function assertOwnership(req: Request, resourceOwnerId: string): void {
  if (!req.user) {
    throw new AuthenticationError();
  }

  // Admins and concierges can access any resource
  if (req.user.role === 'admin' || req.user.role === 'concierge') {
    return;
  }

  if (req.user.userId !== resourceOwnerId) {
    // Return 404 to not reveal resource existence
    throw new NotFoundError('Resource');
  }
}
