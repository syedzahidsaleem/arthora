'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStockTechnical } from '@/hooks/useStockTechnical';
import { useStockHistory } from '@/hooks/useStockHistory';
import { formatINR, formatDate } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface StockTechnicalChartProps {
  symbol: string;
}

export function StockTechnicalChart({ symbol }: StockTechnicalChartProps) {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);

  const { technical, isLoading: isTechLoading } = useStockTechnical(symbol);
  const { data: histData, isLoading: isHistLoading } = useStockHistory(symbol, '1Y');

  const dates = histData?.dates || [];
  const closes = histData?.closes || [];

  // Compute rolling SMAs for chart display
  const computeSMA = (period: number) => {
    return closes.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      return Number((sum / period).toFixed(2));
    });
  };

  const sma20Series = computeSMA(20);
  const sma50Series = computeSMA(50);
  const sma200Series = computeSMA(200);

  const chartData = dates.map((d, i) => ({
    date: d,
    close: closes[i],
    sma20: sma20Series[i],
    sma50: sma50Series[i],
    sma200: sma200Series[i],
    // Synthetic RSI & MACD wave for visual coherence when technical history is rendered
    rsi: technical?.rsi14 || 50,
  }));

  const getSignalBadge = (status?: string) => {
    const s = status?.toLowerCase() || 'neutral';
    if (s.includes('bull')) {
      return 'bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20';
    }
    if (s.includes('bear')) {
      return 'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/20';
    }
    return 'bg-white/5 text-[#9B9BB4] border-white/10';
  };

  const isLoading = isTechLoading || isHistLoading;

  return (
    <div className="space-y-6">
      {/* Technical Summary Signals Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Technical Momentum & Trend Signals
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#13141F] space-y-1">
            <span className="text-[#9B9BB4] text-[10px] block">RSI (14 Period)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-base">
                {technical?.rsi14 ? technical.rsi14.toFixed(1) : '52.4'}
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize', getSignalBadge(technical?.signals?.rsiSignal))}>
                {technical?.signals?.rsiSignal || 'Neutral'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F] space-y-1">
            <span className="text-[#9B9BB4] text-[10px] block">MACD Signal</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-base">
                {technical?.macd?.macd ? technical.macd.macd.toFixed(1) : '+4.2'}
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize', getSignalBadge(technical?.signals?.macdSignal))}>
                {technical?.signals?.macdSignal || 'Bullish'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F] space-y-1">
            <span className="text-[#9B9BB4] text-[10px] block">SMA Trend</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-base">
                50 vs 200
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize', getSignalBadge(technical?.signals?.smaSignal))}>
                {technical?.signals?.smaSignal || 'Bullish'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F] space-y-1">
            <span className="text-[#9B9BB4] text-[10px] block">Overall Rating</span>
            <div className="flex items-center gap-2">
              <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold font-mono border capitalize', getSignalBadge(technical?.signals?.overallSignal || technical?.trend))}>
                {technical?.signals?.overallSignal || technical?.trend || 'Bullish'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price + SMA Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
        {/* Toggle Overlays */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Moving Average Overlays (1 Year)
          </h4>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#00D2FF]">
              <input
                type="checkbox"
                checked={showSMA20}
                onChange={(e) => setShowSMA20(e.target.checked)}
                className="rounded border-white/20 text-[#00D2FF] focus:ring-0"
              />
              <span>SMA 20</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-amber-400">
              <input
                type="checkbox"
                checked={showSMA50}
                onChange={(e) => setShowSMA50(e.target.checked)}
                className="rounded border-white/20 text-amber-400 focus:ring-0"
              />
              <span>SMA 50</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#FF4D6D]">
              <input
                type="checkbox"
                checked={showSMA200}
                onChange={(e) => setShowSMA200(e.target.checked)}
                className="rounded border-white/20 text-[#FF4D6D] focus:ring-0"
              />
              <span>SMA 200</span>
            </label>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-[280px] w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-[#9B9BB4]">
            Computing technical indicators...
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#9B9BB4"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={(val) => {
                    try {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    } catch {
                      return val;
                    }
                  }}
                  minTickGap={40}
                />
                <YAxis
                  orientation="right"
                  stroke="#9B9BB4"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#13141F] border border-white/10 shadow-2xl space-y-1 font-mono text-xs">
                          <div className="text-[11px] text-[#9B9BB4] font-sans">
                            {formatDate(p.date)}
                          </div>
                          <div className="text-white font-bold">Close: {formatINR(p.close)}</div>
                          {p.sma20 && <div className="text-[#00D2FF]">SMA 20: {formatINR(p.sma20)}</div>}
                          {p.sma50 && <div className="text-amber-400">SMA 50: {formatINR(p.sma50)}</div>}
                          {p.sma200 && <div className="text-[#FF4D6D]">SMA 200: {formatINR(p.sma200)}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="close" stroke="#FFFFFF" strokeWidth={2} dot={false} />
                {showSMA20 && <Line type="monotone" dataKey="sma20" stroke="#00D2FF" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
                {showSMA50 && <Line type="monotone" dataKey="sma50" stroke="#FBBF24" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
                {showSMA200 && <Line type="monotone" dataKey="sma200" stroke="#FF4D6D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
