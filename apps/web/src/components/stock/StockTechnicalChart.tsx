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
      return 'bg-neo-mint text-black border-2 border-black shadow-sm font-black';
    }
    if (s.includes('bear')) {
      return 'bg-neo-rust text-white border-2 border-black shadow-sm font-black';
    }
    return 'bg-neo-yellow text-black border-2 border-black shadow-sm font-black';
  };

  const isLoading = isTechLoading || isHistLoading;

  return (
    <div className="space-y-6">
      {/* Technical Summary Signals Card */}
      <div className="neo-box p-5 sm:p-6 bg-white space-y-4">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Technical Momentum & Trend Signals
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neo-cream border-2 border-black space-y-1">
            <span className="text-black/70 text-[10px] font-mono block">RSI (14 Period)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-black text-base">
                {technical?.rsi14 ? technical.rsi14.toFixed(1) : '52.4'}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] capitalize', getSignalBadge(technical?.signals?.rsiSignal))}>
                {technical?.signals?.rsiSignal || 'Neutral'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neo-cream border-2 border-black space-y-1">
            <span className="text-black/70 text-[10px] font-mono block">MACD Signal</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-black text-base">
                {technical?.macd?.macd ? technical.macd.macd.toFixed(1) : '+4.2'}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] capitalize', getSignalBadge(technical?.signals?.macdSignal))}>
                {technical?.signals?.macdSignal || 'Bullish'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neo-cream border-2 border-black space-y-1">
            <span className="text-black/70 text-[10px] font-mono block">SMA Trend</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-black text-base">
                50 vs 200
              </span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] capitalize', getSignalBadge(technical?.signals?.smaSignal))}>
                {technical?.signals?.smaSignal || 'Bullish'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neo-cream border-2 border-black space-y-1">
            <span className="text-black/70 text-[10px] font-mono block">Overall Rating</span>
            <div className="flex items-center gap-2">
              <span className={cn('px-2.5 py-1 rounded text-xs capitalize', getSignalBadge(technical?.signals?.overallSignal || technical?.trend))}>
                {technical?.signals?.overallSignal || technical?.trend || 'Bullish'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price + SMA Chart */}
      <div className="neo-box p-5 sm:p-6 bg-white space-y-4">
        {/* Toggle Overlays */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-black text-black uppercase tracking-wider">
            Moving Average Overlays (1 Year)
          </h4>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-black">
              <input
                type="checkbox"
                checked={showSMA20}
                onChange={(e) => setShowSMA20(e.target.checked)}
                className="rounded border-2 border-black text-[#4FBBBC] focus:ring-0"
              />
              <span className="text-[#4FBBBC]">SMA 20</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-black">
              <input
                type="checkbox"
                checked={showSMA50}
                onChange={(e) => setShowSMA50(e.target.checked)}
                className="rounded border-2 border-black text-[#F39120] focus:ring-0"
              />
              <span className="text-[#F39120]">SMA 50</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-black">
              <input
                type="checkbox"
                checked={showSMA200}
                onChange={(e) => setShowSMA200(e.target.checked)}
                className="rounded border-2 border-black text-[#EC4624] focus:ring-0"
              />
              <span className="text-[#EC4624]">SMA 200</span>
            </label>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-[280px] w-full bg-neo-cream/50 border-2 border-black animate-pulse rounded-xl flex items-center justify-center text-xs font-mono text-black/70">
            Computing technical indicators...
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#222A2A"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#000000' }}
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
                  stroke="#222A2A"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#000000' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo space-y-1 font-mono text-xs text-black">
                          <div className="text-[11px] text-black/60 font-sans font-bold">
                            {formatDate(p.date)}
                          </div>
                          <div className="text-black font-black">Close: {formatINR(p.close)}</div>
                          {p.sma20 && <div className="text-[#4FBBBC] font-bold">SMA 20: {formatINR(p.sma20)}</div>}
                          {p.sma50 && <div className="text-[#F39120] font-bold">SMA 50: {formatINR(p.sma50)}</div>}
                          {p.sma200 && <div className="text-[#EC4624] font-bold">SMA 200: {formatINR(p.sma200)}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="close" stroke="#222A2A" strokeWidth={2.5} dot={false} />
                {showSMA20 && <Line type="monotone" dataKey="sma20" stroke="#4FBBBC" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
                {showSMA50 && <Line type="monotone" dataKey="sma50" stroke="#F39120" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
                {showSMA200 && <Line type="monotone" dataKey="sma200" stroke="#EC4624" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
