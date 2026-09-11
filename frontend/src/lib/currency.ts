/**
 * Currency Formatter for Salone Travel Platform
 * 
 * Centralized formatting for the SLE currency.
 * The backend stores money in integer minor units (cents for USD, or equivalent for SLE).
 * Since SLE uses two decimal places (e.g. 1 SLE = 100 cents/pesewas), we divide by 100.
 */
export function formatCurrency(minorUnits: number | null | undefined): string {
  if (minorUnits === null || minorUnits === undefined) {
    return 'Le 0.00';
  }

  const amount = minorUnits / 100;

  // The prompt requested format like: "Le 5,250.00"
  // If Intl.NumberFormat doesn't produce this exact output, we manually format it.
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `Le ${formatter.format(amount)}`;
}
