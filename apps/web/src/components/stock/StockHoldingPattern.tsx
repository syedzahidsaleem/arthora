'use client';

import React from 'react';
import { MetricCard } from '../common/MetricCard';
import type { IStockMetrics } from '@arthora/shared';

interface StockHoldingPatternProps {
  metrics: IStockMetrics | null;
}

export function StockHoldingPattern({ metrics }: StockHoldingPatternProps) {
  const promoter = metrics?.promoterHolding || 50.5;
  const fii = metrics?.fiiHolding || 22.4;
  const dii = metrics?.diiHolding || 15.8;
  const publicHolding = Math.max(0, Number((100 - promoter - fii - dii).toFixed(1)));

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Shareholding Pattern Breakdown
        </h3>
        <p className="text-xs text-[#9B9BB4] mt-0.5">
          Distribution of institutional and promoter equity ownership
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Promoter Holding"
          value={`${promoter.toFixed(1)}%`}
          change={metrics?.promoterHoldingChange}
          changeLabel="vs last quarter"
          tooltip="Equity stake held by company founders and promoters"
        />
        <MetricCard
          label="FII / FPI Stake"
          value={`${fii.toFixed(1)}%`}
          tooltip="Foreign Institutional Investors and sovereign wealth funds"
        />
        <MetricCard
          label="DII Stake"
          value={`${dii.toFixed(1)}%`}
          tooltip="Domestic Institutional Investors (Indian Mutual Funds, LIC, Insurance)"
        />
        <MetricCard
          label="Public & Retail"
          value={`${publicHolding.toFixed(1)}%`}
          tooltip="Individual retail investors and non-institutional public"
        />
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs font-mono text-[#9B9BB4]">
          <span className="flex items-center gap-1.5 text-[#00D2FF]">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF]" /> Promoter: {promoter.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 text-[#6C63FF]">
            <span className="w-2 h-2 rounded-full bg-[#6C63FF]" /> FII: {fii.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> DII: {dii.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 text-[#9B9BB4]">
            <span className="w-2 h-2 rounded-full bg-[#9B9BB4]" /> Public: {publicHolding.toFixed(1)}%
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-[#13141F] overflow-hidden flex border border-white/5">
          <div style={{ width: `${promoter}%` }} className="bg-[#00D2FF] h-full" />
          <div style={{ width: `${fii}%` }} className="bg-[#6C63FF] h-full" />
          <div style={{ width: `${dii}%` }} className="bg-amber-400 h-full" />
          <div style={{ width: `${publicHolding}%` }} className="bg-[#9B9BB4]" />
        </div>
      </div>
    </div>
  );
}
