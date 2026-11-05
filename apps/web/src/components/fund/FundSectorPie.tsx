'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { IFundSectorAlloc } from '@arthora/shared';

const CHART_COLORS = [
  '#7BED9F',
  '#FFF7C2',
  '#4FBBBC',
  '#DDD3FF',
  '#EC4624',
  '#F39120',
  '#222A2A',
  '#E2DAC2',
  '#059669',
  '#38BDF8',
];

interface FundSectorPieProps {
  sectorAlloc: IFundSectorAlloc | null;
  onSelectSector?: (sector: string) => void;
}

export function FundSectorPie({ sectorAlloc, onSelectSector }: FundSectorPieProps) {
  const sectors = sectorAlloc?.sectorAllocations || [];

  if (sectors.length === 0) {
    return (
      <div className="h-[280px] w-full rounded-xl bg-neo-cream/50 border-2 border-black flex items-center justify-center text-xs font-mono text-black/70">
        Sector allocation data is not available for this fund.
      </div>
    );
  }

  const data = sectors.map((s, idx) => ({
    name: s.sector,
    value: s.percentage,
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
                        {d.value.toFixed(2)}% Allocation
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
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => {
                if (onSelectSector && entry && typeof entry.name === 'string') {
                  onSelectSector(entry.name);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t-2 border-black max-h-48 overflow-y-auto">
        {data.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSector && onSelectSector(item.name)}
            className="flex items-center justify-between text-xs p-2 rounded-lg bg-neo-cream border border-black hover:bg-neo-mint/30 transition-colors text-left font-mono"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-3 h-3 rounded-sm border border-black shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-black truncate font-bold">{item.name}</span>
            </div>
            <span className="font-mono font-black text-black shrink-0">
              {item.value.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
