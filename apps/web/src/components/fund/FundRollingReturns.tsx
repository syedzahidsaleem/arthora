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
import type { IFundMetrics, IRollingReturnPoint } from '@arthora/shared';
import { formatDate } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface FundRollingReturnsProps {
  metrics: IFundMetrics | null;
}

export function FundRollingReturns({ metrics }: FundRollingReturnsProps) {
  const [activeWindow, setActiveWindow] = useState<'1Y' | '3Y' | '5Y'>('3Y');

  const rollingData: IRollingReturnPoint[] =
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
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Rolling Return Distribution
          </h3>
          <p className="text-xs text-[#9B9BB4] mt-0.5">
            Consistency of annualized returns across rolling holding periods
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#13141F] p-1 rounded-xl border border-white/5">
          {(['1Y', '3Y', '5Y'] as const).map((win) => (
            <button
              key={win}
              type="button"
              onClick={() => setActiveWindow(win)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all',
                activeWindow === win
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] text-white shadow-md'
                  : 'text-[#9B9BB4] hover:text-white',
              )}
            >
              {win} Rolling
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[220px] w-full rounded-2xl bg-[#13141F]/40 border border-white/5 flex items-center justify-center text-xs text-[#9B9BB4]">
          Rolling return data is being calculated for this time horizon.
        </div>
      ) : (
        <div className="h-[220px] w-full pt-2">
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
                tickFormatter={(val) => `${val}%`}
              />

              <ReferenceLine y={0} stroke="#9B9BB4" strokeDasharray="3 3" opacity={0.3} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-[#13141F] border border-white/10 shadow-2xl space-y-1 font-mono text-xs">
                        <div className="text-[11px] text-[#9B9BB4] font-sans">
                          {formatDate(p.date)}
                        </div>
                        <div className="text-sm font-bold text-[#00D084]">
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
                stroke="#00D2FF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
