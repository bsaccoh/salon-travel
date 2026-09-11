import { Principal } from '../../common/types/principal';
import { Booking, UserRole } from '@prisma/client';

export class BookingPolicy {
  static canView(principal: Principal, booking: Booking & { provider?: { userId?: string } }): boolean {
    if (principal.role === UserRole.admin || principal.role === UserRole.concierge) {
      return true;
    }
    if (principal.role === UserRole.traveler && booking.travelerId === principal.userId) {
      return true;
    }
    if (principal.role === UserRole.provider && booking.provider?.userId === principal.userId) {
      return true;
    }
    return false;
  }

  static canCancel(principal: Principal, booking: Booking & { provider?: { userId?: string } }): boolean {
    if (principal.role === UserRole.admin || principal.role === UserRole.concierge) {
      return true;
    }
    if (principal.role === UserRole.traveler && booking.travelerId === principal.userId) {
      return true;
    }
    if (principal.role === UserRole.provider && booking.provider?.userId === principal.userId) {
      return true;
    }
    return false;
  }

  static canAcceptOrDecline(principal: Principal, providerUserId: string): boolean {
    return principal.userId === providerUserId || principal.role === UserRole.admin;
  }
}
