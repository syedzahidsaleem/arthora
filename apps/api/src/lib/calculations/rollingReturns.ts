import { calculateCAGR } from './cagr';

/**
 * Computes rolling CAGR over a rolling window (in years) for every possible historical period.
 *
 * @param navHistory - Array of objects containing date and nav, sorted ascending by date
 * @param windowYears - Rolling window in years (1, 3, or 5)
 * @returns Array of date and rolling CAGR pairs
 */
export function calculateRollingReturns(
  navHistory: Array<{ date: Date; nav: number }>,
  windowYears: 1 | 3 | 5,
): Array<{ date: Date; cagr: number }> {
  if (!navHistory || navHistory.length < 2) {
    return [];
  }

  const results: Array<{ date: Date; cagr: number }> = [];

  let startIdx = 0;
  for (let endIdx = 0; endIdx < navHistory.length; endIdx++) {
    const endItem = navHistory[endIdx]!;
    const endDate = new Date(endItem.date);

    const targetDate = new Date(endDate);
    targetDate.setFullYear(targetDate.getFullYear() - windowYears);

    // Advance startIdx as long as the next item is still before or equal to targetDate
    while (
      startIdx + 1 < endIdx &&
      new Date(navHistory[startIdx + 1]!.date) <= targetDate
    ) {
      startIdx++;
    }

    const startItem = navHistory[startIdx]!;
    const startDate = new Date(startItem.date);

    if (startDate <= targetDate) {
      const actualDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const actualYears = actualDays / 365.25;
      if (actualYears > 0 && startItem.nav > 0) {
        const cagr = calculateCAGR(startItem.nav, endItem.nav, actualYears);
        results.push({
          date: endDate,
          cagr,
        });
      }
    }
  }

  return results;
}
