import { FundNAVHistory } from '../models/FundNAVHistory';
import { FundMetrics } from '../models/FundMetrics';
import { fetchNAVHistory } from '../external/mfapi';
import {
  calculateCAGRFromHistory,
  annualizedSharpe,
  calculateSortino,
  annualizedStdDev,
  calculateBeta,
  calculateAlpha,
  calculateMaxDrawdown,
} from '../calculations';

/**
 * Computes monthly return series from raw daily NAV history.
 */
function computeMonthlyReturns(navHistory: Array<{ date: Date; nav: number }>): number[] {
  if (navHistory.length < 2) return [];

  const monthlyNavs = new Map<string, number>();
  for (const item of navHistory) {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyNavs.set(key, item.nav);
  }

  const values = Array.from(monthlyNavs.values());
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1]!;
    const curr = values[i]!;
    if (prev > 0) {
      returns.push((curr - prev) / prev);
    }
  }

  return returns;
}

/**
 * Calculates risk and return metrics for a mutual fund scheme from MongoDB NAV history
 * (with mfapi.in fallback) and persists the resulting FundMetrics document.
 */
export async function computeAndSaveFundMetrics(schemeCode: number): Promise<{
  schemeCode: number;
  skipped?: boolean;
  reason?: string;
  cagr3Y?: number | null;
  sharpeRatio?: number;
}> {
  const rawPoints = await FundNAVHistory.find({ schemeCode }).sort({ date: 1 }).lean();

  let navHistory: Array<{ date: Date; nav: number }> = [];
  if (rawPoints && rawPoints.length >= 5) {
    navHistory = rawPoints.map((p) => ({
      date: new Date(p.date),
      nav: p.nav,
    }));
  } else {
    try {
      const extPoints = await fetchNAVHistory(schemeCode);
      navHistory = extPoints
        .map((p) => ({ date: new Date(p.date), nav: p.nav }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch {
      navHistory = [];
    }
  }

  if (navHistory.length < 5) {
    return { schemeCode, skipped: true, reason: 'Insufficient NAV history' };
  }

  const cagr1Y = calculateCAGRFromHistory(navHistory, 1);
  const cagr3Y = calculateCAGRFromHistory(navHistory, 3);
  const cagr5Y = calculateCAGRFromHistory(navHistory, 5);
  const cagr10Y = calculateCAGRFromHistory(navHistory, 10);

  const monthlyReturns = computeMonthlyReturns(navHistory);
  const benchmarkMonthlyReturns = monthlyReturns.map(() => 0.01);

  const sharpeRatio = monthlyReturns.length >= 6 ? annualizedSharpe(monthlyReturns) : 0;
  const sortinoRatio = monthlyReturns.length >= 6 ? calculateSortino(monthlyReturns) : 0;
  const standardDeviation = monthlyReturns.length >= 6 ? annualizedStdDev(monthlyReturns) : 0;
  const beta = monthlyReturns.length >= 6 ? calculateBeta(monthlyReturns, benchmarkMonthlyReturns) : 1.0;
  const alpha = cagr3Y !== null ? calculateAlpha(cagr3Y, 0.12, beta) : 0;
  const mddResult = calculateMaxDrawdown(navHistory);

  await FundMetrics.findOneAndUpdate(
    { schemeCode },
    {
      $set: {
        schemeCode,
        category: 'other',
        cagr1Y: cagr1Y ?? undefined,
        cagr3Y: cagr3Y ?? undefined,
        cagr5Y: cagr5Y ?? undefined,
        cagr10Y: cagr10Y ?? undefined,
        sharpeRatio: Number(sharpeRatio.toFixed(2)),
        sortinoRatio: Number(sortinoRatio.toFixed(2)),
        stdDev: Number(standardDeviation.toFixed(4)),
        beta: Number(beta.toFixed(2)),
        alpha: Number(alpha.toFixed(4)),
        maxDrawdown: Number(mddResult.maxDrawdown.toFixed(4)),
        calculatedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  return {
    schemeCode,
    cagr3Y,
    sharpeRatio,
  };
}
