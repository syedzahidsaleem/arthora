'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Shield, Clock, IndianRupee } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioResult } from '@/components/ai/PortfolioResult';
import { PollingLoader } from '@/components/ai/PollingLoader';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { formatINR } from '@arthora/shared';

interface PortfolioDetailViewProps {
  portfolioId: string;
}

export function PortfolioDetailView({ portfolioId }: PortfolioDetailViewProps) {
  const { portfolio, isLoading, isGenerating, error } = usePortfolio(portfolioId);

  if (isLoading && !portfolio) {
    return <PageSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Portfolio not found</h3>
        <p className="text-xs text-[#9B9BB4] max-w-sm mx-auto">
          The requested portfolio may have been removed or does not exist.
        </p>
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AI Builder</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9B9BB4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Builder</span>
        </Link>
      </div>

      {/* Goal Summary Pills */}
      <div className="p-4 rounded-xl bg-[#161620] border-2 border-black shadow-neo grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-neo-yellow border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[#A0A0B2] text-[10px] font-black uppercase tracking-wider block">Target Goal</span>
            <span className="font-black text-white truncate block uppercase">{portfolio.goal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-neo-cyan border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#A0A0B2] text-[10px] font-black uppercase tracking-wider block">Risk Profile</span>
            <span className="font-mono font-black text-white uppercase">{portfolio.riskLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-neo-green border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#A0A0B2] text-[10px] font-black uppercase tracking-wider block">Time Period</span>
            <span className="font-mono font-black text-white">{portfolio.timePeriod} Years</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-neo-lavender border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#A0A0B2] text-[10px] font-black uppercase tracking-wider block">Monthly SIP</span>
            <span className="font-mono font-black text-white">
              {formatINR(portfolio.monthlyInvestment || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Generating Polling or Result */}
      {isGenerating || portfolio.aiSuggestion?.status === 'generating' ? (
        <PollingLoader />
      ) : (
        <PortfolioResult portfolio={portfolio} />
      )}
    </div>
  );
}
