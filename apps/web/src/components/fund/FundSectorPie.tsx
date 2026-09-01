'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { IFundSectorAlloc } from '@arthora/shared';

const CHART_COLORS = [
  '#6C63FF',
  '#00D2FF',
  '#00D084',
  '#FFB800',
  '#FF4D6D',
  '#A78BFA',
  '#38BDF8',
  '#34D399',
  '#F472B6',
  '#FBBF24',
];

interface FundSectorPieProps {
  sectorAlloc: IFundSectorAlloc | null;
  onSelectSector?: (sector: string) => void;
}

export function FundSectorPie({ sectorAlloc, onSelectSector }: FundSectorPieProps) {
  const sectors = sectorAlloc?.sectorAllocations || [];

  if (sectors.length === 0) {
    return (
      <div className="h-[280px] w-full rounded-2xl bg-[#13141F]/40 border border-white/5 flex items-center justify-center text-xs text-[#9B9BB4]">
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
                    <div className="p-2.5 rounded-xl bg-[#13141F] border border-white/10 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white truncate max-w-xs">{d.name}</div>
                      <div className="font-mono text-[#00D2FF] font-bold">
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
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1B2E" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 max-h-48 overflow-y-auto">
        {data.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSector && onSelectSector(item.name)}
            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#13141F]/60 hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white truncate font-medium">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-[#00D2FF] shrink-0">
              {item.value.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
