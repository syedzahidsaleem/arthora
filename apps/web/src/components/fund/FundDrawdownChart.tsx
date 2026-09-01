'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatDate } from '@arthora/shared';

interface DrawdownData {
  schemeCode: number;
  dates: string[];
  drawdowns: number[];
  maxDrawdown: number;
}

interface FundDrawdownChartProps {
  schemeCode: number | string;
}

export function FundDrawdownChart({ schemeCode }: FundDrawdownChartProps) {
  const [data, setData] = useState<DrawdownData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrawdown = async () => {
      try {
        const res = await api.get<DrawdownData>(
          API_ENDPOINTS.CHARTS.FUND_DRAWDOWN(schemeCode),
        );
        setData(res);
      } catch {
        // Fallback / mock empty
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDrawdown();
  }, [schemeCode]);

  const dates = data?.dates || [];
  const drawdowns = data?.drawdowns || [];

  const chartData = dates.map((d, i) => ({
    date: d,
    drawdown: drawdowns[i] !== undefined ? -Math.abs(drawdowns[i]) : 0,
  }));

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Underwater Drawdown Curve
          </h3>
          <p className="text-xs text-[#9B9BB4] mt-0.5">
            Historical peak-to-trough drawdowns and recovery periods
          </p>
        </div>

        {data?.maxDrawdown !== undefined && (
          <div className="text-right font-mono text-xs">
            <span className="text-[#9B9BB4] text-[10px] block">Max Historical DD</span>
            <span className="font-bold text-[#FF4D6D]">
              -{data.maxDrawdown.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-[240px] w-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-xs text-[#9B9BB4]">
          Loading drawdown series...
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[240px] w-full rounded-2xl bg-[#13141F]/40 border border-white/5 flex items-center justify-center text-xs text-[#9B9BB4]">
          Drawdown data is not yet computed for this scheme.
        </div>
      ) : (
        <div className="h-[240px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.0} />
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
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickFormatter={(val) => `${val}%`}
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
                        <div className="text-sm font-bold text-[#FF4D6D]">
                          Drawdown: {p.drawdown.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#FF4D6D"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
