import { Principal } from '../../common/types/principal';
import { Provider, UserRole } from '@prisma/client';

export class ProviderPolicy {
  static canManageProvider(principal: Principal, provider: Provider): boolean {
    return principal.userId === provider.userId || principal.role === UserRole.admin;
  }

  static canVerify(principal: Principal): boolean {
    return principal.role === UserRole.admin || principal.role === UserRole.concierge;
  }

  static canSuspend(principal: Principal): boolean {
    return principal.role === UserRole.admin;
  }

  static isPubliclyVisible(provider: Provider): boolean {
    return provider.status === 'approved' && !provider.deletedAt;
  }
}
