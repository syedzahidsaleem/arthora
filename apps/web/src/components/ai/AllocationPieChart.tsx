'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { IAssetAllocation } from '@arthora/shared';

const CHART_COLORS = [
  '#7BED9F',
  '#FFF7C2',
  '#4FBBBC',
  '#DDD3FF',
  '#EC4624',
  '#F39120',
  '#222A2A',
  '#E2DAC2',
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
                    <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-neo text-xs space-y-1 text-black font-mono">
                      <div className="font-black text-black truncate max-w-xs">{d.name}</div>
                      <div className="text-black font-bold">
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
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-black text-black tracking-tight">100%</span>
          <span className="text-[10px] text-black/70 uppercase tracking-wider font-mono font-bold">
            Allocated
          </span>
        </div>
      </div>

      {/* 2-Column Custom Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t-2 border-black">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-neo-cream border border-black font-mono">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0 border border-black"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-black truncate font-bold">{item.name}</span>
            </div>
            <span className="font-mono font-black text-black shrink-0">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
