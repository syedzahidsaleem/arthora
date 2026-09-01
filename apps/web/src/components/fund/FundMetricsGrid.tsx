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

export function FundMetricsGrid({ metrics, calculating = false }: FundMetricsGridProps) {
  if (calculating || !metrics) {
    return (
      <div className="space-y-4">
        {calculating && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-xs text-[#00D2FF] animate-pulse">
            <Sparkles className="w-4 h-4" />
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

  const formatCAGR = (val?: number) => (val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '—');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Row 1 - Returns */}
        <MetricCard
          label="1Y CAGR"
          value={formatCAGR(metrics.cagr1Y)}
          change={metrics.cagr1Y}
          tooltip="Compound Annual Growth Rate over the last 12 months"
        />
        <MetricCard
          label="3Y CAGR"
          value={formatCAGR(metrics.cagr3Y)}
          change={metrics.cagr3Y}
          tooltip="Annualized return over a 3-year rolling period"
        />
        <MetricCard
          label="5Y CAGR"
          value={formatCAGR(metrics.cagr5Y)}
          change={metrics.cagr5Y}
          tooltip="Annualized return over a 5-year rolling period"
        />
        <MetricCard
          label="10Y CAGR"
          value={formatCAGR(metrics.cagr10Y)}
          change={metrics.cagr10Y}
          tooltip="Long-term 10-year compound annual growth rate"
        />

        {/* Row 2 - Risk Adjusted Metrics */}
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpeRatio !== undefined ? metrics.sharpeRatio.toFixed(2) : '—'}
          tooltip="Excess return per unit of total risk (Rf = 6.5% RBI 91D T-Bill)"
        />
        <MetricCard
          label="Sortino Ratio"
          value={metrics.sortinoRatio !== undefined ? metrics.sortinoRatio.toFixed(2) : '—'}
          tooltip="Risk-adjusted return focusing exclusively on harmful downside volatility"
        />
        <MetricCard
          label="Alpha (Jensen's)"
          value={metrics.alpha !== undefined ? `${metrics.alpha > 0 ? '+' : ''}${metrics.alpha.toFixed(2)}%` : '—'}
          change={metrics.alpha}
          tooltip="Excess performance generated over the benchmark index"
        />
        <MetricCard
          label="Beta (Sensitivity)"
          value={metrics.beta !== undefined ? metrics.beta.toFixed(2) : '—'}
          tooltip="Systematic volatility relative to the benchmark index (1.0 = benchmark)"
        />

        {/* Row 3 - Volatility & Costs */}
        <MetricCard
          label="Std Deviation"
          value={metrics.stdDev !== undefined ? `${metrics.stdDev.toFixed(2)}%` : '—'}
          tooltip="Annualized historical volatility of monthly returns"
        />
        <MetricCard
          label="Max Drawdown"
          value={metrics.maxDrawdown !== undefined ? `-${metrics.maxDrawdown.toFixed(2)}%` : '—'}
          change={metrics.maxDrawdown !== undefined ? -metrics.maxDrawdown : undefined}
          tooltip="Largest peak-to-trough decline across entire historical series"
        />
        <MetricCard
          label="Expense Ratio"
          value={metrics.expenseRatio !== undefined ? `${metrics.expenseRatio.toFixed(2)}%` : '—'}
          tooltip="Total annual management and operating fee charged by the AMC"
        />
        <MetricCard
          label="Exit Load"
          value={metrics.exitLoad || 'Nil'}
          tooltip="Redemption fee charged if units are sold before lock-in"
        />

        {/* Row 4 - Info & Minimums */}
        <MetricCard
          label="Total AUM"
          value={metrics.aum ? `₹${(metrics.aum / 100).toFixed(0)} Cr` : '—'}
          tooltip="Total Assets Under Management across the scheme"
        />
        <MetricCard
          label="Minimum SIP"
          value={metrics.minSIP ? formatINR(metrics.minSIP) : '₹500'}
          tooltip="Minimum required monthly Systematic Investment Plan installment"
        />
        <MetricCard
          label="Fund Manager"
          value={metrics.fundManagerName || 'AMC Team'}
          tooltip="Lead portfolio manager responsible for investment decisions"
        />
        <MetricCard
          label="Manager Tenure"
          value={metrics.fundManagerTenure ? `${metrics.fundManagerTenure} Yrs` : '—'}
          tooltip="Tenure of the current lead fund manager on this scheme"
        />
      </div>
    </div>
  );
}
