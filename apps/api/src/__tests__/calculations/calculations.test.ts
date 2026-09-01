import { describe, it, expect } from 'vitest';
import {
  calculateCAGR,
  calculateCAGRFromHistory,
  calculateXIRR,
  calculateSharpe,
  annualizedSharpe,
  calculateSortino,
  calculateBeta,
  calculateAlpha,
  calculateStdDev,
  annualizedStdDev,
  calculateMaxDrawdown,
  calculateRollingReturns,
  runMonteCarloSimulation,
} from '../../lib/calculations';

describe('Financial Calculations Engine', () => {
  describe('CAGR Calculation', () => {
    it('accurately computes CAGR for known values', () => {
      // 10,000 growing to 16,105 in 5 years is ~10% CAGR
      const cagr = calculateCAGR(10000, 16105.1, 5);
      expect(cagr).toBeCloseTo(0.10, 3);
    });

    it('computes CAGR from chronological NAV history', () => {
      const today = new Date('2024-01-01');
      const oneYearAgo = new Date('2023-01-01');
      const history = [
        { date: oneYearAgo, nav: 100 },
        { date: new Date('2023-06-01'), nav: 110 },
        { date: today, nav: 120 },
      ];

      const cagr1Y = calculateCAGRFromHistory(history, 1);
      expect(cagr1Y).toBeCloseTo(0.20, 2);
    });
  });

  describe('XIRR Calculation', () => {
    it('computes XIRR for monthly SIP cashflows', () => {
      // 12 monthly outflows of 10,000 and redemption of 130,000 at end of year (~16.7% XIRR)
      const cashflows = [
        { date: new Date('2023-01-01'), amount: -10000 },
        { date: new Date('2023-02-01'), amount: -10000 },
        { date: new Date('2023-03-01'), amount: -10000 },
        { date: new Date('2023-04-01'), amount: -10000 },
        { date: new Date('2023-05-01'), amount: -10000 },
        { date: new Date('2023-06-01'), amount: -10000 },
        { date: new Date('2023-07-01'), amount: -10000 },
        { date: new Date('2023-08-01'), amount: -10000 },
        { date: new Date('2023-09-01'), amount: -10000 },
        { date: new Date('2023-10-01'), amount: -10000 },
        { date: new Date('2023-11-01'), amount: -10000 },
        { date: new Date('2023-12-01'), amount: -10000 },
        { date: new Date('2024-01-01'), amount: 130000 },
      ];

      const xirr = calculateXIRR(cashflows);
      expect(xirr).toBeGreaterThan(0.14);
      expect(xirr).toBeLessThan(0.18);
    });

    it('throws error if all cashflows are same sign', () => {
      const invalid = [
        { date: new Date('2023-01-01'), amount: -1000 },
        { date: new Date('2023-02-01'), amount: -2000 },
      ];
      expect(() => calculateXIRR(invalid)).toThrow();
    });
  });

  describe('Standard Deviation', () => {
    it('computes sample standard deviation correctly', () => {
      const returns = [0.01, 0.02, -0.01, 0.03];
      // Mean = 0.0125, Deviations = [-0.0025, 0.0075, -0.0225, 0.0175]
      // Variance = (6.25e-6 + 56.25e-6 + 506.25e-6 + 306.25e-6) / 3 = 875e-6 / 3 = 0.000291667
      // StdDev = sqrt(0.000291667) = ~0.017078
      const sd = calculateStdDev(returns);
      expect(sd).toBeCloseTo(0.017078, 4);

      const annualized = annualizedStdDev(returns);
      expect(annualized).toBeCloseTo(sd * Math.sqrt(12), 4);
    });
  });

  describe('Sharpe & Sortino Ratios', () => {
    it('computes monthly and annualized Sharpe ratio', () => {
      const monthlyReturns = [0.02, 0.015, -0.005, 0.03, 0.018, 0.022];
      const sharpe = calculateSharpe(monthlyReturns, 0.006);
      expect(sharpe).toBeGreaterThan(0);

      const annSharpe = annualizedSharpe(monthlyReturns, 0.072);
      expect(annSharpe).toBeCloseTo(sharpe * Math.sqrt(12), 3);
    });

    it('computes Sortino ratio focusing only on downside returns', () => {
      const monthlyReturns = [0.03, 0.04, -0.02, 0.01, -0.01, 0.02];
      const sortino = calculateSortino(monthlyReturns, 0.006);
      expect(sortino).toBeGreaterThan(0);
    });
  });

  describe('Alpha & Beta', () => {
    it('calculates Beta and Alpha against benchmark', () => {
      const fund = [0.02, 0.04, -0.01, 0.03];
      const bench = [0.01, 0.03, -0.005, 0.02];

      const beta = calculateBeta(fund, bench);
      expect(beta).toBeGreaterThan(0);

      const alpha = calculateAlpha(0.15, 0.12, beta, 0.072);
      expect(alpha).toBeDefined();
    });
  });

  describe('Max Drawdown', () => {
    it('computes max drawdown and identifies peak/trough correctly', () => {
      const d = (days: number) => new Date(2023, 0, days);
      const navs = [
        { date: d(1), nav: 100 },
        { date: d(2), nav: 120 }, // Peak (120)
        { date: d(3), nav: 80 },
        { date: d(4), nav: 90 },
        { date: d(5), nav: 70 }, // Trough (70) -> Drawdown = (120-70)/120 = 50/120 = 41.67%
        { date: d(6), nav: 110 },
      ];

      const result = calculateMaxDrawdown(navs);
      expect(result.maxDrawdown).toBeCloseTo(0.4167, 3);
      expect(result.peakDate).toEqual(d(2));
      expect(result.troughDate).toEqual(d(5));
    });
  });

  describe('Rolling Returns', () => {
    it('computes rolling returns array over target window', () => {
      const navs: Array<{ date: Date; nav: number }> = [];
      const startDate = new Date('2020-01-01');

      for (let i = 0; i <= 400; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        navs.push({ date, nav: 100 + i * 0.1 });
      }

      const rolling = calculateRollingReturns(navs, 1);
      expect(rolling.length).toBeGreaterThan(0);
      expect(rolling[0]?.cagr).toBeGreaterThan(0);
    });
  });

  describe('Monte Carlo Simulation', () => {
    it('produces deterministic output when seed is provided', () => {
      const params = {
        monthlyInvestment: 10000,
        lumpSum: 0,
        timePeriodYears: 10,
        expectedCAGR: 0.12,
        stdDev: 0.15,
        simulations: 1000,
        seed: 42,
      };

      const result1 = runMonteCarloSimulation(params);
      const result2 = runMonteCarloSimulation(params);

      expect(result1.p50).toBe(result2.p50);
      expect(result1.p10).toBe(result2.p10);
      expect(result1.p90).toBe(result2.p90);
      expect(result1.projectedCorpus).toBeGreaterThan(1200000); // 10k/mo for 10y is 1.2M principal
    });
  });
});
