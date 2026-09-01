/**
 * Computes standard deviation of a series of returns.
 *
 * @param returns - Array of percentage / decimal returns
 * @returns Sample standard deviation
 */
export function calculateStdDev(returns: number[]): number {
  if (!returns || returns.length <= 1) {
    return 0;
  }

  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const variance =
    returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (returns.length - 1);

  return Math.sqrt(variance);
}

/**
 * Annualized Standard Deviation for monthly returns series: StdDev * sqrt(12).
 *
 * @param monthlyReturns - Array of monthly return decimals
 * @returns Annualized volatility
 */
export function annualizedStdDev(monthlyReturns: number[]): number {
  return calculateStdDev(monthlyReturns) * Math.sqrt(12);
}
