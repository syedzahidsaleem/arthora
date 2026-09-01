'use client';

import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '@arthora/shared';
import type { IStockMetrics } from '@arthora/shared';

interface StockMetricsGridProps {
  metrics: IStockMetrics | null;
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

  const formatCr = (val?: number) => {
    if (!val) return '—';
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Row 1: Valuation */}
        <MetricCard
          label="P/E Ratio (TTM)"
          value={metrics.peRatioTTM !== undefined ? metrics.peRatioTTM.toFixed(2) : '—'}
          tooltip="Price to Earnings ratio based on Trailing Twelve Months earnings"
        />
        <MetricCard
          label="Forward P/E"
          value={metrics.peRatioForward !== undefined ? metrics.peRatioForward.toFixed(2) : '—'}
          tooltip="Price to Earnings ratio based on consensus forward earnings forecasts"
        />
        <MetricCard
          label="P/B Ratio"
          value={metrics.pbRatio !== undefined ? metrics.pbRatio.toFixed(2) : '—'}
          tooltip="Price to Book value per share ratio"
        />
        <MetricCard
          label="Dividend Yield"
          value={metrics.dividendYield !== undefined ? `${metrics.dividendYield.toFixed(2)}%` : '—'}
          tooltip="Annual dividend payout as a percentage of current share price"
        />

        {/* Row 2: Scale & Range */}
        <MetricCard
          label="Market Cap"
          value={metrics.marketCap ? formatCr(metrics.marketCap) : '—'}
          tooltip="Total market capitalization across outstanding equity shares"
        />
        <MetricCard
          label="52-Week High"
          value={metrics.week52High ? formatINR(metrics.week52High) : '—'}
          tooltip="Highest traded price reached over the trailing 52 weeks"
        />
        <MetricCard
          label="52-Week Low"
          value={metrics.week52Low ? formatINR(metrics.week52Low) : '—'}
          tooltip="Lowest traded price reached over the trailing 52 weeks"
        />
        <MetricCard
          label="Beta (Sensitivity)"
          value={metrics.beta !== undefined ? metrics.beta.toFixed(2) : '—'}
          tooltip="Price volatility relative to the broader Nifty 50 index"
        />

        {/* Row 3: Profitability & Returns */}
        <MetricCard
          label="EPS (TTM)"
          value={metrics.epsTTM !== undefined ? `₹${metrics.epsTTM.toFixed(2)}` : '—'}
          tooltip="Earnings Per Share over the trailing twelve months"
        />
        <MetricCard
          label="EPS Growth YoY"
          value={metrics.epsGrowthYoY !== undefined ? `${metrics.epsGrowthYoY > 0 ? '+' : ''}${metrics.epsGrowthYoY.toFixed(2)}%` : '—'}
          change={metrics.epsGrowthYoY}
          tooltip="Year-over-Year growth in earnings per share"
        />
        <MetricCard
          label="Return on Equity (ROE)"
          value={metrics.roe !== undefined ? `${metrics.roe.toFixed(2)}%` : '—'}
          tooltip="Net income returned as a percentage of shareholders equity"
        />
        <MetricCard
          label="ROCE"
          value={metrics.roce !== undefined ? `${metrics.roce.toFixed(2)}%` : '—'}
          tooltip="Return on Capital Employed efficiency ratio"
        />

        {/* Row 4: Financial Strength */}
        <MetricCard
          label="Revenue (TTM)"
          value={metrics.revenueTTM ? formatCr(metrics.revenueTTM) : '—'}
          tooltip="Total revenue generated over the trailing twelve months"
        />
        <MetricCard
          label="Net Profit (TTM)"
          value={metrics.netProfitTTM ? formatCr(metrics.netProfitTTM) : '—'}
          tooltip="Consolidated net profit over the trailing twelve months"
        />
        <MetricCard
          label="Debt to Equity"
          value={metrics.debtToEquity !== undefined ? metrics.debtToEquity.toFixed(2) : '—'}
          tooltip="Total financial leverage and liabilities relative to equity"
        />
        <MetricCard
          label="Return on Assets (ROA)"
          value={metrics.roa !== undefined ? `${metrics.roa.toFixed(2)}%` : '—'}
          tooltip="Profitability relative to total corporate assets"
        />
      </div>
    </div>
  );
}
