export interface MaxDrawdownResult {
  maxDrawdown: number; // positive decimal e.g. 0.4167 for 41.67%
  peakDate: Date;
  troughDate: Date;
  recoveryDate: Date | null;
}

/**
 * Calculates the Maximum Drawdown (MDD) from a chronological NAV history series.
 * MDD = (Peak Value - Trough Value) / Peak Value
 *
 * @param navHistory - Array of objects containing date and nav, sorted ascending by date
 * @returns MaxDrawdownResult with drawdown percentage and dates
 */
export function calculateMaxDrawdown(
  navHistory: Array<{ date: Date; nav: number }>,
): MaxDrawdownResult {
  if (!navHistory || navHistory.length === 0) {
    const epoch = new Date(0);
    return {
      maxDrawdown: 0,
      peakDate: epoch,
      troughDate: epoch,
      recoveryDate: null,
    };
  }

  let maxDrawdown = 0;
  let peakNav = navHistory[0]!.nav;
  let peakDate = new Date(navHistory[0]!.date);

  let currentPeakNav = peakNav;
  let currentPeakDate = peakDate;
  let troughDate = peakDate;
  let recoveryDate: Date | null = null;

  for (let i = 0; i < navHistory.length; i++) {
    const item = navHistory[i]!;
    const nav = item.nav;
    const date = new Date(item.date);

    if (nav > currentPeakNav) {
      // If we recovered past the highest peak after a drawdown
      if (maxDrawdown > 0 && currentPeakNav === peakNav && recoveryDate === null && nav >= peakNav) {
        recoveryDate = date;
      }
      currentPeakNav = nav;
      currentPeakDate = date;
    } else if (currentPeakNav > 0) {
      const drawdown = (currentPeakNav - nav) / currentPeakNav;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        peakNav = currentPeakNav;
        peakDate = currentPeakDate;
        troughDate = date;
        recoveryDate = null; // reset recovery date for new max drawdown
      }
    }
  }

  // Check if recovered after the trough date
  if (maxDrawdown > 0 && recoveryDate === null) {
    for (let i = 0; i < navHistory.length; i++) {
      const item = navHistory[i]!;
      const date = new Date(item.date);
      if (date > troughDate && item.nav >= peakNav) {
        recoveryDate = date;
        break;
      }
    }
  }

  return {
    maxDrawdown,
    peakDate,
    troughDate,
    recoveryDate,
  };
}
