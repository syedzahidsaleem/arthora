'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ArrowLeft, Target, Shield, Clock, IndianRupee } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioResult } from '@/components/ai/PortfolioResult';
import { PollingLoader } from '@/components/ai/PollingLoader';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { formatINR } from '@arthora/shared';

interface PortfolioDetailViewProps {
  portfolioId: string;
}

export function PortfolioDetailView({ portfolioId: initialPortfolioId }: PortfolioDetailViewProps) {
  const nextParams = useParams();
  const pathname = usePathname();
  const rawId = (nextParams?.portfolioId as string) || initialPortfolioId || '';
  const portfolioId = (rawId && rawId !== '_') ? rawId : (pathname?.match(/\/ai\/([^/?#]+)/)?.[1] || initialPortfolioId);
  const { portfolio, isLoading, isGenerating, error } = usePortfolio(portfolioId);

  if (isLoading && !portfolio) {
    return <PageSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-black text-[#222A2A] uppercase">Portfolio not found</h3>
        <p className="text-xs text-[#525866] font-mono font-bold max-w-sm mx-auto">
          The requested portfolio may have been removed or does not exist.
        </p>
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-black bg-neo-yellow border-2 border-black shadow-neo-sm hover:shadow-neo transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to AI Builder</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black bg-white text-xs font-black text-black hover:bg-neo-yellow shadow-neo-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to AI Builder</span>
        </Link>
      </div>

      {/* Goal Summary Pills */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-neo grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#222A2A]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neo-yellow border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="truncate">
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Target Goal</span>
            <span className="font-black text-[#222A2A] truncate block uppercase">{portfolio.goal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neo-aqua border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Shield className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Risk Profile</span>
            <span className="font-mono font-black text-[#222A2A] uppercase">{portfolio.riskLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neo-mint border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Time Period</span>
            <span className="font-mono font-black text-[#222A2A]">{portfolio.timePeriod} Years</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neo-lilac border-2 border-black text-black shadow-[1px_1px_0px_0px_#000] shrink-0">
            <IndianRupee className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Monthly SIP</span>
            <span className="font-mono font-black text-[#222A2A]">
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
export default PortfolioDetailView;
