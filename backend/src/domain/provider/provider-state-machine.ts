import { ProviderStatus, VerificationStatus } from '@prisma/client';
import { ConflictError } from '../../common/errors';

export interface ProviderTransitionParams {
  currentStatus: ProviderStatus;
  targetStatus: ProviderStatus;
  reason?: string;
}

export interface TransitionResult {
  nextStatus: ProviderStatus;
  nextVerificationStatus?: VerificationStatus;
}

/**
 * Centralized Provider State Machine.
 * Validates and calculates state transitions for the provider lifecycle.
 *
 * States: draft -> submitted -> under_review -> approved -> listed -> suspended / rejected / changes_requested
 */
export class ProviderStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<ProviderStatus, ProviderStatus[]> = {
    [ProviderStatus.draft]: [ProviderStatus.submitted],
    [ProviderStatus.submitted]: [ProviderStatus.under_review, ProviderStatus.rejected, ProviderStatus.draft],
    [ProviderStatus.under_review]: [
      ProviderStatus.approved,
      ProviderStatus.rejected,
      ProviderStatus.changes_requested,
    ],
    [ProviderStatus.changes_requested]: [ProviderStatus.submitted],
    [ProviderStatus.approved]: [ProviderStatus.listed, ProviderStatus.suspended],
    [ProviderStatus.listed]: [ProviderStatus.suspended, ProviderStatus.draft],
    [ProviderStatus.suspended]: [ProviderStatus.listed, ProviderStatus.approved],
    [ProviderStatus.rejected]: [ProviderStatus.draft],
  };

  /**
   * Validate if a transition from currentStatus to targetStatus is allowed.
   */
  static canTransition(current: ProviderStatus, target: ProviderStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Execute a state transition and determine resulting verification status.
   */
  static transition(params: ProviderTransitionParams): TransitionResult {
    const { currentStatus, targetStatus } = params;

    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new ConflictError(
        `Cannot transition provider from '${currentStatus}' to '${targetStatus}'`,
        'INVALID_PROVIDER_TRANSITION',
      );
    }

    let nextVerificationStatus: VerificationStatus | undefined;

    switch (targetStatus) {
      case ProviderStatus.submitted:
        nextVerificationStatus = VerificationStatus.pending;
        break;
      case ProviderStatus.approved:
      case ProviderStatus.listed:
        nextVerificationStatus = VerificationStatus.verified;
        break;
      case ProviderStatus.rejected:
        nextVerificationStatus = VerificationStatus.rejected;
        break;
      default:
        break;
    }

    return {
      nextStatus: targetStatus,
      nextVerificationStatus,
    };
  }
}
