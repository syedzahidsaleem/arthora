import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import { SERVERLESS_WORKER_DEFAULTS } from '../lib/constants/workerOptions';
import { FundNAVHistory } from '../lib/models/FundNAVHistory';
import { FundMetrics } from '../lib/models/FundMetrics';
import {
  calculateCAGRFromHistory,
  annualizedSharpe,
  calculateSortino,
  annualizedStdDev,
  calculateBeta,
  calculateAlpha,
  calculateMaxDrawdown,
} from '../lib/calculations';

export const METRIC_CALC_QUEUE = 'metric-calc';
export const metricCalcQueue = new Queue(METRIC_CALC_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/**
 * Computes monthly return series from raw daily NAV history.
 */
function computeMonthlyReturns(navHistory: Array<{ date: Date; nav: number }>): number[] {
  if (navHistory.length < 2) return [];

  // Group by year-month
  const monthlyNavs = new Map<string, number>();
  for (const item of navHistory) {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyNavs.set(key, item.nav); // latest NAV in that month
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
 * BullMQ Worker computing risk and return analytics for mutual fund schemes.
 */
export function createMetricCalcWorker(): Worker {
  const worker = new Worker(
    METRIC_CALC_QUEUE,
    async (job: Job) => {
      const startTime = Date.now();
      const { schemeCode } = job.data as { schemeCode: number };

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'metricCalc',
          event: 'job_started',
          jobId: job.id,
          schemeCode,
        }),
      );

      // Fetch full NAV history for this scheme
      const rawPoints = await FundNAVHistory.find({ schemeCode }).sort({ date: 1 }).lean();
      if (!rawPoints || rawPoints.length < 5) {
        return { schemeCode, skipped: true, reason: 'Insufficient NAV history' };
      }

      const navHistory = rawPoints.map((p) => ({
        date: new Date(p.date),
        nav: p.nav,
      }));

      // Calculate CAGRs
      const cagr1Y = calculateCAGRFromHistory(navHistory, 1);
      const cagr3Y = calculateCAGRFromHistory(navHistory, 3);
      const cagr5Y = calculateCAGRFromHistory(navHistory, 5);
      const cagr10Y = calculateCAGRFromHistory(navHistory, 10);

      // Calculate monthly returns
      const monthlyReturns = computeMonthlyReturns(navHistory);

      // Default benchmark monthly returns (e.g. 12% annualized / ~1% monthly)
      const benchmarkMonthlyReturns = monthlyReturns.map(() => 0.01);

      const sharpeRatio = monthlyReturns.length >= 6 ? annualizedSharpe(monthlyReturns) : 0;
      const sortinoRatio = monthlyReturns.length >= 6 ? calculateSortino(monthlyReturns) : 0;
      const standardDeviation = monthlyReturns.length >= 6 ? annualizedStdDev(monthlyReturns) : 0;
      const beta = monthlyReturns.length >= 6 ? calculateBeta(monthlyReturns, benchmarkMonthlyReturns) : 1.0;
      const alpha = cagr3Y !== null ? calculateAlpha(cagr3Y, 0.12, beta) : 0;

      // Calculate Maximum Drawdown
      const mddResult = calculateMaxDrawdown(navHistory);

      // Upsert metrics document
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
            standardDeviation: Number(standardDeviation.toFixed(4)),
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
        durationMs: Date.now() - startTime,
      };
    },
    {
      ...SERVERLESS_WORKER_DEFAULTS,
      concurrency: 5,
    },
  );

  return worker;
}
