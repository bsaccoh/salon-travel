import { Principal } from '../../common/types/principal';
import { UserRole, RefundReason } from '@prisma/client';

export const ADMIN_REFUND_THRESHOLD_CENTS = 50000; // $500.00

export class RefundPolicy {
  static canInitiateRefund(principal: Principal): boolean {
    return principal.role === UserRole.admin || principal.role === UserRole.concierge;
  }

  static requiresAdminApproval(reason: RefundReason, amountCents: number): boolean {
    return reason === RefundReason.other || amountCents > ADMIN_REFUND_THRESHOLD_CENTS;
  }

  static canViewRefunds(principal: Principal): boolean {
    return principal.role === UserRole.admin || principal.role === UserRole.concierge;
  }
}
