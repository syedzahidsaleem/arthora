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
      className="group block p-4 sm:p-5 rounded-xl bg-[#1A1A24] border-2 border-black transition-all duration-150 hover:shadow-neo hover:-translate-y-0.5 shadow-neo-sm relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-neo-cyan border-2 border-black flex items-center justify-center shrink-0 text-black font-mono font-black text-xs shadow-neo-sm group-hover:bg-[#68E8FF] transition-colors">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-white group-hover:text-neo-yellow transition-colors uppercase">
                {stock.symbol}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-black text-neo-yellow text-[10px] font-mono font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                NSE
              </span>
            </div>
            <h4 className="font-medium text-xs text-[#A0A0B2] truncate mt-0.5">
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
            'p-1.5 rounded-md border-2 border-black transition-all shrink-0 active:translate-x-0.5 active:translate-y-0.5',
            favorited
              ? 'bg-neo-yellow text-black shadow-neo-sm'
              : 'bg-[#121218] text-[#A0A0B2] hover:text-white',
          )}
        >
          {favorited ? <BookmarkCheck className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>

      {/* Price & Change Row */}
      <div className="py-2.5 my-2 border-y-2 border-black flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-[#A0A0B2] font-mono font-bold uppercase block">Price</span>
          <span className="font-mono font-black text-base text-white">
            {stock.currentPrice ? formatINR(stock.currentPrice) : '—'}
          </span>
        </div>

        {stock.changePercent !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-[#A0A0B2] font-mono font-bold uppercase block">1D Change</span>
            <span
              className={cn(
                'font-mono font-black text-xs inline-flex items-center px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]',
                isPositive ? 'bg-neo-lime text-black' : 'bg-[#FF4D6D] text-white',
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
