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
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-black/70 uppercase tracking-wider font-bold">Market Cap Bias</span>
        <div className="flex items-center gap-3 font-bold text-[11px] text-black">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-neo-mint border border-black" /> Large: {largePct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-neo-aqua border border-black" /> Mid: {midPct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-neo-yellow border border-black" /> Small: {smallPct}%
          </span>
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="h-4 w-full rounded-md bg-neo-cream overflow-hidden flex border-2 border-black">
        <div
          style={{ width: `${largePct}%` }}
          className="bg-neo-mint h-full border-r-2 border-black transition-all"
          title={`Large Cap: ${largePct}%`}
        />
        <div
          style={{ width: `${midPct}%` }}
          className="bg-neo-aqua h-full border-r-2 border-black transition-all"
          title={`Mid Cap: ${midPct}%`}
        />
        <div
          style={{ width: `${smallPct}%` }}
          className="bg-neo-yellow h-full transition-all"
          title={`Small Cap: ${smallPct}%`}
        />
      </div>
    </div>
  );
}
