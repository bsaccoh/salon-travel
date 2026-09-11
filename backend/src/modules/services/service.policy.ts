import { Principal } from '../../common/types/principal';
import { UserRole } from '@prisma/client';

export class ServicePolicy {
  static canManageService(principal: Principal, providerUserId: string): boolean {
    return principal.userId === providerUserId || principal.role === UserRole.admin;
  }
}
