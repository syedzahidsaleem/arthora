import { describe, it, expect } from 'vitest';
import { calculateCAGRFromHistory } from '../../lib/calculations/cagr';
import { calculateMaxDrawdown } from '../../lib/calculations/maxDrawdown';
import { calculateXIRR } from '../../lib/calculations/xirr';
import { annualizedSharpe } from '../../lib/calculations/sharpe';
import type { INAVPoint } from '@arthora/shared';

describe('Data Sync & Financial Calculations Integration', () => {
  it('calculates 5-year CAGR of 10% exactly from seeded NAV trajectory (100 -> 161.05)', () => {
    const startDate = new Date('2019-01-01');
    const endDate = new Date('2024-01-01');

    const navHistory: INAVPoint[] = [
      { date: startDate, nav: 100.0 },
      { date: new Date('2020-01-01'), nav: 110.0 },
      { date: new Date('2021-01-01'), nav: 121.0 },
      { date: new Date('2022-01-01'), nav: 133.1 },
      { date: new Date('2023-01-01'), nav: 146.41 },
      { date: endDate, nav: 161.051 },
    ];

    const cagr5Y = calculateCAGRFromHistory(navHistory, 5);
    expect(cagr5Y).toBeDefined();
    expect(cagr5Y).toBeCloseTo(0.10, 3); // 10% ± 0.001
  });

  it('calculates max drawdown of ~41.67% when peak is 120 and trough is 70', () => {
    const navHistory: INAVPoint[] = [
      { date: new Date('2023-01-01'), nav: 100 },
      { date: new Date('2023-03-01'), nav: 120 }, // Peak
      { date: new Date('2023-06-01'), nav: 90 },
      { date: new Date('2023-09-01'), nav: 70 },  // Trough
      { date: new Date('2023-12-01'), nav: 110 },
    ];

    const drawdownResult = calculateMaxDrawdown(navHistory);
    expect(drawdownResult.maxDrawdown).toBeCloseTo(0.4167, 3); // (120 - 70) / 120 ≈ 0.41666...
    expect(drawdownResult.peakDate).toEqual(new Date('2023-03-01'));
    expect(drawdownResult.troughDate).toEqual(new Date('2023-09-01'));
  });

  it('calculates valid positive XIRR for 12 monthly outflows and final lump-sum inflow', () => {
    const transactions = [
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
      { date: new Date('2024-01-01'), amount: 130000 }, // +10,000 gain on 120,000 SIP
    ];

    const xirr = calculateXIRR(transactions);
    expect(xirr).toBeGreaterThan(0.14);
    expect(xirr).toBeLessThan(0.19);
  });

  it('calculates positive annualized Sharpe ratio for net-positive monthly return sequence', () => {
    const monthlyReturns = [
      0.01, 0.015, -0.005, 0.02, 0.01, 0.008, -0.003, 0.018, 0.012, 0.009, 0.014, 0.007,
    ];
    const riskFreeRate = 0.06; // 6% annual risk free rate

    const sharpe = annualizedSharpe(monthlyReturns, riskFreeRate);
    expect(sharpe).toBeGreaterThan(0);
  });
});
