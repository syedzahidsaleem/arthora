const DEFAULT_ANNUAL_RISK_FREE_RATE = 0.072;
const DEFAULT_MONTHLY_RISK_FREE_RATE = DEFAULT_ANNUAL_RISK_FREE_RATE / 12;

/**
 * Calculates the Sortino Ratio.
 * Sortino = (meanReturn - riskFreeRate) / downsideDeviation
 * Downside deviation measures only the standard deviation of negative/sub-target returns.
 *
 * @param monthlyReturns - Array of monthly return decimals
 * @param riskFreeRate - Monthly risk-free rate threshold (default 7.2% / 12)
 * @returns Sortino ratio
 */
export function calculateSortino(
  monthlyReturns: number[],
  riskFreeRate: number = DEFAULT_MONTHLY_RISK_FREE_RATE,
): number {
  if (!monthlyReturns || monthlyReturns.length === 0) {
    return 0;
  }

  const meanReturn = monthlyReturns.reduce((sum, val) => sum + val, 0) / monthlyReturns.length;

  // Filter and compute squared deviations of returns below the risk-free rate
  const negativeDeviations = monthlyReturns
    .map((r) => r - riskFreeRate)
    .filter((diff) => diff < 0)
    .map((diff) => Math.pow(diff, 2));

  if (negativeDeviations.length === 0) {
    // If no negative returns exist, return a high positive ratio or calculate against zero
    return meanReturn > riskFreeRate ? 10 : 0;
  }

  const downsideVariance =
    negativeDeviations.reduce((sum, val) => sum + val, 0) / monthlyReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  if (downsideDeviation === 0) {
    return 0;
  }

  return (meanReturn - riskFreeRate) / downsideDeviation;
}
