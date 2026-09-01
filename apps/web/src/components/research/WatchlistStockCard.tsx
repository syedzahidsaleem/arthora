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
        'group relative p-4 rounded-2xl bg-[#1A1B2E] border transition-all duration-200 hover:border-white/20 hover:shadow-xl space-y-3',
        isSelected ? 'border-[#6C63FF] bg-gradient-to-br from-[#1A1B2E] to-[#6C63FF]/10' : 'border-white/5',
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
              className="rounded border-white/20 text-[#6C63FF] focus:ring-0 cursor-pointer w-4 h-4"
              aria-label="Select stock for comparison"
            />
          )}

          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00D2FF] text-xs font-mono font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/research/stock/${favorite.symbol}`}
                className="font-mono font-bold text-xs text-white hover:text-[#00D2FF] transition-colors"
              >
                {favorite.symbol}
              </Link>
              <span className="text-[10px] font-mono text-[#9B9BB4]">NSE</span>
            </div>
            <h4 className="text-[11px] text-[#9B9BB4] truncate">{favorite.name}</h4>
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

      {/* Price Middle Row */}
      <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5 text-xs">
        <div>
          <span className="text-[10px] text-[#9B9BB4] uppercase block">Price</span>
          <span className="font-mono font-bold text-sm text-white">
            {favorite.currentPrice ? formatINR(favorite.currentPrice) : '—'}
          </span>
        </div>

        {favorite.priceChangePercent !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-[#9B9BB4] uppercase block">1D Change</span>
            <span
              className={cn(
                'font-mono font-bold text-xs inline-flex items-center px-1.5 py-0.2 rounded',
                isPositive ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-[#FF4D6D]/10 text-[#FF4D6D]',
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
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D2FF] hover:underline"
        >
          <span>Deep Research</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
