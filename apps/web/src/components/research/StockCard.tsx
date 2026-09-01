'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { formatINR } from '@arthora/shared';
import { useFavorites } from '@/hooks/useFavorites';
import type { IStockMetadata } from '@arthora/shared';
import { cn } from '@/lib/utils';

export interface StockCardData extends IStockMetadata {
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  peRatio?: number;
  marketCap?: number;
  week52High?: number;
  week52Low?: number;
}

interface StockCardProps {
  stock: StockCardData;
}

export function StockCard({ stock }: StockCardProps) {
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const favorited = isFavorited(undefined, stock.symbol);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorited) {
      const match = favorites.find(
        (f) => f.symbol?.toUpperCase() === stock.symbol.toUpperCase(),
      );
      if (match) {
        void removeFavorite(match._id);
      }
    } else {
      void addFavorite({
        assetType: 'stock',
        symbol: stock.symbol,
        isin: stock.isin,
        name: stock.companyName,
      });
    }
  };

  const isPositive = (stock.changePercent ?? 0) >= 0;

  return (
    <Link
      href={`/research/stock/${stock.symbol}`}
      className="group block p-4 sm:p-5 rounded-2xl bg-[#1A1B2E] border border-white/5 transition-all duration-200 hover:border-white/20 hover:scale-[1.005] hover:shadow-xl relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00D2FF] font-mono font-bold text-xs shadow-inner group-hover:border-[#00D2FF]/30 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-white group-hover:text-[#00D2FF] transition-colors">
                {stock.symbol}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white/5 text-[10px] font-mono text-[#9B9BB4]">
                NSE
              </span>
            </div>
            <h4 className="font-medium text-xs text-[#9B9BB4] truncate mt-0.5">
              {stock.companyName}
            </h4>
          </div>
        </div>

        {/* Watchlist Star */}
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

      {/* Price & Change Row */}
      <div className="py-2.5 my-2 border-y border-white/5 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#9B9BB4] uppercase font-semibold block">Price</span>
          <span className="font-mono font-bold text-base text-white">
            {stock.currentPrice ? formatINR(stock.currentPrice) : '—'}
          </span>
        </div>

        {stock.changePercent !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-[#9B9BB4] uppercase font-semibold block">1D Change</span>
            <span
              className={cn(
                'font-mono font-bold text-xs inline-flex items-center px-1.5 py-0.5 rounded',
                isPositive ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-[#FF4D6D]/10 text-[#FF4D6D]',
              )}
            >
              {isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
            </span>
          </div>
        )}
      </div>

      {/* Fundamentals & 52W Footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#9B9BB4]">
          {stock.peRatio !== undefined && (
            <span>
              P/E: <strong className="text-white">{stock.peRatio.toFixed(1)}</strong>
            </span>
          )}
          {stock.sector && (
            <span className="capitalize text-[11px] truncate max-w-[100px] text-[#9B9BB4]/80">
              {stock.sector}
            </span>
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
