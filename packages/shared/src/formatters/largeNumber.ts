/**
 * Formats large numeric amounts into Indian denomination units (Crore, Lakh, Thousand).
 * Examples:
 *   12300000 -> "₹1.23 Cr"
 *   4550000 -> "₹45.50 L"
 *   50000 -> "₹50.00 k"
 *   500 -> "₹500"
 *
 * @param value - The numeric value in INR
 * @param options - Formatting options
 * @returns Formatted string with appropriate Indian denomination
 */
export function formatLargeNumberINR(
  value: number,
  options: { decimals?: number; showSymbol?: boolean } = {},
): string {
  const { decimals = 2, showSymbol = true } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = value < 0;
  const abs = Math.abs(value);
  const symbol = showSymbol ? '₹' : '';
  const prefix = isNegative ? '-' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000 (10^7)
    const cr = abs / 10000000;
    return `${prefix}${symbol}${cr.toFixed(decimals)} Cr`;
  }

  if (abs >= 100000) {
    // 1 Lakh = 100,000 (10^5)
    const lk = abs / 100000;
    return `${prefix}${symbol}${lk.toFixed(decimals)} L`;
  }

  if (abs >= 1000) {
    // 1 Thousand = 1,000
    const k = abs / 1000;
    return `${prefix}${symbol}${k.toFixed(decimals)} k`;
  }

  return `${prefix}${symbol}${Number.isInteger(abs) ? abs.toString() : abs.toFixed(decimals)}`;
}
