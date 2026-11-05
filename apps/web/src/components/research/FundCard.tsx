'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowRight, Building2 } from 'lucide-react';
import { formatINR } from '@arthora/shared';
import { useFavorites } from '@/hooks/useFavorites';
import type { IFundMetadata } from '@arthora/shared';
import { cn } from '@/lib/utils';

export interface FundCardData extends IFundMetadata {
  latestNAV?: number;
  cagr1Y?: number;
  cagr3Y?: number;
  cagr5Y?: number;
  aum?: number;
}

interface FundCardProps {
  fund: FundCardData;
}

export function FundCard({ fund }: FundCardProps) {
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const favorited = isFavorited(fund.schemeCode);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorited) {
      const match = favorites.find((f) => f.schemeCode === fund.schemeCode);
      if (match) {
        void removeFavorite(match._id);
      }
    } else {
      void addFavorite({
        assetType: 'mutual_fund',
        schemeCode: fund.schemeCode,
        isin: fund.isin,
        name: fund.schemeName,
      });
    }
  };

  const getCategoryColor = (cat = '') => {
    const lower = cat.toLowerCase();
    if (lower.includes('equity') || lower.includes('cap') || lower.includes('growth')) {
      return 'bg-neo-aqua text-black border border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('debt') || lower.includes('liquid') || lower.includes('bond')) {
      return 'bg-neo-yellow text-black border border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('hybrid') || lower.includes('balanced')) {
      return 'bg-neo-lilac text-black border border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('tax') || lower.includes('elss')) {
      return 'bg-neo-mint text-black border border-black shadow-[1px_1px_0px_0px_#000]';
    }
    return 'bg-[#E2DAC2] text-black border border-black shadow-[1px_1px_0px_0px_#000]';
  };

  return (
    <Link
      href={`/research/fund/${fund.schemeCode}`}
      className="group block p-4 sm:p-5 rounded-2xl bg-white border-2 border-black transition-all duration-150 hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-neo relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black flex items-center justify-center shrink-0 text-black font-black text-sm shadow-[2px_2px_0px_#000] group-hover:bg-neo-mint transition-colors">
            {fund.fundHouse ? fund.fundHouse.slice(0, 2).toUpperCase() : <Building2 className="w-4 h-4 stroke-[2.5]" />}
          </div>

          <div className="min-w-0">
            <h4 className="font-black text-sm text-[#222A2A] truncate group-hover:text-black transition-colors uppercase">
              {fund.schemeName}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="text-[#525866] font-mono text-[11px] truncate">{fund.fundHouse}</span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', getCategoryColor(fund.category))}>
                {fund.category?.replace(/_/g, ' ') || 'Mutual Fund'}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Watchlist Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from watchlist' : 'Add to watchlist'}
          className={cn(
            'p-1.5 rounded-lg border-2 border-black transition-all shrink-0 active:translate-x-0.5 active:translate-y-0.5 shadow-neo-sm',
            favorited
              ? 'bg-neo-mint text-black'
              : 'bg-[#FBF7EE] text-[#525866] hover:text-black hover:bg-neo-yellow',
          )}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>

      {/* NAV & Metrics Strip */}
      <div className="py-2.5 my-2 border-2 border-black bg-[#FBF7EE] px-3 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#525866] font-mono font-bold uppercase block">Latest NAV</span>
          <span className="font-mono font-black text-base text-[#222A2A]">
            {fund.latestNAV ? `₹${fund.latestNAV.toFixed(2)}` : '—'}
          </span>
        </div>

        {fund.aum && (
          <div className="text-right">
            <span className="text-[10px] text-[#525866] font-mono font-bold uppercase block">AUM</span>
            <span className="font-mono font-black text-xs text-[#222A2A]">
              {formatINR(fund.aum)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Returns Row */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {fund.cagr1Y !== undefined && (
            <div>
              <span className="text-[#717684] text-[10px] mr-1">1Y:</span>
              <span className={cn('font-black', fund.cagr1Y >= 0 ? 'text-[#059669]' : 'text-neo-rust')}>
                {fund.cagr1Y >= 0 ? `+${fund.cagr1Y.toFixed(1)}%` : `${fund.cagr1Y.toFixed(1)}%`}
              </span>
            </div>
          )}

          {fund.cagr3Y !== undefined && (
            <div>
              <span className="text-[#717684] text-[10px] mr-1">3Y:</span>
              <span className={cn('font-black', fund.cagr3Y >= 0 ? 'text-[#059669]' : 'text-neo-rust')}>
                {fund.cagr3Y >= 0 ? `+${fund.cagr3Y.toFixed(1)}%` : `${fund.cagr3Y.toFixed(1)}%`}
              </span>
            </div>
          )}

          {fund.cagr5Y !== undefined && (
            <div>
              <span className="text-[#717684] text-[10px] mr-1">5Y:</span>
              <span className={cn('font-black', fund.cagr5Y >= 0 ? 'text-[#059669]' : 'text-neo-rust')}>
                {fund.cagr5Y >= 0 ? `+${fund.cagr5Y.toFixed(1)}%` : `${fund.cagr5Y.toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-black text-[#222A2A] group-hover:translate-x-1 transition-transform">
          <span>Research</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      </div>
    </Link>
  );
}
export default FundCard;
