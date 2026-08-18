/**
 * Format amounts into standardized currency strings.
 * Defaults to INR (₹) per PRD requirements.
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = '₹',
  locale: string = 'en-IN'
): string {
  if (isNaN(amount)) return `${currencySymbol}0.00`;
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currencySymbol}${formatted}`;
}
