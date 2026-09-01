import { calculateStdDev } from './stdDev';

const DEFAULT_ANNUAL_RISK_FREE_RATE = 0.072; // 7.2% standard Indian 10Y G-Sec / RBI repo benchmark
const DEFAULT_MONTHLY_RISK_FREE_RATE = DEFAULT_ANNUAL_RISK_FREE_RATE / 12;

/**
 * Calculates the Sharpe Ratio for a series of returns.
 * Sharpe = (meanReturn - riskFreeRate) / stdDev
 *
 * @param monthlyReturns - Array of monthly return decimals
 * @param riskFreeRate - Monthly risk-free rate (default 7.2% / 12)
 * @returns Sharpe ratio
 */
export function calculateSharpe(
  monthlyReturns: number[],
  riskFreeRate: number = DEFAULT_MONTHLY_RISK_FREE_RATE,
): number {
  if (!monthlyReturns || monthlyReturns.length <= 1) {
    return 0;
  }

  const meanReturn = monthlyReturns.reduce((sum, val) => sum + val, 0) / monthlyReturns.length;
  const stdDev = calculateStdDev(monthlyReturns);

  if (stdDev === 0) {
    return 0;
  }

  return (meanReturn - riskFreeRate) / stdDev;
}

/**
 * Annualized Sharpe Ratio = Monthly Sharpe * sqrt(12).
 *
 * @param monthlyReturns - Array of monthly return decimals
 * @param annualRiskFreeRate - Annual risk-free rate (default 0.072)
 * @returns Annualized Sharpe ratio
 */
export function annualizedSharpe(
  monthlyReturns: number[],
  annualRiskFreeRate: number = DEFAULT_ANNUAL_RISK_FREE_RATE,
): number {
  const monthlySharpe = calculateSharpe(monthlyReturns, annualRiskFreeRate / 12);
  return monthlySharpe * Math.sqrt(12);
}
