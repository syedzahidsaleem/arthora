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
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
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
      <div className="p-5 rounded-2xl bg-[#13141F] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-[#9B9BB4]">
            <span className="font-semibold text-white">Official Regulatory Filings & Results</span>
            <p>
              For detailed quarterly balance sheet items, audited cash flows, and investor presentation decks, visit the official NSE India filings page.
            </p>
          </div>
        </div>

        <a
          href={nseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 transition-all shrink-0 shadow-md shadow-[#6C63FF]/20"
        >
          <span>View on NSE India</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
