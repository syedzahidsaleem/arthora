/**
 * Formats a number as a percentage string with the % symbol.
 * Example: 12.3456 -> 12.35%
 *
 * @param value - The numeric percentage value
 * @param decimals - Number of decimal digits (default 2)
 * @param showSign - Explicitly show + sign for positive values (default false)
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  showSign: boolean = false,
): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.00%';
  }

  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
