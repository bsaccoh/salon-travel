import { Principal } from '../../common/types/principal';
import { UserRole } from '@prisma/client';

export class UserPolicy {
  static canViewProfile(principal: Principal, targetUserId: string): boolean {
    return principal.userId === targetUserId || principal.role === UserRole.admin || principal.role === UserRole.concierge;
  }

  static canUpdateProfile(principal: Principal, targetUserId: string): boolean {
    return principal.userId === targetUserId || principal.role === UserRole.admin;
  }

  static canManageUsers(principal: Principal): boolean {
    return principal.role === UserRole.admin;
  }
}
