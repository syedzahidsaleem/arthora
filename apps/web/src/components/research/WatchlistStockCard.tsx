'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, TrendingUp } from 'lucide-react';
import { formatINR } from '@arthora/shared';
import type { IFavoriteWithMarketData } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface WatchlistStockCardProps {
  favorite: IFavoriteWithMarketData;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRemove: (id: string) => void;
}

export function WatchlistStockCard({
  favorite,
  isSelected = false,
  onToggleSelect,
  onRemove,
}: WatchlistStockCardProps) {
  const isPositive = (favorite.priceChangePercent ?? 0) >= 0;

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl bg-white border-2 border-black shadow-neo transition-all duration-200 space-y-3',
        isSelected ? 'bg-neo-mint/30 shadow-neo-lg' : '',
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-2 border-black text-black focus:ring-0 cursor-pointer w-4 h-4"
              aria-label="Select stock for comparison"
            />
          )}

          <div className="w-8 h-8 rounded-lg bg-neo-aqua border-2 border-black flex items-center justify-center shrink-0 text-black text-xs font-mono font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/research/stock/${favorite.symbol}`}
                className="font-mono font-black text-xs text-black hover:underline transition-colors"
              >
                {favorite.symbol}
              </Link>
              <span className="text-[10px] font-mono text-black/70 font-bold">NSE</span>
            </div>
            <h4 className="text-[11px] text-black/70 truncate font-mono">{favorite.name}</h4>
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

      {/* Price Middle Row */}
      <div className="grid grid-cols-2 gap-2 py-2 border-y-2 border-black text-xs">
        <div>
          <span className="text-[10px] text-black/70 uppercase font-mono block">Price</span>
          <span className="font-mono font-black text-sm text-black">
            {favorite.currentPrice ? formatINR(favorite.currentPrice) : '—'}
          </span>
        </div>

        {favorite.priceChangePercent !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-black/70 uppercase font-mono block">1D Change</span>
            <span
              className={cn(
                'font-mono font-bold text-xs inline-flex items-center px-1.5 py-0.5 rounded border border-black',
                isPositive ? 'bg-neo-mint text-black' : 'bg-neo-rust text-white',
              )}
            >
              {isPositive ? `+${favorite.priceChangePercent.toFixed(2)}%` : `${favorite.priceChangePercent.toFixed(2)}%`}
            </span>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="flex justify-end">
        <Link
          href={`/research/stock/${favorite.symbol}`}
          className="inline-flex items-center gap-1 text-[11px] font-black text-black uppercase hover:underline"
        >
          <span>Deep Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
