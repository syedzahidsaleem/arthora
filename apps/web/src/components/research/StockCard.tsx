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
      className="group block p-4 sm:p-5 rounded-2xl bg-white border-2 border-black transition-all duration-150 hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-neo relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-neo-aqua border-2 border-black flex items-center justify-center shrink-0 text-black font-mono font-black text-xs shadow-[2px_2px_0px_#000] group-hover:bg-neo-mint transition-colors">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-[#222A2A] group-hover:text-black transition-colors uppercase">
                {stock.symbol}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-neo-yellow text-black text-[10px] font-mono font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                NSE
              </span>
            </div>
            <h4 className="font-medium text-xs text-[#525866] truncate mt-0.5">
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
            'p-1.5 rounded-lg border-2 border-black transition-all shrink-0 active:translate-x-0.5 active:translate-y-0.5 shadow-neo-sm',
            favorited
              ? 'bg-neo-mint text-black'
              : 'bg-[#FBF7EE] text-[#525866] hover:text-black hover:bg-neo-yellow',
          )}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>

      {/* Price & Change Row */}
      <div className="py-2.5 my-2 border-2 border-black bg-[#FBF7EE] px-3 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#525866] font-mono font-bold uppercase block">Price</span>
          <span className="font-mono font-black text-base text-[#222A2A]">
            {stock.currentPrice ? formatINR(stock.currentPrice) : '—'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#525866] font-mono font-bold uppercase block">Change</span>
          <span
            className={cn(
              'font-mono font-black text-xs px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]',
              isPositive
                ? 'bg-neo-mint text-black'
                : 'bg-neo-rust text-white',
            )}
          >
            {isPositive ? '+' : ''}
            {stock.changePercent ? `${stock.changePercent.toFixed(2)}%` : '0.00%'}
          </span>
        </div>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#525866]">
          {stock.sector && (
            <span className="truncate max-w-[120px] font-bold text-[#222A2A] bg-neo-lilac/50 px-2 py-0.5 rounded border border-black/20">
              {stock.sector}
            </span>
          )}
          {stock.peRatio && (
            <span>
              P/E: <strong className="text-[#222A2A]">{stock.peRatio.toFixed(1)}</strong>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-black text-[#222A2A] group-hover:translate-x-1 transition-transform">
          <span>Overview</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      </div>
    </Link>
  );
}
export default StockCard;
