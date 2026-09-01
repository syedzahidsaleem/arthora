const DEFAULT_ANNUAL_RISK_FREE_RATE = 0.072;

/**
 * Calculates Beta (systematic risk) relative to a benchmark.
 * Beta = Cov(fund, benchmark) / Var(benchmark)
 *
 * @param fundReturns - Array of fund returns
 * @param benchmarkReturns - Array of corresponding benchmark returns (e.g. Nifty 50)
 * @returns Beta coefficient
 */
export function calculateBeta(
  fundReturns: number[],
  benchmarkReturns: number[],
): number {
  const n = Math.min(fundReturns.length, benchmarkReturns.length);
  if (n < 2) {
    return 1.0;
  }

  const fundMean = fundReturns.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const benchMean = benchmarkReturns.slice(0, n).reduce((s, v) => s + v, 0) / n;

  let covariance = 0;
  let benchVariance = 0;

  for (let i = 0; i < n; i++) {
    const fundDiff = fundReturns[i]! - fundMean;
    const benchDiff = benchmarkReturns[i]! - benchMean;

    covariance += fundDiff * benchDiff;
    benchVariance += benchDiff * benchDiff;
  }

  if (benchVariance === 0) {
    return 1.0;
  }

  return covariance / benchVariance;
}

/**
 * Calculates Jensen's Alpha (excess return over CAPM expected return).
 * Alpha = fundReturn - (riskFreeRate + beta * (benchmarkReturn - riskFreeRate))
 *
 * @param fundReturn - Annualized fund return (CAGR or mean return)
 * @param benchmarkReturn - Annualized benchmark return
 * @param beta - Beta of the fund relative to benchmark
 * @param riskFreeRate - Annual risk-free rate (default 0.072)
 * @returns Alpha percentage decimal (e.g. 0.035 for 3.5% outperformance)
 */
export function calculateAlpha(
  fundReturn: number,
  benchmarkReturn: number,
  beta: number,
  riskFreeRate: number = DEFAULT_ANNUAL_RISK_FREE_RATE,
): number {
  const expectedReturn = riskFreeRate + beta * (benchmarkReturn - riskFreeRate);
  return fundReturn - expectedReturn;
}
