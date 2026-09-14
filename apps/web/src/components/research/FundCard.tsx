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
      return 'bg-neo-cyan text-black border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('debt') || lower.includes('liquid') || lower.includes('bond')) {
      return 'bg-neo-yellow text-black border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('hybrid') || lower.includes('balanced')) {
      return 'bg-neo-purple text-white border-black shadow-[1px_1px_0px_0px_#000]';
    }
    if (lower.includes('tax') || lower.includes('elss')) {
      return 'bg-neo-lime text-black border-black shadow-[1px_1px_0px_0px_#000]';
    }
    return 'bg-[#1E1E28] text-white border-black shadow-[1px_1px_0px_0px_#000]';
  };

  return (
    <Link
      href={`/research/fund/${fund.schemeCode}`}
      className="group block p-4 sm:p-5 rounded-xl bg-[#1A1A24] border-2 border-black transition-all duration-150 hover:shadow-neo hover:-translate-y-0.5 shadow-neo-sm relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center shrink-0 text-black font-black text-sm shadow-neo-sm group-hover:bg-[#FFE570] transition-colors">
            {fund.fundHouse ? fund.fundHouse.slice(0, 2).toUpperCase() : <Building2 className="w-4 h-4 stroke-[2.5]" />}
          </div>

          <div className="min-w-0">
            <h4 className="font-black text-sm text-white truncate group-hover:text-neo-yellow transition-colors uppercase">
              {fund.schemeName}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="text-[#A0A0B2] font-mono text-[11px] truncate">{fund.fundHouse}</span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border', getCategoryColor(fund.category))}>
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
            'p-1.5 rounded-md border-2 border-black transition-all shrink-0 active:translate-x-0.5 active:translate-y-0.5',
            favorited
              ? 'bg-neo-yellow text-black shadow-neo-sm'
              : 'bg-[#121218] text-[#A0A0B2] hover:text-white',
          )}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>

      {/* NAV & Metrics Strip */}
      <div className="py-2.5 my-2 border-y-2 border-black flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#A0A0B2] font-mono font-bold uppercase block">Latest NAV</span>
          <span className="font-mono font-black text-base text-white">
            {fund.latestNAV ? `₹${fund.latestNAV.toFixed(2)}` : '—'}
          </span>
        </div>

        {fund.aum && (
          <div className="text-right">
            <span className="text-[10px] text-[#A0A0B2] font-mono font-bold uppercase block">AUM</span>
            <span className="font-mono font-bold text-xs text-white">
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
              <span className="text-[#9B9BB4] text-[10px] mr-1">1Y:</span>
              <span className={cn('font-bold', fund.cagr1Y >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]')}>
                {fund.cagr1Y >= 0 ? `+${fund.cagr1Y.toFixed(1)}%` : `${fund.cagr1Y.toFixed(1)}%`}
              </span>
            </div>
          )}

          {fund.cagr3Y !== undefined && (
            <div>
              <span className="text-[#9B9BB4] text-[10px] mr-1">3Y:</span>
              <span className={cn('font-bold', fund.cagr3Y >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]')}>
                {fund.cagr3Y >= 0 ? `+${fund.cagr3Y.toFixed(1)}%` : `${fund.cagr3Y.toFixed(1)}%`}
              </span>
            </div>
          )}

          {fund.cagr5Y !== undefined && (
            <div>
              <span className="text-[#9B9BB4] text-[10px] mr-1">5Y:</span>
              <span className={cn('font-bold', fund.cagr5Y >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]')}>
                {fund.cagr5Y >= 0 ? `+${fund.cagr5Y.toFixed(1)}%` : `${fund.cagr5Y.toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00D2FF] group-hover:translate-x-0.5 transition-transform">
          <span>Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
