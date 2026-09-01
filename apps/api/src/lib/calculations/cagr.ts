/**
 * CAGR = (endValue / startValue) ^ (1 / years) - 1
 *
 * @param startValue - Initial NAV / asset price
 * @param endValue - Final NAV / asset price
 * @param years - Investment duration in years
 * @returns Annualized Compounded Growth Rate as decimal (e.g. 0.15 for 15%)
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) {
    return 0;
  }
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * Computes CAGR from a date-sorted (ascending) NAV history array for a given number of years back.
 *
 * @param navHistory - Array of NAV points sorted ascending by date
 * @param yearsBack - Lookback window in years (1, 3, 5, 10)
 * @returns CAGR decimal or null if insufficient history exists
 */
export function calculateCAGRFromHistory(
  navHistory: Array<{ date: Date; nav: number }>,
  yearsBack: 1 | 3 | 5 | 10,
): number | null {
  if (!navHistory || navHistory.length < 2) {
    return null;
  }

  const latest = navHistory[navHistory.length - 1];
  if (!latest) return null;

  const targetDate = new Date(latest.date);
  targetDate.setFullYear(targetDate.getFullYear() - yearsBack);

  // Find the closest NAV entry on or just before the target date
  let startIndex = -1;
  for (let i = navHistory.length - 1; i >= 0; i--) {
    const item = navHistory[i];
    if (item && new Date(item.date) <= targetDate) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) {
    // If not exact date found, use the first entry if it spans at least ~90% of the target duration
    const earliest = navHistory[0];
    if (!earliest) return null;
    const actualDays = (latest.date.getTime() - earliest.date.getTime()) / (1000 * 60 * 60 * 24);
    const requiredDays = yearsBack * 365 * 0.9;
    if (actualDays < requiredDays) {
      return null;
    }
    startIndex = 0;
  }

  const startEntry = navHistory[startIndex];
  if (!startEntry) return null;

  const actualYears = (latest.date.getTime() - startEntry.date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (actualYears <= 0) return null;

  return calculateCAGR(startEntry.nav, latest.nav, actualYears);
}
