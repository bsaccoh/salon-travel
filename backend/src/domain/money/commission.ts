export const PLATFORM_DEFAULT_COMMISSION_RATE = 15; // 15%

export interface PriceCalculationInput {
  serviceBasePriceCents: number;
  guestCount: number;
  serviceCommissionRate?: number | null;
  providerCommissionRate?: number | null;
}

export interface PriceCalculationResult {
  totalCents: number;
  commissionCents: number;
  providerEarningsCents: number;
  commissionRate: number;
}

/**
 * Server-side price and commission calculation.
 * Never trust client-supplied monetary amounts.
 */
export function calculateBookingFinancials(
  input: PriceCalculationInput,
): PriceCalculationResult {
  const {
    serviceBasePriceCents,
    guestCount,
    serviceCommissionRate,
    providerCommissionRate,
  } = input;

  const totalCents = Math.max(0, serviceBasePriceCents * Math.max(1, guestCount));

  const effectiveRate =
    serviceCommissionRate ??
    providerCommissionRate ??
    PLATFORM_DEFAULT_COMMISSION_RATE;

  // Rate is stored as whole percentage (e.g. 15 for 15%)
  const commissionRatio = Math.max(0, Math.min(100, effectiveRate)) / 100;
  const commissionCents = Math.round(totalCents * commissionRatio);
  const providerEarningsCents = Math.max(0, totalCents - commissionCents);

  return {
    totalCents,
    commissionCents,
    providerEarningsCents,
    commissionRate: effectiveRate,
  };
}
