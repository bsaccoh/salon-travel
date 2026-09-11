import { ProviderStateMachine } from '../../src/domain/provider/provider-state-machine';
import { ProviderStatus, VerificationStatus } from '@prisma/client';
import { ConflictError } from '../../src/common/errors';
import { generateBookingReference } from '../../src/domain/booking/booking-reference';

describe('Provider State Machine (Unit)', () => {
  describe('Allowed Transitions', () => {
    it('should allow draft -> submitted', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.draft, ProviderStatus.submitted)).toBe(true);
    });

    it('should allow submitted -> under_review', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.submitted, ProviderStatus.under_review)).toBe(true);
    });

    it('should allow under_review -> approved', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.under_review, ProviderStatus.approved)).toBe(true);
    });

    it('should allow under_review -> rejected', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.under_review, ProviderStatus.rejected)).toBe(true);
    });

    it('should allow under_review -> changes_requested', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.under_review, ProviderStatus.changes_requested)).toBe(true);
    });

    it('should allow changes_requested -> submitted (resubmission)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.changes_requested, ProviderStatus.submitted)).toBe(true);
    });

    it('should allow approved -> listed', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.approved, ProviderStatus.listed)).toBe(true);
    });

    it('should allow approved -> suspended', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.approved, ProviderStatus.suspended)).toBe(true);
    });

    it('should allow listed -> suspended', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.listed, ProviderStatus.suspended)).toBe(true);
    });

    it('should allow suspended -> listed (reinstatement)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.suspended, ProviderStatus.listed)).toBe(true);
    });

    it('should allow rejected -> draft (re-application)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.rejected, ProviderStatus.draft)).toBe(true);
    });
  });

  describe('Forbidden Transitions', () => {
    it('should reject draft -> approved (must go through submission & review)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.draft, ProviderStatus.approved)).toBe(false);
    });

    it('should reject draft -> listed', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.draft, ProviderStatus.listed)).toBe(false);
    });

    it('should reject submitted -> listed (must go through review)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.submitted, ProviderStatus.listed)).toBe(false);
    });

    it('should reject rejected -> approved (must restart from draft)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.rejected, ProviderStatus.approved)).toBe(false);
    });

    it('should reject changes_requested -> approved (must resubmit first)', () => {
      expect(ProviderStateMachine.canTransition(ProviderStatus.changes_requested, ProviderStatus.approved)).toBe(false);
    });
  });

  describe('Transition Execution', () => {
    it('should set verification to pending on submission', () => {
      const result = ProviderStateMachine.transition({
        currentStatus: ProviderStatus.draft,
        targetStatus: ProviderStatus.submitted,
      });

      expect(result.nextStatus).toBe(ProviderStatus.submitted);
      expect(result.nextVerificationStatus).toBe(VerificationStatus.pending);
    });

    it('should set verification to verified on approval', () => {
      const result = ProviderStateMachine.transition({
        currentStatus: ProviderStatus.under_review,
        targetStatus: ProviderStatus.approved,
      });

      expect(result.nextStatus).toBe(ProviderStatus.approved);
      expect(result.nextVerificationStatus).toBe(VerificationStatus.verified);
    });

    it('should set verification to rejected on rejection', () => {
      const result = ProviderStateMachine.transition({
        currentStatus: ProviderStatus.under_review,
        targetStatus: ProviderStatus.rejected,
      });

      expect(result.nextStatus).toBe(ProviderStatus.rejected);
      expect(result.nextVerificationStatus).toBe(VerificationStatus.rejected);
    });

    it('should throw ConflictError on invalid transition', () => {
      expect(() =>
        ProviderStateMachine.transition({
          currentStatus: ProviderStatus.draft,
          targetStatus: ProviderStatus.listed,
        }),
      ).toThrow(ConflictError);
    });
  });
});

describe('Booking Reference Generator (Unit)', () => {
  it('should produce reference in ST-XXXXXX format', () => {
    const ref = generateBookingReference();
    expect(ref).toMatch(/^ST-[A-Z2-9]{6}$/);
  });

  it('should generate unique references across calls', () => {
    const refs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      refs.add(generateBookingReference());
    }
    expect(refs.size).toBe(100);
  });

  it('should exclude ambiguous characters (0, 1, I, O)', () => {
    for (let i = 0; i < 200; i++) {
      const ref = generateBookingReference();
      expect(ref).not.toMatch(/[01IO]/);
    }
  });
});
