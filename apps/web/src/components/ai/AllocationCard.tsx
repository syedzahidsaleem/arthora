'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowUpRight, Shield } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import type { IAssetAllocation } from '@arthora/shared';

const CHART_COLORS = [
  '#7BED9F',
  '#4FBBBC',
  '#F39120',
  '#EC4624',
  '#DDD3FF',
  '#FFF7C2',
  '#222A2A',
  '#FF6B6B',
];

interface AllocationCardProps {
  item: IAssetAllocation;
  index: number;
}

export function AllocationCard({ item, index }: AllocationCardProps) {
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const favorited = isFavorited(item.schemeCode, item.ticker);
  const accentColor = CHART_COLORS[index % CHART_COLORS.length];

  const handleToggleWatchlist = async () => {
    if (favorited) {
      const match = favorites.find((f) =>
        (item.schemeCode && f.schemeCode === item.schemeCode) ||
        (item.ticker && f.symbol?.toUpperCase() === item.ticker.toUpperCase())
      );
      if (match) {
        await removeFavorite(match._id);
      }
    } else {
      await addFavorite({
        assetType: item.assetType,
        schemeCode: item.schemeCode,
        symbol: item.ticker,
        isin: item.isin,
        name: item.name,
      });
    }
  };

  const researchUrl =
    item.assetType === 'mutual_fund' && item.schemeCode
      ? `/research/fund/${item.schemeCode}`
      : item.ticker
        ? `/research/stock/${item.ticker}`
        : '/research';

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all space-y-3 overflow-hidden text-[#222A2A]">
      {/* Left Colored Accent Bar */}
      <div
        className="absolute top-0 bottom-0 left-0 w-2.5 border-r-2 border-black"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-lg sm:text-xl font-black text-black bg-neo-yellow px-2 py-0.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000]">
              {item.allocationPercent}%
            </span>
            <h4 className="font-black text-sm sm:text-base text-[#222A2A] uppercase tracking-wide">{item.name}</h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {item.isin && (
              <span className="px-2 py-0.5 rounded-md bg-[#FBF7EE] font-mono text-[10px] text-[#525866] border border-black font-bold">
                {item.isin}
              </span>
            )}
            {item.ticker && (
              <span className="px-2 py-0.5 rounded-md bg-neo-aqua text-black font-mono text-[10px] border border-black font-black uppercase shadow-[1px_1px_0px_#000]">
                {item.ticker} (NSE)
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-neo-lilac text-black text-[10px] font-mono font-bold border border-black uppercase shadow-[1px_1px_0px_#000]">
              {item.category?.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neo-mint text-black text-[10px] font-mono font-black border border-black shadow-[1px_1px_0px_#000]">
              ~{item.expectedReturn}% CAGR
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={handleToggleWatchlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              favorited
                ? 'bg-neo-mint text-black'
                : 'bg-white text-black hover:bg-neo-yellow'
            }`}
          >
            {favorited ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>SAVED</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>WATCHLIST</span>
              </>
            )}
          </button>

          <Link
            href={researchUrl}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase text-black bg-neo-yellow border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span>Research</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Rationale Text */}
      <div className="pl-3 pt-2.5 border-t-2 border-black/30 text-xs text-[#525866] font-mono leading-relaxed flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0 mt-0.5" />
        <p>
          <strong className="text-black uppercase font-black">Thesis: </strong>
          {item.reason}
        </p>
      </div>
    </div>
  );
}
export default AllocationCard;
