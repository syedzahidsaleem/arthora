'use client';

import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import type { IStockMetrics } from '@arthora/shared';

interface StockQuarterlyResultsProps {
  symbol: string;
  metrics: IStockMetrics | null;
}

export function StockQuarterlyResults({
  symbol,
  metrics,
}: StockQuarterlyResultsProps) {
  const formatCr = (val?: number) => {
    if (!val) return '—';
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  };

  const nseUrl = `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`;

  return (
    <div className="space-y-6">
      {/* Annual Summary Metrics */}
      <div className="neo-box p-5 sm:p-6 bg-white space-y-4">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Annual Financial Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Annual Revenue"
            value={metrics?.revenueAnnual ? formatCr(metrics.revenueAnnual) : '—'}
            tooltip="Consolidated annual top-line revenue"
          />
          <MetricCard
            label="Annual Net Profit"
            value={metrics?.netProfitAnnual ? formatCr(metrics.netProfitAnnual) : '—'}
            tooltip="Consolidated annual bottom-line profit"
          />
          <MetricCard
            label="Return on Equity"
            value={metrics?.roe !== undefined ? `${metrics.roe.toFixed(2)}%` : '—'}
            tooltip="Shareholder equity returns ratio"
          />
        </div>
      </div>

      {/* Info notice + External NSE filings link */}
      <div className="neo-lilac-panel p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-black shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-black/80 font-mono">
            <span className="font-black text-black font-sans block text-sm">Official Regulatory Filings & Results</span>
            <p>
              For detailed quarterly balance sheet items, audited cash flows, and investor presentation decks, visit the official NSE India filings page.
            </p>
          </div>
        </div>

        <a
          href={nseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neo-btn bg-neo-mint text-black font-bold text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          <span>View on NSE India</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
