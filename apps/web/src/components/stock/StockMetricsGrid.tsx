'use client';

import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '@arthora/shared';
import type { IStockMetrics } from '@arthora/shared';

interface StockMetricsGridProps {
  metrics: IStockMetrics | null;
}

function safeNum(val: number | null | undefined, decimals = 2, prefix = '', suffix = ''): string {
  if (typeof val !== 'number' || isNaN(val)) return '—';
  return `${prefix}${val.toFixed(decimals)}${suffix}`;
}

export function StockMetricsGrid({ metrics }: StockMetricsGridProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <MetricCard key={i} label="Loading..." value="—" loading={true} />
        ))}
      </div>
    );
  }

  const formatCr = (val?: number | null) => {
    if (typeof val !== 'number' || isNaN(val) || val === 0) return '—';
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Row 1: Valuation */}
        <MetricCard
          label="P/E Ratio (TTM)"
          value={safeNum(metrics.peRatioTTM)}
          tooltip="Price to Earnings ratio based on Trailing Twelve Months earnings"
        />
        <MetricCard
          label="Forward P/E"
          value={safeNum(metrics.peRatioForward)}
          tooltip="Price to Earnings ratio based on consensus forward earnings forecasts"
        />
        <MetricCard
          label="P/B Ratio"
          value={safeNum(metrics.pbRatio)}
          tooltip="Price to Book value per share ratio"
        />
        <MetricCard
          label="Dividend Yield"
          value={safeNum(metrics.dividendYield, 2, '', '%')}
          tooltip="Annual dividend payout as a percentage of current share price"
        />

        {/* Row 2: Scale & Range */}
        <MetricCard
          label="Market Cap"
          value={formatCr(metrics.marketCap)}
          tooltip="Total market capitalization across outstanding equity shares"
        />
        <MetricCard
          label="52-Week High"
          value={typeof metrics.week52High === 'number' ? formatINR(metrics.week52High) : '—'}
          tooltip="Highest traded price reached over the trailing 52 weeks"
        />
        <MetricCard
          label="52-Week Low"
          value={typeof metrics.week52Low === 'number' ? formatINR(metrics.week52Low) : '—'}
          tooltip="Lowest traded price reached over the trailing 52 weeks"
        />
        <MetricCard
          label="Beta (Sensitivity)"
          value={safeNum(metrics.beta)}
          tooltip="Price volatility relative to the broader Nifty 50 index"
        />

        {/* Row 3: Profitability & Returns */}
        <MetricCard
          label="EPS (TTM)"
          value={safeNum(metrics.epsTTM, 2, '₹')}
          tooltip="Earnings Per Share over the trailing twelve months"
        />
        <MetricCard
          label="EPS Growth YoY"
          value={typeof metrics.epsGrowthYoY === 'number' ? `${metrics.epsGrowthYoY > 0 ? '+' : ''}${metrics.epsGrowthYoY.toFixed(2)}%` : '—'}
          change={typeof metrics.epsGrowthYoY === 'number' ? metrics.epsGrowthYoY : undefined}
          tooltip="Year-over-Year growth in earnings per share"
        />
        <MetricCard
          label="Return on Equity (ROE)"
          value={safeNum(metrics.roe, 2, '', '%')}
          tooltip="Net income returned as a percentage of shareholders equity"
        />
        <MetricCard
          label="ROCE"
          value={safeNum(metrics.roce, 2, '', '%')}
          tooltip="Return on Capital Employed efficiency ratio"
        />

        {/* Row 4: Financial Strength */}
        <MetricCard
          label="Revenue (TTM)"
          value={formatCr(metrics.revenueTTM)}
          tooltip="Total revenue generated over the trailing twelve months"
        />
        <MetricCard
          label="Net Profit (TTM)"
          value={formatCr(metrics.netProfitTTM)}
          tooltip="Consolidated net profit over the trailing twelve months"
        />
        <MetricCard
          label="Debt to Equity"
          value={safeNum(metrics.debtToEquity)}
          tooltip="Total financial leverage and liabilities relative to equity"
        />
        <MetricCard
          label="Return on Assets (ROA)"
          value={safeNum(metrics.roa, 2, '', '%')}
          tooltip="Profitability relative to total corporate assets"
        />
      </div>
    </div>
  );
}
