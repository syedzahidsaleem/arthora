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
      return 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/20';
    }
    if (lower.includes('debt') || lower.includes('liquid') || lower.includes('bond')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    }
    if (lower.includes('hybrid') || lower.includes('balanced')) {
      return 'bg-[#6C63FF]/10 text-[#A78BFA] border-[#6C63FF]/20';
    }
    if (lower.includes('tax') || lower.includes('elss')) {
      return 'bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20';
    }
    return 'bg-white/5 text-[#9B9BB4] border-white/10';
  };

  return (
    <Link
      href={`/research/fund/${fund.schemeCode}`}
      className="group block p-4 sm:p-5 rounded-2xl bg-[#1A1B2E] border border-white/5 transition-all duration-200 hover:border-white/20 hover:scale-[1.005] hover:shadow-xl relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#6C63FF] font-bold text-sm shadow-inner group-hover:border-[#6C63FF]/30 transition-colors">
            {fund.fundHouse ? fund.fundHouse.slice(0, 2).toUpperCase() : <Building2 className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate group-hover:text-[#00D2FF] transition-colors">
              {fund.schemeName}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="text-[#9B9BB4] truncate">{fund.fundHouse}</span>
              <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border', getCategoryColor(fund.category))}>
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
            'p-2 rounded-xl transition-all shrink-0',
            favorited
              ? 'bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/20'
              : 'text-[#9B9BB4] hover:text-white hover:bg-white/5',
          )}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Middle Metric Row: NAV & AUM */}
      <div className="grid grid-cols-2 gap-3 py-2.5 my-2 border-y border-white/5 text-xs">
        <div>
          <span className="text-[10px] text-[#9B9BB4] uppercase font-semibold block">Latest NAV</span>
          <span className="font-mono font-bold text-sm sm:text-base text-white">
            {fund.latestNAV ? formatINR(fund.latestNAV) : '—'}
          </span>
        </div>

        {fund.aum ? (
          <div>
            <span className="text-[10px] text-[#9B9BB4] uppercase font-semibold block">Total AUM</span>
            <span className="font-mono font-semibold text-sm text-white/90">
              ₹{(fund.aum / 100).toFixed(0)} Cr
            </span>
          </div>
        ) : (
          <div>
            <span className="text-[10px] text-[#9B9BB4] uppercase font-semibold block">Scheme Code</span>
            <span className="font-mono text-xs text-[#9B9BB4]">{fund.schemeCode}</span>
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
