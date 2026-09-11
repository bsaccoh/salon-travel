import { Principal } from '../../common/types/principal';
import { Conversation, UserRole } from '@prisma/client';

export class ConversationPolicy {
  static canView(principal: Principal, conv: Conversation): boolean {
    if (principal.role === UserRole.admin || principal.role === UserRole.concierge) {
      return true;
    }
    if (principal.role === UserRole.traveler && conv.travelerId === principal.userId) {
      return true;
    }
    return false;
  }

  static canClaim(principal: Principal): boolean {
    return principal.role === UserRole.concierge || principal.role === UserRole.admin;
  }

  static canEscalateEmergency(principal: Principal): boolean {
    return principal.role === UserRole.concierge || principal.role === UserRole.admin || principal.role === UserRole.traveler;
  }
}
