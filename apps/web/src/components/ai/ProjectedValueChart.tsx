'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatINR } from '@arthora/shared';

interface ProjectedValueChartProps {
  timePeriodYears: number;
  monthlyInvestment: number;
  lumpSum: number;
  expectedCAGR?: number; // e.g. 14.5 (%)
}

export function ProjectedValueChart({
  timePeriodYears,
  monthlyInvestment,
  lumpSum,
  expectedCAGR = 14.0,
}: ProjectedValueChartProps) {
  // Generate annual growth points for P25 (conservative), P50 (median), and P75 (optimistic)
  const years = Math.max(1, timePeriodYears);
  const rMedian = expectedCAGR / 100;
  const rCons = Math.max(0.06, rMedian - 0.04);
  const rOpt = rMedian + 0.04;

  const calculateFutureValue = (rate: number, year: number) => {
    const monthlyRate = rate / 12;
    const months = year * 12;
    const fvSip =
      monthlyRate > 0
        ? monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        : monthlyInvestment * months;
    const fvLump = lumpSum * Math.pow(1 + rate, year);
    return Math.round(fvSip + fvLump);
  };

  const chartData = [
    {
      year: 'Year 0',
      p25: lumpSum,
      p50: lumpSum,
      p75: lumpSum,
    },
  ];

  for (let y = 1; y <= years; y++) {
    chartData.push({
      year: `Yr ${y}`,
      p25: calculateFutureValue(rCons, y),
      p50: calculateFutureValue(rMedian, y),
      p75: calculateFutureValue(rOpt, y),
    });
  }

  const finalPoint = chartData[chartData.length - 1];

  const formatYAxis = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)}Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(0)}L`;
    }
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-4">
      {/* Chart Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-mint border border-black" />
            <span className="text-black/70">Expected (P50):</span>
            <span className="font-black text-black">{formatINR(finalPoint.p50)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-sm bg-neo-yellow border border-black" />
            <span className="text-black/70">Optimistic (P75):</span>
            <span className="font-black text-[#059669]">{formatINR(finalPoint.p75)}</span>
          </div>
        </div>

        <div className="text-[11px] text-black/70 font-mono font-bold">
          Compound Projection • {years}Y Horizon
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradientP75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7BED9F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7BED9F" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="areaGradientP50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DDD3FF" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#DDD3FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="year"
              stroke="#222A2A"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#000000' }}
            />

            <YAxis
              stroke="#222A2A"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#000000' }}
              tickFormatter={formatYAxis}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo text-xs space-y-1.5 font-mono text-black">
                      <div className="font-sans font-black text-black border-b-2 border-black pb-1 uppercase">
                        {label} Projection
                      </div>
                      <div className="text-[#059669] flex justify-between gap-4 font-bold">
                        <span>P75 (Optimistic):</span>
                        <span>{formatINR(data.p75)}</span>
                      </div>
                      <div className="text-black flex justify-between gap-4 font-black">
                        <span>P50 (Expected):</span>
                        <span>{formatINR(data.p50)}</span>
                      </div>
                      <div className="text-black/70 flex justify-between gap-4">
                        <span>P25 (Conservative):</span>
                        <span>{formatINR(data.p25)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* P75 upper band */}
            <Area
              type="monotone"
              dataKey="p75"
              stroke="#059669"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#areaGradientP75)"
            />

            {/* P50 Median Primary curve */}
            <Area
              type="monotone"
              dataKey="p50"
              stroke="#222A2A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGradientP50)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
