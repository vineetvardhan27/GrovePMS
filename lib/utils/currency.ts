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

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(n: number): string {
  let result = '';
  if (n >= 100) {
    result += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    result += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    result += ONES[n] + ' ';
  }
  return result.trim();
}

/**
 * Convert numerical amounts into formal Indian currency words (Rupees ... Only)
 * Handles Indian numbering system: Crores, Lakhs, Thousands, Hundreds, Units, and Paise.
 * Example: 8400 -> "Rupees Eight Thousand Four Hundred Only"
 * Example: 125000.50 -> "Rupees One Lakh Twenty Five Thousand and Fifty Paise Only"
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let num = rupees;
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertLessThanThousand(hundred) + ' ';
  }

  words = words.trim();
  if (!words) {
    words = 'Zero';
  }

  let finalString = `Rupees ${words}`;
  if (paise > 0) {
    finalString += ` and ${convertLessThanThousand(paise)} Paise`;
  }
  finalString += ' Only';

  return isNegative ? `Minus ${finalString}` : finalString;
}
