'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFundNAV } from '@/hooks/useFundNAV';
import { formatINR, formatDate } from '@arthora/shared';
import { cn } from '@/lib/utils';

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'];

interface FundNAVChartProps {
  schemeCode: number | string;
}

export function FundNAVChart({ schemeCode }: FundNAVChartProps) {
  const [timeframe, setTimeframe] = useState('1Y');
  const { data, isLoading, error } = useFundNAV(schemeCode, timeframe);

  const dates = data?.dates || [];
  const navs = data?.navs || [];

  const chartData = dates.map((d, i) => ({
    date: d,
    nav: navs[i],
  }));

  const minNAV = navs.length > 0 ? Math.min(...navs) : 0;
  const maxNAV = navs.length > 0 ? Math.max(...navs) : 100;
  const yDomain = [
    Math.floor(minNAV * 0.95),
    Math.ceil(maxNAV * 1.05),
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
      {/* Timeframe Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Historical NAV Performance
        </h3>

        <div className="flex items-center gap-1 bg-[#13141F] p-1 rounded-xl border border-white/5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all',
                timeframe === tf
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] text-white shadow-md'
                  : 'text-[#9B9BB4] hover:text-white',
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Body */}
      {isLoading ? (
        <div className="h-[320px] w-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-xs text-[#9B9BB4]">
          Loading historical NAV data...
        </div>
      ) : error || chartData.length === 0 ? (
        <div className="h-[320px] w-full rounded-2xl bg-[#13141F]/40 border border-white/5 flex items-center justify-center text-xs text-[#9B9BB4]">
          Historical NAV data is not available for this period.
        </div>
      ) : (
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fundNavGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>

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
                domain={yDomain}
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
                        <div className="text-base font-bold text-white">
                          NAV: {formatINR(p.nav)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="nav"
                stroke="#6C63FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fundNavGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
