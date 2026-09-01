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
    window.open(`/api/v1/reports/fund-analysis?schemeCode=${fund.schemeCode}`, '_blank');
  };

  const navChange =
    fund.latestNAV && fund.previousNAV ? fund.latestNAV - fund.previousNAV : 0;
  const navChangePercent =
    fund.previousNAV && navChange ? (navChange / fund.previousNAV) * 100 : 0;
  const isPositive = navChange >= 0;

  return (
    <div className="sticky top-0 z-20 bg-[#0D0E1A]/95 backdrop-blur-xl border-b border-white/5 py-4 space-y-4">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-[#9B9BB4] truncate">
          <Link href="/research" className="hover:text-white transition-colors">
            Research
          </Link>
          <span>/</span>
          <Link href="/research" className="hover:text-white transition-colors">
            Mutual Funds
          </Link>
          <span>/</span>
          <span className="text-white font-medium truncate">{fund.schemeName}</span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              favorited
                ? 'bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20'
                : 'bg-white/5 text-[#9B9BB4] hover:text-white border-white/10 hover:bg-white/10',
            )}
          >
            {favorited ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{favorited ? 'Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-[#9B9BB4] hover:text-white border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-xl text-[#9B9BB4] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title & Live NAV Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {fund.schemeName}
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <span className="text-[#9B9BB4] font-medium">{fund.fundHouse}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#6C63FF]/15 text-[#00D2FF] font-semibold text-[11px] border border-[#6C63FF]/30">
              {fund.category?.replace(/_/g, ' ')}
            </span>
            {fund.riskLevel && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {fund.riskLevel} Risk
              </span>
            )}
            {fund.isin && (
              <span className="font-mono text-[10px] text-[#9B9BB4]/80 px-1.5 py-0.5 rounded bg-white/5">
                ISIN: {fund.isin}
              </span>
            )}
          </div>
        </div>

        {/* Live NAV */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-[11px] text-[#9B9BB4] font-semibold uppercase tracking-wider">
            Net Asset Value (NAV)
          </div>
          <div className="flex items-baseline md:justify-end gap-2.5 mt-0.5">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
              {fund.latestNAV ? formatINR(fund.latestNAV) : '—'}
            </span>

            {fund.previousNAV && navChange !== 0 && (
              <span
                className={cn(
                  'font-mono text-xs font-bold inline-flex items-center px-1.5 py-0.5 rounded',
                  isPositive
                    ? 'bg-[#00D084]/10 text-[#00D084]'
                    : 'bg-[#FF4D6D]/10 text-[#FF4D6D]',
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                )}
                {isPositive ? `+${navChange.toFixed(2)}` : navChange.toFixed(2)} ({navChangePercent.toFixed(2)}%)
              </span>
            )}
          </div>
          {fund.latestNAVDate && (
            <div className="text-[10px] text-[#9B9BB4]/70 mt-0.5">
              as of {formatDate(fund.latestNAVDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
