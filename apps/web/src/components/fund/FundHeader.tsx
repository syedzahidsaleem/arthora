'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  FileDown,
  TrendingUp,
  TrendingDown,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import { formatINR, formatDate } from '@arthora/shared';
import { getApiBaseUrl } from '@/lib/api/config';
import type { FundDetailData } from '@/hooks/useFund';
import { cn } from '@/lib/utils';

interface FundHeaderProps {
  fund: FundDetailData;
}

export function FundHeader({ fund }: FundHeaderProps) {
  const router = useRouter();
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const favorited = isFavorited(fund.schemeCode);

  const handleFavoriteClick = () => {
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

  const handleDownloadReport = () => {
    toast.info('Generating institutional PDF report for ' + fund.schemeName);
    const baseUrl = getApiBaseUrl();
    window.open(`${baseUrl}/api/v1/reports/fund-analysis?schemeCode=${fund.schemeCode}`, '_blank');
  };

  const navChange =
    fund.latestNAV && fund.previousNAV ? fund.latestNAV - fund.previousNAV : 0;
  const navChangePercent =
    fund.previousNAV && navChange ? (navChange / fund.previousNAV) * 100 : 0;
  const isPositive = navChange >= 0;

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
            Mutual Funds
          </Link>
          <span>/</span>
          <span className="text-[#222A2A] font-black truncate">{fund.schemeName}</span>
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
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-neo-aqua text-black border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <FileDown className="w-3.5 h-3.5 stroke-[2.5] text-black" />
            <span className="hidden sm:inline">PDF Report</span>
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

      {/* Main Title & Live NAV Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#222A2A] uppercase tracking-tight">
            {fund.schemeName}
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <span className="text-[#525866] font-mono font-bold">{fund.fundHouse}</span>
            <span className="px-2 py-0.5 rounded-md bg-neo-yellow text-black font-mono font-black text-[10px] border border-black uppercase shadow-[1px_1px_0px_0px_#000]">
              {fund.category?.replace(/_/g, ' ')}
            </span>
            {fund.riskLevel && (
              <span className="px-2 py-0.5 rounded-md bg-neo-rust text-white text-[10px] font-mono font-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                <Shield className="w-3 h-3 stroke-[2.5]" />
                {fund.riskLevel} Risk
              </span>
            )}
            {fund.isin && (
              <span className="font-mono font-bold text-[10px] text-[#525866] px-2 py-0.5 rounded-md bg-white border border-black">
                ISIN: {fund.isin}
              </span>
            )}
          </div>
        </div>

        {/* Live NAV */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-[11px] text-[#525866] font-mono font-bold uppercase tracking-wider">
            Net Asset Value (NAV)
          </div>
          <div className="flex items-baseline md:justify-end gap-2.5 mt-0.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#222A2A]">
              {fund.latestNAV ? formatINR(fund.latestNAV) : '—'}
            </span>

            {fund.previousNAV && navChange !== 0 && (
              <span
                className={cn(
                  'font-mono text-xs font-black inline-flex items-center px-1.5 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]',
                  isPositive
                    ? 'bg-neo-mint text-black'
                    : 'bg-neo-rust text-white',
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                )}
                {isPositive ? `+${navChange.toFixed(2)}` : navChange.toFixed(2)} ({navChangePercent.toFixed(2)}%)
              </span>
            )}
          </div>
          {fund.latestNAVDate && (
            <div className="text-[10px] font-mono font-bold text-[#717684] mt-0.5">
              as of {formatDate(fund.latestNAVDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default FundHeader;
