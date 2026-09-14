'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowUpRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
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

interface AllocationCardProps {
  item: IAssetAllocation;
  index: number;
}

export function AllocationCard({ item, index }: AllocationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const accentColor = CHART_COLORS[index % CHART_COLORS.length];

  const handleToggleWatchlist = async () => {
    if (isSaved) return;

    setIsSaving(true);
    try {
      await api.post(API_ENDPOINTS.FAVORITES.ADD, {
        assetType: item.assetType,
        schemeCode: item.schemeCode,
        symbol: item.ticker,
        isin: item.isin,
        name: item.name,
      });

      setIsSaved(true);
      toast.success(`${item.name} added to your watchlist!`);
    } catch {
      toast.error('Asset is already in your watchlist or session expired.');
    } finally {
      setIsSaving(false);
    }
  };

  const researchUrl =
    item.assetType === 'mutual_fund' && item.schemeCode
      ? `/research/fund/${item.schemeCode}`
      : item.ticker
        ? `/research/stock/${item.ticker}`
        : '/research';

  return (
    <div className="relative p-4 sm:p-5 rounded-xl bg-[#161620] border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all space-y-3 overflow-hidden">
      {/* Left Colored Accent Bar */}
      <div
        className="absolute top-0 bottom-0 left-0 w-2.5 border-r-2 border-black"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-black text-neo-yellow">
              {item.allocationPercent}%
            </span>
            <h4 className="font-black text-sm sm:text-base text-white uppercase tracking-wide">{item.name}</h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {item.isin && (
              <span className="px-2 py-0.5 rounded bg-[#0E0E14] font-mono text-[10px] text-[#A0A0B2] border border-black">
                {item.isin}
              </span>
            )}
            {item.ticker && (
              <span className="px-2 py-0.5 rounded bg-neo-cyan text-black font-mono text-[10px] border border-black font-black uppercase">
                {item.ticker} (NSE)
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-[#0E0E14] text-[10px] font-mono text-[#A0A0B2] border border-black uppercase">
              {item.category?.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded bg-neo-green text-black text-[10px] font-mono font-black border border-black">
              ~{item.expectedReturn}% CAGR
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={handleToggleWatchlist}
            disabled={isSaving || isSaved}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              isSaved
                ? 'bg-neo-green text-black'
                : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>SAVED</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>WATCHLIST</span>
              </>
            )}
          </button>

          <Link
            href={researchUrl}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black uppercase text-black bg-neo-yellow border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span>Research</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black" />
          </Link>
        </div>
      </div>

      {/* Rationale Text */}
      <div className="pl-3 pt-2 border-t-2 border-black/40 text-xs text-[#A0A0B2] font-mono leading-relaxed flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-neo-cyan shrink-0 mt-0.5" />
        <p>
          <strong className="text-white uppercase font-black">Thesis: </strong>
          {item.reason}
        </p>
      </div>
    </div>
  );
}
