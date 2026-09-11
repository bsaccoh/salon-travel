import { Principal } from '../../common/types/principal';
import { UserRole } from '@prisma/client';

export class ProviderDocumentPolicy {
  static canManageDocument(principal: Principal, providerUserId: string): boolean {
    return principal.userId === providerUserId || principal.role === UserRole.admin;
  }

  static canReviewDocument(principal: Principal): boolean {
    return principal.role === UserRole.admin || principal.role === UserRole.concierge;
  }
}
