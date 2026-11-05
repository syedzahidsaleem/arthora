'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { formatINR } from '@arthora/shared';
import type { StockDetailData } from '@/hooks/useStock';
import type { IStockMetrics } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface StockHeaderProps {
  stock: StockDetailData;
  metrics: IStockMetrics | null;
}

export function StockHeader({ stock, metrics }: StockHeaderProps) {
  const router = useRouter();
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const favorited = isFavorited(undefined, stock.symbol);

  const handleFavoriteClick = () => {
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

  const isMarketOpen = () => {
    const now = new Date();
    // Indian Standard Time IST is UTC+5:30
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const istMinutes = utcHours * 60 + utcMinutes + 330;
    const day = now.getUTCDay();

    // Monday (1) to Friday (5), 9:15 AM (555 min) to 3:30 PM (930 min)
    return day >= 1 && day <= 5 && istMinutes >= 555 && istMinutes <= 930;
  };

  const marketLive = isMarketOpen();
  const isPositive = (stock.changePercent ?? 0) >= 0;

  // 52W range progress
  const low52 = metrics?.week52Low || 0;
  const high52 = metrics?.week52High || 1;
  const current = stock.currentPrice || 0;
  const progress52 =
    high52 > low52 ? Math.min(100, Math.max(0, ((current - low52) / (high52 - low52)) * 100)) : 50;

  return (
    <div className="sticky top-0 z-20 bg-[#FBF7EE]/95 backdrop-blur-md border-b-2 border-black py-4 space-y-4 select-none">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-mono font-bold text-[#525866] truncate">
          <Link href="/research" className="hover:text-black hover:underline transition-colors">
            Research
          </Link>
          <span>/</span>
          <Link href="/research" className="hover:text-black hover:underline transition-colors">
            NSE Stocks
          </Link>
          <span>/</span>
          <span className="text-[#222A2A] font-black truncate">{stock.symbol}</span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all',
              favorited
                ? 'bg-neo-mint text-black'
                : 'bg-white text-black hover:bg-neo-yellow',
            )}
          >
            {favorited ? <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" /> : <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span className="hidden sm:inline">{favorited ? 'WATCHLIST' : 'ADD WATCHLIST'}</span>
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-xl bg-white border-2 border-black text-black hover:bg-neo-yellow shadow-neo-sm hover:shadow-neo transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Title & Price */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#222A2A] uppercase tracking-tight">
              {stock.companyName}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-neo-aqua text-black font-mono font-black text-xs border border-black uppercase shadow-[1px_1px_0px_0px_#000]">
              {stock.symbol}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {stock.sector && (
              <span className="text-[#525866] font-mono font-bold capitalize">
                {stock.sector}
              </span>
            )}
            {stock.marketCapType && (
              <span className="px-2 py-0.5 rounded-md bg-neo-yellow text-black font-mono font-black text-[10px] border border-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {stock.marketCapType} Cap
              </span>
            )}
            {stock.isin && (
              <span className="font-mono text-[10px] font-bold text-[#525866] px-2 py-0.5 rounded-md bg-white border border-black">
                ISIN: {stock.isin}
              </span>
            )}
          </div>
        </div>

        {/* Live Price Quote */}
        <div className="text-left md:text-right shrink-0">
          <div className="flex items-center md:justify-end gap-2 text-[11px] text-[#525866] font-mono font-bold uppercase tracking-wider">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                marketLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
              )}
            />
            <span>{marketLive ? 'NSE Live Price' : 'NSE Close Price'}</span>
          </div>

          <div className="flex items-baseline md:justify-end gap-2.5 mt-0.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#222A2A]">
              {stock.currentPrice ? formatINR(stock.currentPrice) : '—'}
            </span>

            {stock.changePercent !== undefined && (
              <span
                className={cn(
                  'font-mono text-xs font-black inline-flex items-center px-1.5 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]',
                  isPositive ? 'bg-neo-mint text-black' : 'bg-neo-rust text-white',
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                )}
                {isPositive ? `+${stock.change?.toFixed(2)}` : stock.change?.toFixed(2)} ({isPositive ? '+' : ''}
                {stock.changePercent?.toFixed(2)}%)
              </span>
            )}
          </div>

          {/* 52W Range Progress */}
          {low52 > 0 && high52 > 0 && (
            <div className="mt-2 w-48 ml-auto space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#525866]">
                <span>52W L: {formatINR(low52)}</span>
                <span>52W H: {formatINR(high52)}</span>
              </div>
              <div className="h-2 w-full bg-[#E2DAC2] rounded-full overflow-hidden border border-black shadow-[inset_1px_1px_0px_#000]">
                <div
                  style={{ width: `${progress52}%` }}
                  className="h-full bg-neo-mint border-r border-black"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StockHeader;
