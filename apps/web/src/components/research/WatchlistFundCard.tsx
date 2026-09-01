'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, Building2 } from 'lucide-react';
import { formatINR } from '@arthora/shared';
import type { IFavoriteWithMarketData } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface WatchlistFundCardProps {
  favorite: IFavoriteWithMarketData;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRemove: (id: string) => void;
}

export function WatchlistFundCard({
  favorite,
  isSelected = false,
  onToggleSelect,
  onRemove,
}: WatchlistFundCardProps) {

  return (
    <div
      className={cn(
        'group relative p-4 rounded-2xl bg-[#1A1B2E] border transition-all duration-200 hover:border-white/20 hover:shadow-xl space-y-3',
        isSelected ? 'border-[#6C63FF] bg-gradient-to-br from-[#1A1B2E] to-[#6C63FF]/10' : 'border-white/5',
      )}
    >
      {/* Top Header with Checkbox & Remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-white/20 text-[#6C63FF] focus:ring-0 cursor-pointer w-4 h-4"
              aria-label="Select fund for comparison"
            />
          )}

          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#6C63FF] text-xs font-bold">
            <Building2 className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/research/fund/${favorite.schemeCode}`}
              className="font-bold text-xs text-white hover:text-[#00D2FF] truncate block transition-colors"
            >
              {favorite.name}
            </Link>
            {favorite.category && (
              <span className="text-[10px] text-[#9B9BB4] capitalize">
                {favorite.category.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(favorite._id)}
          aria-label="Remove from watchlist"
          className="p-1 rounded-lg text-[#9B9BB4] hover:text-[#FF4D6D] hover:bg-white/5 transition-colors opacity-80 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Middle Row */}
      <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5 text-xs">
        <div>
          <span className="text-[10px] text-[#9B9BB4] uppercase block">Latest NAV</span>
          <span className="font-mono font-bold text-sm text-white">
            {favorite.latestNAV ? formatINR(favorite.latestNAV) : '—'}
          </span>
        </div>

        {favorite.cagr1Y !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-[#9B9BB4] uppercase block">1Y CAGR</span>
            <span
              className={cn(
                'font-mono font-bold text-xs inline-flex items-center px-1.5 py-0.2 rounded',
                favorite.cagr1Y >= 0 ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-[#FF4D6D]/10 text-[#FF4D6D]',
              )}
            >
              {favorite.cagr1Y >= 0 ? `+${favorite.cagr1Y.toFixed(1)}%` : `${favorite.cagr1Y.toFixed(1)}%`}
            </span>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="flex justify-end">
        <Link
          href={`/research/fund/${favorite.schemeCode}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D2FF] hover:underline"
        >
          <span>Deep Research</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
