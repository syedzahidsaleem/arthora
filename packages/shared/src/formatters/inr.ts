/**
 * Formats a number into Indian Rupee format with standard symbol (₹).
 * Example: 1234567 -> ₹12,34,567
 *
 * @param amount - The numeric amount in INR
 * @param options - Formatting options (decimals, showSymbol)
 * @returns Formatted currency string
 */
export function formatINR(
  amount: number,
  options: { decimals?: number; showSymbol?: boolean } = {},
): string {
  const { decimals = 0, showSymbol = true } = options;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount);

  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formattedNumber}`;
}

/**
 * Formats a number into Indian Lakh/Crore compact notation (e.g. ₹1.48 Cr, ₹12.4 L).
 */
export function formatLakhsCrores(
  amount: number,
  options: { decimals?: number; showSymbol?: boolean } = {},
): string {
  const { decimals = 2, showSymbol = true } = options;
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }

  const symbol = showSymbol ? '₹' : '';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (abs >= 10000000) {
    formatted = `${(abs / 10000000).toFixed(decimals)} Cr`;
  } else if (abs >= 100000) {
    formatted = `${(abs / 100000).toFixed(decimals)} L`;
  } else if (abs >= 1000) {
    formatted = `${(abs / 1000).toFixed(decimals)} K`;
  } else {
    formatted = abs.toFixed(decimals);
  }

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

