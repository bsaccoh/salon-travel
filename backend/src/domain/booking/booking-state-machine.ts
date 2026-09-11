import { BookingStatus, UserRole } from '@prisma/client';
import { ConflictError, ValidationError, AuthorizationError } from '../../common/errors';

export interface TransitionContext {
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  actorRole: UserRole | 'system';
  reason?: string;
}

/**
 * Booking State Machine.
 * Validates state transitions, actor permissions, and terminal state invariants.
 */
export class BookingStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.pending]: [
      BookingStatus.accepted,
      BookingStatus.declined,
      BookingStatus.expired,
      BookingStatus.cancelled_by_traveler,
    ],
    [BookingStatus.accepted]: [
      BookingStatus.awaiting_payment,
      BookingStatus.cancelled_by_traveler,
      BookingStatus.cancelled_by_provider,
    ],
    [BookingStatus.awaiting_payment]: [
      BookingStatus.paid,
      BookingStatus.payment_failed,
      BookingStatus.cancelled_by_traveler,
      BookingStatus.expired,
    ],
    [BookingStatus.paid]: [
      BookingStatus.confirmed,
      BookingStatus.cancelled_by_traveler,
      BookingStatus.cancelled_by_provider,
    ],
    [BookingStatus.confirmed]: [
      BookingStatus.in_progress,
      BookingStatus.completed,
      BookingStatus.cancelled_by_traveler,
      BookingStatus.cancelled_by_provider,
    ],
    [BookingStatus.in_progress]: [
      BookingStatus.completed,
      BookingStatus.no_show,
    ],
    // Terminal states — no transitions allowed
    [BookingStatus.completed]: [],
    [BookingStatus.declined]: [],
    [BookingStatus.expired]: [],
    [BookingStatus.payment_failed]: [],
    [BookingStatus.cancelled_by_traveler]: [],
    [BookingStatus.cancelled_by_provider]: [],
    [BookingStatus.no_show]: [],
  };

  /**
   * Allowed actors for specific transitions.
   */
  private static readonly ACTOR_PERMISSIONS: Partial<Record<BookingStatus, (UserRole | 'system')[]>> = {
    [BookingStatus.accepted]: [UserRole.provider, UserRole.admin],
    [BookingStatus.declined]: [UserRole.provider, UserRole.admin],
    [BookingStatus.expired]: ['system', UserRole.admin],
    [BookingStatus.cancelled_by_traveler]: [UserRole.traveler, UserRole.admin, UserRole.concierge],
    [BookingStatus.cancelled_by_provider]: [UserRole.provider, UserRole.admin],
    [BookingStatus.awaiting_payment]: ['system', UserRole.admin, UserRole.provider],
    [BookingStatus.paid]: ['system', UserRole.admin],
    [BookingStatus.confirmed]: ['system', UserRole.admin, UserRole.provider],
    [BookingStatus.in_progress]: ['system', UserRole.provider, UserRole.admin],
    [BookingStatus.completed]: [UserRole.provider, 'system', UserRole.admin],
    [BookingStatus.no_show]: [UserRole.provider, UserRole.admin],
  };

  /**
   * Check if a transition is structurally allowed.
   */
  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  /**
   * Validate transition legality and actor authorization.
   */
  static validateTransition(context: TransitionContext): void {
    const { fromStatus, toStatus, actorRole, reason } = context;

    if (!this.canTransition(fromStatus, toStatus)) {
      throw new ConflictError(
        `Cannot transition booking from '${fromStatus}' to '${toStatus}'`,
        'INVALID_BOOKING_TRANSITION',
      );
    }

    const allowedActors = this.ACTOR_PERMISSIONS[toStatus];
    if (allowedActors && !allowedActors.includes(actorRole)) {
      throw new AuthorizationError(
        `Actor with role '${actorRole}' is not authorized to transition booking to '${toStatus}'`,
      );
    }

    // Require reason for decline, no_show, and cancellations
    if (
      (toStatus === BookingStatus.declined ||
        toStatus === BookingStatus.no_show ||
        toStatus === BookingStatus.cancelled_by_provider) &&
      !reason?.trim()
    ) {
      throw new ValidationError(`A reason is required when transitioning to '${toStatus}'`);
    }
  }
}
