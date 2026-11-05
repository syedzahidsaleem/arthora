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
        'group relative p-4 rounded-xl bg-white border-2 border-black shadow-neo transition-all duration-200 space-y-3',
        isSelected ? 'bg-neo-mint/30 shadow-neo-lg' : '',
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
              className="rounded border-2 border-black text-black focus:ring-0 cursor-pointer w-4 h-4"
              aria-label="Select fund for comparison"
            />
          )}

          <div className="w-8 h-8 rounded-lg bg-neo-lilac border-2 border-black flex items-center justify-center shrink-0 text-black text-xs font-bold">
            <Building2 className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/research/fund/${favorite.schemeCode}`}
              className="font-bold text-xs text-black hover:underline truncate block transition-colors"
            >
              {favorite.name}
            </Link>
            {favorite.category && (
              <span className="text-[10px] text-black/70 capitalize font-mono">
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
          className="p-1 rounded-lg text-black/60 hover:text-neo-rust hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Middle Row */}
      <div className="grid grid-cols-2 gap-2 py-2 border-y-2 border-black text-xs">
        <div>
          <span className="text-[10px] text-black/70 uppercase font-mono block">Latest NAV</span>
          <span className="font-mono font-black text-sm text-black">
            {favorite.latestNAV ? formatINR(favorite.latestNAV) : '—'}
          </span>
        </div>

        {favorite.cagr1Y !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-black/70 uppercase font-mono block">1Y CAGR</span>
            <span
              className={cn(
                'font-mono font-bold text-xs inline-flex items-center px-1.5 py-0.5 rounded border border-black',
                favorite.cagr1Y >= 0 ? 'bg-neo-mint text-black' : 'bg-neo-rust text-white',
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
          className="inline-flex items-center gap-1 text-[11px] font-black text-black uppercase hover:underline"
        >
          <span>Deep Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
