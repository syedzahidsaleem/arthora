'use client';

import React, { useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStockHistory } from '@/hooks/useStockHistory';
import { formatINR, formatDate } from '@arthora/shared';
import { cn } from '@/lib/utils';

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', '3Y', '5Y'];

interface StockPriceChartProps {
  symbol: string;
}

export function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [timeframe, setTimeframe] = useState('1Y');
  const { data, isLoading, error } = useStockHistory(symbol, timeframe);

  const dates = data?.dates || [];
  const closes = data?.closes || [];
  const opens = data?.opens || [];
  const volumes = data?.volumes || [];

  const chartData = dates.map((d, i) => ({
    date: d,
    close: closes[i] || 0,
    open: opens[i] || 0,
    volume: volumes[i] || 0,
    isGreen: (closes[i] || 0) >= (opens[i] || 0),
  }));

  const minClose = closes.length > 0 ? Math.min(...closes.filter(Boolean)) : 0;
  const maxClose = closes.length > 0 ? Math.max(...closes.filter(Boolean)) : 100;
  const yDomain = [
    Math.floor(minClose * 0.95),
    Math.ceil(maxClose * 1.05),
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Stock Price & Volume History
        </h3>

        <div className="flex items-center gap-1 bg-neo-cream p-1 rounded-lg border-2 border-black">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border border-transparent',
                timeframe === tf
                  ? 'bg-neo-mint text-black border-black shadow-sm'
                  : 'text-black/70 hover:text-black',
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Body */}
      {isLoading ? (
        <div className="h-[360px] w-full rounded-xl bg-neo-cream/60 border-2 border-black animate-pulse flex items-center justify-center text-xs font-mono text-black/70">
          Loading stock chart data...
        </div>
      ) : error || chartData.length === 0 ? (
        <div className="h-[360px] w-full rounded-xl bg-neo-cream/40 border-2 border-black flex items-center justify-center text-xs font-mono text-black/70">
          Historical stock price data is unavailable.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Price Upper Panel */}
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4FBBBC" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4FBBBC" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

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
                  domain={yDomain}
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
                          <div className="text-base font-black text-black">
                            Close: {formatINR(p.close)}
                          </div>
                          <div className="text-black/70 text-[11px]">
                            Volume: {p.volume ? p.volume.toLocaleString('en-IN') : '—'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#222A2A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stockPriceGradient)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Lower Panel */}
          <div className="h-[90px] w-full pt-1 border-t-2 border-black/20">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <YAxis orientation="right" hide />
                <Bar
                  dataKey="volume"
                  fill="#DDD3FF"
                  stroke="#000000"
                  strokeWidth={1}
                  opacity={0.85}
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
