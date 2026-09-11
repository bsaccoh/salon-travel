import { BookingStateMachine } from '../../src/domain/booking/booking-state-machine';
import { BookingStatus, UserRole } from '@prisma/client';
import { ConflictError, AuthorizationError, ValidationError } from '../../src/common/errors';
import { calculateBookingFinancials } from '../../src/domain/money/commission';
import { evaluateCancellationRules } from '../../src/domain/booking/booking-cancellation';

describe('Booking State Machine & Financials (Unit)', () => {
  describe('Commission & Price Calculation', () => {
    it('should calculate base price and 15% default commission correctly', () => {
      const result = calculateBookingFinancials({
        serviceBasePriceCents: 10000, // $100
        guestCount: 2, // Total $200
        serviceCommissionRate: null,
        providerCommissionRate: null,
      });

      expect(result.totalCents).toBe(20000); // $200
      expect(result.commissionCents).toBe(3000); // $30 (15%)
      expect(result.providerEarningsCents).toBe(17000); // $170
      expect(result.commissionRate).toBe(15);
    });

    it('should respect custom service commission rate override', () => {
      const result = calculateBookingFinancials({
        serviceBasePriceCents: 5000,
        guestCount: 1,
        serviceCommissionRate: 20, // 20%
        providerCommissionRate: 15,
      });

      expect(result.totalCents).toBe(5000);
      expect(result.commissionCents).toBe(1000); // 20%
      expect(result.providerEarningsCents).toBe(4000);
    });

    it('should fall back to provider rate when service rate is null', () => {
      const result = calculateBookingFinancials({
        serviceBasePriceCents: 10000,
        guestCount: 1,
        serviceCommissionRate: null,
        providerCommissionRate: 25,
      });

      expect(result.commissionRate).toBe(25);
      expect(result.commissionCents).toBe(2500);
      expect(result.providerEarningsCents).toBe(7500);
    });

    it('should clamp commission rate to 0-100 range', () => {
      const negative = calculateBookingFinancials({
        serviceBasePriceCents: 10000,
        guestCount: 1,
        serviceCommissionRate: -10,
        providerCommissionRate: null,
      });
      expect(negative.commissionCents).toBe(0);

      const over100 = calculateBookingFinancials({
        serviceBasePriceCents: 10000,
        guestCount: 1,
        serviceCommissionRate: 150,
        providerCommissionRate: null,
      });
      expect(over100.commissionCents).toBe(10000);
      expect(over100.providerEarningsCents).toBe(0);
    });

    it('should handle zero-price service', () => {
      const result = calculateBookingFinancials({
        serviceBasePriceCents: 0,
        guestCount: 3,
        serviceCommissionRate: null,
        providerCommissionRate: null,
      });

      expect(result.totalCents).toBe(0);
      expect(result.commissionCents).toBe(0);
      expect(result.providerEarningsCents).toBe(0);
    });

    it('should treat guestCount < 1 as 1', () => {
      const result = calculateBookingFinancials({
        serviceBasePriceCents: 5000,
        guestCount: 0,
        serviceCommissionRate: null,
        providerCommissionRate: null,
      });

      expect(result.totalCents).toBe(5000);
    });
  });

  describe('Cancellation Rules Evaluation', () => {
    it('should grant full refund when traveler cancels > 24 hours in advance', () => {
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h in future
      const result = evaluateCancellationRules({
        actorRole: UserRole.traveler,
        scheduledDate: futureDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
      });

      expect(result.isEligibleForFullRefund).toBe(true);
      expect(result.refundAmountCents).toBe(20000);
      expect(result.finalProviderEarningsCents).toBe(0);
    });

    it('should protect provider earnings and grant 0 refund when traveler cancels <= 24h in advance', () => {
      const nearFutureDate = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6h in future
      const result = evaluateCancellationRules({
        actorRole: UserRole.traveler,
        scheduledDate: nearFutureDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
      });

      expect(result.isEligibleForFullRefund).toBe(false);
      expect(result.refundAmountCents).toBe(0);
      expect(result.finalProviderEarningsCents).toBe(17000);
    });

    it('should always grant full refund when provider cancels', () => {
      const nearFutureDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const result = evaluateCancellationRules({
        actorRole: UserRole.provider,
        scheduledDate: nearFutureDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
      });

      expect(result.isEligibleForFullRefund).toBe(true);
      expect(result.refundAmountCents).toBe(20000);
      expect(result.finalProviderEarningsCents).toBe(0);
    });

    it('should always grant full refund when admin cancels', () => {
      const nearFutureDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const result = evaluateCancellationRules({
        actorRole: UserRole.admin,
        scheduledDate: nearFutureDate,
        totalCents: 15000,
        providerEarningsCents: 12750,
      });

      expect(result.isEligibleForFullRefund).toBe(true);
      expect(result.refundAmountCents).toBe(15000);
      expect(result.finalProviderEarningsCents).toBe(0);
    });

    it('should deny refund at exactly 24-hour boundary', () => {
      const now = new Date('2026-06-15T10:00:00Z');
      const scheduledDate = new Date('2026-06-16T10:00:00Z'); // exactly 24h
      const result = evaluateCancellationRules({
        actorRole: UserRole.traveler,
        scheduledDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
        cancellationDate: now,
      });

      expect(result.isEligibleForFullRefund).toBe(false);
      expect(result.refundAmountCents).toBe(0);
    });

    it('should grant refund at 24h + 1 minute', () => {
      const now = new Date('2026-06-15T10:00:00Z');
      const scheduledDate = new Date('2026-06-16T10:01:00Z'); // 24h + 1 min
      const result = evaluateCancellationRules({
        actorRole: UserRole.traveler,
        scheduledDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
        cancellationDate: now,
      });

      expect(result.isEligibleForFullRefund).toBe(true);
      expect(result.refundAmountCents).toBe(20000);
    });

    it('should deny refund for past service date', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = evaluateCancellationRules({
        actorRole: UserRole.traveler,
        scheduledDate: pastDate,
        totalCents: 20000,
        providerEarningsCents: 17000,
      });

      expect(result.isEligibleForFullRefund).toBe(false);
      expect(result.refundAmountCents).toBe(0);
    });
  });

  describe('State Machine Allowed Transitions', () => {
    it('should allow pending -> accepted by provider', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.pending,
          toStatus: BookingStatus.accepted,
          actorRole: UserRole.provider,
        }),
      ).not.toThrow();
    });

    it('should allow pending -> declined by provider with reason', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.pending,
          toStatus: BookingStatus.declined,
          actorRole: UserRole.provider,
          reason: 'Fully booked on this date',
        }),
      ).not.toThrow();
    });

    it('should allow pending -> expired by system', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.pending,
          toStatus: BookingStatus.expired,
          actorRole: 'system',
        }),
      ).not.toThrow();
    });

    it('should allow confirmed -> in_progress -> completed', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.confirmed,
          toStatus: BookingStatus.in_progress,
          actorRole: UserRole.provider,
        }),
      ).not.toThrow();

      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.in_progress,
          toStatus: BookingStatus.completed,
          actorRole: UserRole.provider,
        }),
      ).not.toThrow();
    });
  });

  describe('State Machine Forbidden Transitions & Guard Invariants', () => {
    it('should reject invalid transition completed -> pending (409 Conflict)', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.completed,
          toStatus: BookingStatus.pending,
          actorRole: UserRole.provider,
        }),
      ).toThrow(ConflictError);
    });

    it('should reject transition from terminal state declined -> accepted (409 Conflict)', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.declined,
          toStatus: BookingStatus.accepted,
          actorRole: UserRole.provider,
        }),
      ).toThrow(ConflictError);
    });

    it('should reject unauthorized actor (e.g. traveler attempting to accept booking)', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.pending,
          toStatus: BookingStatus.accepted,
          actorRole: UserRole.traveler,
        }),
      ).toThrow(AuthorizationError);
    });

    it('should reject decline transition without a reason', () => {
      expect(() =>
        BookingStateMachine.validateTransition({
          fromStatus: BookingStatus.pending,
          toStatus: BookingStatus.declined,
          actorRole: UserRole.provider,
          reason: '',
        }),
      ).toThrow(ValidationError);
    });
  });
});
