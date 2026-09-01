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
