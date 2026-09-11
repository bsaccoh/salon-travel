import { UserRole } from '@prisma/client';

export interface CancellationEvaluationInput {
  actorRole: UserRole;
  scheduledDate: Date;
  totalCents: number;
  providerEarningsCents: number;
  cancellationDate?: Date;
}

export interface CancellationEvaluationResult {
  isEligibleForFullRefund: boolean;
  refundAmountCents: number;
  finalProviderEarningsCents: number;
  cancellationWindowHours: number;
  reasonSummary: string;
}

/**
 * Evaluates business cancellation rules.
 *
 * Rules:
 * 1. Provider cancels: 100% refund to traveler, provider earnings = 0.
 * 2. Traveler cancels > 24 hours before service date: 100% refund to traveler, provider earnings = 0.
 * 3. Traveler cancels <= 24 hours before service date: 0% refund, provider earnings protected.
 */
export function evaluateCancellationRules(
  input: CancellationEvaluationInput,
): CancellationEvaluationResult {
  const { actorRole, scheduledDate, totalCents, providerEarningsCents } = input;
  const now = input.cancellationDate || new Date();

  // Hours remaining until scheduled service date
  const timeDifferenceMs = scheduledDate.getTime() - now.getTime();
  const hoursUntilService = timeDifferenceMs / (1000 * 60 * 60);

  if (actorRole === UserRole.provider || actorRole === UserRole.admin) {
    return {
      isEligibleForFullRefund: true,
      refundAmountCents: totalCents,
      finalProviderEarningsCents: 0,
      cancellationWindowHours: Math.round(hoursUntilService),
      reasonSummary: 'Provider/Admin initiated cancellation — full refund issued',
    };
  }

  // Traveler cancellation
  if (hoursUntilService > 24) {
    return {
      isEligibleForFullRefund: true,
      refundAmountCents: totalCents,
      finalProviderEarningsCents: 0,
      cancellationWindowHours: Math.round(hoursUntilService),
      reasonSummary: 'Traveler cancelled more than 24 hours in advance — full refund eligible',
    };
  }

  // Within 24-hour cutoff — no refund, provider protected
  return {
    isEligibleForFullRefund: false,
    refundAmountCents: 0,
    finalProviderEarningsCents: providerEarningsCents,
    cancellationWindowHours: Math.round(hoursUntilService),
    reasonSummary: 'Traveler cancelled within 24 hours of service — non-refundable',
  };
}
