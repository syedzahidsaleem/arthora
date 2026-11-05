'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { IFundMetrics } from '@arthora/shared';
import { formatDate } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface FundRollingReturnsProps {
  metrics: IFundMetrics | null;
}

export function FundRollingReturns({ metrics }: FundRollingReturnsProps) {
  const [activeWindow, setActiveWindow] = useState<'1Y' | '3Y' | '5Y'>('3Y');

  const rollingData =
    activeWindow === '1Y'
      ? metrics?.rollingReturn1Y || []
      : activeWindow === '3Y'
        ? metrics?.rollingReturn3Y || []
        : metrics?.rollingReturn5Y || [];

  const chartData = rollingData.map((d) => ({
    date: d.date,
    cagr: d.value,
  }));

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4 text-[#222A2A] select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            Rolling Return Distribution
          </h3>
          <p className="text-xs text-[#525866] font-mono font-bold mt-0.5">
            Consistency of annualized returns across rolling holding periods
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FBF7EE] p-1 rounded-xl border-2 border-black">
          {(['1Y', '3Y', '5Y'] as const).map((win) => (
            <button
              key={win}
              type="button"
              onClick={() => setActiveWindow(win)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border',
                activeWindow === win
                  ? 'bg-neo-mint text-black border-black shadow-[1px_1px_0px_#000] font-black'
                  : 'text-[#525866] border-transparent hover:text-black hover:bg-neo-yellow/40',
              )}
            >
              {win} Rolling
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[220px] w-full rounded-2xl bg-[#FBF7EE] border-2 border-black flex items-center justify-center text-xs font-mono font-bold text-[#525866]">
          Rolling return data is being calculated for this time horizon.
        </div>
      ) : (
        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickLine={false}
                axisLine={{ stroke: '#000000' }}
                tickFormatter={(val) => `${val}%`}
              />

              <ReferenceLine y={0} stroke="#000000" strokeDasharray="3 3" opacity={0.5} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo space-y-1 font-mono text-xs text-[#222A2A]">
                        <div className="text-[11px] text-[#525866] font-bold">
                          {formatDate(p.date)}
                        </div>
                        <div className="text-sm font-black text-[#059669]">
                          {activeWindow} CAGR: {p.cagr.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="cagr"
                stroke="#4FBBBC"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
export default FundRollingReturns;
