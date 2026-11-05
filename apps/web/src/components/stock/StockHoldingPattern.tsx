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
    <div className="neo-box p-5 sm:p-6 bg-white space-y-6">
      <div>
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Shareholding Pattern Breakdown
        </h3>
        <p className="text-xs font-mono text-black/70 mt-0.5">
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
      <div className="space-y-2 pt-3 border-t-2 border-black">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-black">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-mint border border-black" /> Promoter: {promoter.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-aqua border border-black" /> FII: {fii.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-yellow border border-black" /> DII: {dii.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-lilac border border-black" /> Public: {publicHolding.toFixed(1)}%
          </span>
        </div>

        <div className="h-5 w-full rounded-md bg-neo-cream overflow-hidden flex border-2 border-black">
          <div style={{ width: `${promoter}%` }} className="bg-neo-mint h-full border-r-2 border-black" />
          <div style={{ width: `${fii}%` }} className="bg-neo-aqua h-full border-r-2 border-black" />
          <div style={{ width: `${dii}%` }} className="bg-neo-yellow h-full border-r-2 border-black" />
          <div style={{ width: `${publicHolding}%` }} className="bg-neo-lilac h-full" />
        </div>
      </div>
    </div>
  );
}
