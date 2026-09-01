'use client';

import React from 'react';
import type { IFundHoldingItem } from '@arthora/shared';

interface MarketCapBarProps {
  holdings: IFundHoldingItem[];
}

export function MarketCapBar({ holdings }: MarketCapBarProps) {
  let large = 0;
  let mid = 0;
  let small = 0;
  let totalWeight = 0;

  holdings.forEach((h) => {
    totalWeight += h.percentage || 0;
    if (h.marketCapType === 'large') large += h.percentage || 0;
    else if (h.marketCapType === 'mid') mid += h.percentage || 0;
    else if (h.marketCapType === 'small') small += h.percentage || 0;
    else large += h.percentage || 0; // Default fallback
  });

  const base = totalWeight > 0 ? totalWeight : 100;
  const largePct = ((large / base) * 100).toFixed(1);
  const midPct = ((mid / base) * 100).toFixed(1);
  const smallPct = ((small / base) * 100).toFixed(1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-[#9B9BB4] uppercase tracking-wider">Market Cap Bias</span>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-[#00D2FF]">Large: {largePct}%</span>
          <span className="text-[#6C63FF]">Mid: {midPct}%</span>
          <span className="text-amber-400">Small: {smallPct}%</span>
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="h-3 w-full rounded-full bg-[#13141F] overflow-hidden flex border border-white/5">
        <div
          style={{ width: `${largePct}%` }}
          className="bg-[#00D2FF] h-full transition-all"
          title={`Large Cap: ${largePct}%`}
        />
        <div
          style={{ width: `${midPct}%` }}
          className="bg-[#6C63FF] h-full transition-all"
          title={`Mid Cap: ${midPct}%`}
        />
        <div
          style={{ width: `${smallPct}%` }}
          className="bg-amber-400 h-full transition-all"
          title={`Small Cap: ${smallPct}%`}
        />
      </div>
    </div>
  );
}
