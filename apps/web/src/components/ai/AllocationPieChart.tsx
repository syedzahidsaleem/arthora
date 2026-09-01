'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { IAssetAllocation } from '@arthora/shared';

const CHART_COLORS = [
  '#6C63FF',
  '#00D2FF',
  '#00D084',
  '#FFB800',
  '#FF4D6D',
  '#A78BFA',
  '#38BDF8',
  '#34D399',
];

interface AllocationPieChartProps {
  allocation: IAssetAllocation[];
}

export function AllocationPieChart({ allocation }: AllocationPieChartProps) {
  const data = allocation.map((item, idx) => ({
    name: item.name,
    value: item.allocationPercent,
    category: item.category,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-4">
      <div className="relative h-[240px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-[#13141F] border border-white/10 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white truncate max-w-xs">{d.name}</div>
                      <div className="font-mono text-[#00D2FF] font-bold">
                        {d.value}% Allocation
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1B2E" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-extrabold text-white tracking-tight">100%</span>
          <span className="text-[10px] text-[#9B9BB4] uppercase tracking-wider font-semibold">
            Allocated
          </span>
        </div>
      </div>

      {/* 2-Column Custom Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#13141F]/60">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white truncate font-medium">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-[#00D2FF] shrink-0">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
