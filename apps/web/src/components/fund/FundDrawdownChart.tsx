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

interface FundDrawdownChartProps {
  schemeCode: number;
}

interface DrawdownData {
  dates: string[];
  drawdowns: number[];
  maxDrawdown: number;
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
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4 text-[#222A2A] select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            Underwater Drawdown Curve
          </h3>
          <p className="text-xs text-[#525866] font-mono font-bold mt-0.5">
            Historical peak-to-trough drawdowns and recovery periods
          </p>
        </div>

        {data?.maxDrawdown !== undefined && (
          <div className="text-right font-mono text-xs">
            <span className="text-[#525866] text-[10px] font-bold uppercase block">Max Historical DD</span>
            <span className="font-black text-neo-rust bg-neo-rust/15 px-2 py-0.5 rounded border border-black inline-block mt-0.5">
              -{data.maxDrawdown.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-[240px] w-full rounded-2xl bg-[#FBF7EE] border-2 border-black animate-pulse flex items-center justify-center text-xs font-mono font-bold text-[#525866]">
          Loading drawdown series...
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[240px] w-full rounded-2xl bg-[#FBF7EE] border-2 border-black flex items-center justify-center text-xs font-mono font-bold text-[#525866]">
          Drawdown data is not yet computed for this scheme.
        </div>
      ) : (
        <div className="h-[240px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4624" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#EC4624" stopOpacity={0.0} />
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
                tickLine={false}
                axisLine={{ stroke: '#000000' }}
                tickFormatter={(val) => `${val}%`}
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
                        <div className="text-sm font-black text-neo-rust">
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
                stroke="#EC4624"
                strokeWidth={2}
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
export default FundDrawdownChart;
