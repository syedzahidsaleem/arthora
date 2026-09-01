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
    <div className="relative p-4 sm:p-5 rounded-2xl bg-[#1A1B2E] border border-white/5 overflow-hidden transition-all hover:border-white/15 hover:shadow-lg space-y-3">
      {/* Left Colored Accent Bar */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1.5"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-black text-[#00D2FF]">
              {item.allocationPercent}%
            </span>
            <h4 className="font-bold text-sm sm:text-base text-white">{item.name}</h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {item.isin && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 font-mono text-[10px] text-[#9B9BB4] border border-white/5">
                {item.isin}
              </span>
            )}
            {item.ticker && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 font-mono text-[10px] text-[#00D2FF] border border-white/5 font-bold">
                {item.ticker} (NSE)
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-[#13141F] text-[11px] text-[#9B9BB4] capitalize">
              {item.category?.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#00D084]/10 text-[11px] font-mono font-bold text-[#00D084]">
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isSaved
                ? 'bg-[#00D084]/10 text-[#00D084] border-[#00D084]/30'
                : 'bg-white/5 text-[#9B9BB4] hover:text-white hover:bg-white/10 border-white/10'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
              </>
            )}
          </button>

          <Link
            href={researchUrl}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all"
          >
            <span>Research</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#00D2FF]" />
          </Link>
        </div>
      </div>

      {/* Rationale Text */}
      <div className="pl-2 pt-1 border-t border-white/5 text-xs text-[#9B9BB4] leading-relaxed flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-[#6C63FF] shrink-0 mt-0.5" />
        <p>
          <strong className="text-white/80 font-medium">Why this asset: </strong>
          {item.reason}
        </p>
      </div>
    </div>
  );
}
