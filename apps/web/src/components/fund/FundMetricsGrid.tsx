'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '@arthora/shared';
import type { IFundMetrics } from '@arthora/shared';

interface FundMetricsGridProps {
  metrics: IFundMetrics | null;
  calculating?: boolean;
}

function safeNum(val: number | null | undefined, decimals = 2, prefix = '', suffix = ''): string {
  if (typeof val !== 'number' || isNaN(val)) return '—';
  return `${prefix}${val.toFixed(decimals)}${suffix}`;
}

export function FundMetricsGrid({ metrics, calculating = false }: FundMetricsGridProps) {
  if (calculating || !metrics) {
    return (
      <div className="space-y-4">
        {calculating && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-neo-lilac border-2 border-black text-xs font-bold text-black shadow-neo-sm animate-pulse">
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Institutional quantitative metrics are currently being calculated in the background...</span>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MetricCard key={i} label="Loading..." value="—" loading={true} />
          ))}
        </div>
      </div>
    );
  }

  const formatCAGR = (val?: number | null) => {
    if (typeof val !== 'number' || isNaN(val)) return '—';
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Row 1 - Returns */}
        <MetricCard
          label="1Y CAGR"
          value={formatCAGR(metrics.cagr1Y)}
          change={typeof metrics.cagr1Y === 'number' ? metrics.cagr1Y : undefined}
          tooltip="Compound Annual Growth Rate over the last 12 months"
        />
        <MetricCard
          label="3Y CAGR"
          value={formatCAGR(metrics.cagr3Y)}
          change={typeof metrics.cagr3Y === 'number' ? metrics.cagr3Y : undefined}
          tooltip="Annualized return over a 3-year rolling period"
        />
        <MetricCard
          label="5Y CAGR"
          value={formatCAGR(metrics.cagr5Y)}
          change={typeof metrics.cagr5Y === 'number' ? metrics.cagr5Y : undefined}
          tooltip="Annualized return over a 5-year rolling period"
        />
        <MetricCard
          label="10Y CAGR"
          value={formatCAGR(metrics.cagr10Y)}
          change={typeof metrics.cagr10Y === 'number' ? metrics.cagr10Y : undefined}
          tooltip="Long-term 10-year compound annual growth rate"
        />

        {/* Row 2 - Risk Adjusted Metrics */}
        <MetricCard
          label="Sharpe Ratio"
          value={safeNum(metrics.sharpeRatio)}
          tooltip="Excess return per unit of total risk (Rf = 6.5% RBI 91D T-Bill)"
        />
        <MetricCard
          label="Sortino Ratio"
          value={safeNum(metrics.sortinoRatio)}
          tooltip="Risk-adjusted return focusing exclusively on harmful downside volatility"
        />
        <MetricCard
          label="Alpha (Jensen's)"
          value={typeof metrics.alpha === 'number' ? `${metrics.alpha > 0 ? '+' : ''}${metrics.alpha.toFixed(2)}%` : '—'}
          change={typeof metrics.alpha === 'number' ? metrics.alpha : undefined}
          tooltip="Excess performance generated over the benchmark index"
        />
        <MetricCard
          label="Beta (Sensitivity)"
          value={safeNum(metrics.beta)}
          tooltip="Systematic volatility relative to the benchmark index (1.0 = benchmark)"
        />

        {/* Row 3 - Volatility & Costs */}
        <MetricCard
          label="Std Deviation"
          value={safeNum(metrics.stdDev, 2, '', '%')}
          tooltip="Annualized historical volatility of monthly returns"
        />
        <MetricCard
          label="Max Drawdown"
          value={typeof metrics.maxDrawdown === 'number' ? `-${metrics.maxDrawdown.toFixed(2)}%` : '—'}
          change={typeof metrics.maxDrawdown === 'number' ? -metrics.maxDrawdown : undefined}
          tooltip="Largest peak-to-trough decline across entire historical series"
        />
        <MetricCard
          label="Expense Ratio"
          value={safeNum(metrics.expenseRatio, 2, '', '%')}
          tooltip="Total annual fund management cost charged as a percentage of NAV"
        />
        <MetricCard
          label="Fund AUM"
          value={typeof metrics.aum === 'number' ? formatINR(metrics.aum) : '—'}
          tooltip="Total Assets Under Management managed in this scheme"
        />
      </div>
    </div>
  );
}
