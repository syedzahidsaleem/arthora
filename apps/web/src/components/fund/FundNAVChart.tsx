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

interface FundNAVChartProps {
  schemeCode: number;
}

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'] as const;

export function FundNAVChart({ schemeCode }: FundNAVChartProps) {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('1Y');
  const { data: navHistory, isLoading, error } = useFundNAV(schemeCode, timeframe);

  const dates = navHistory?.dates || [];
  const navs = navHistory?.navs || [];

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
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4 text-[#222A2A] select-none">
      {/* Timeframe Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Historical NAV Performance
        </h3>

        <div className="flex items-center gap-1 bg-[#FBF7EE] p-1 rounded-xl border-2 border-black">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border',
                timeframe === tf
                  ? 'bg-neo-mint text-black border-black shadow-[1px_1px_0px_#000] font-black'
                  : 'text-[#525866] border-transparent hover:text-black hover:bg-neo-yellow/40',
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Body */}
      {isLoading ? (
        <div className="h-[320px] w-full rounded-2xl bg-[#FBF7EE] border-2 border-black animate-pulse flex items-center justify-center text-xs font-mono font-bold text-[#525866]">
          Loading historical NAV data...
        </div>
      ) : error || chartData.length === 0 ? (
        <div className="h-[320px] w-full rounded-2xl bg-[#FBF7EE] border-2 border-black flex items-center justify-center text-xs font-mono font-bold text-[#525866]">
          Historical NAV data is not available for this period.
        </div>
      ) : (
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fundNavGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7BED9F" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7BED9F" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#525866"
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
                stroke="#525866"
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
                      <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo space-y-1 font-mono text-xs text-[#222A2A]">
                        <div className="text-[11px] text-[#525866] font-bold">
                          {formatDate(p.date)}
                        </div>
                        <div className="text-base font-black text-black">
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
                stroke="#222A2A"
                strokeWidth={2.5}
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
export default FundNAVChart;
