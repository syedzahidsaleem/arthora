'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { GoalInputForm } from '@/components/ai/GoalInputForm';
import { PollingLoader } from '@/components/ai/PollingLoader';
import { PortfolioResult } from '@/components/ai/PortfolioResult';
import { PortfolioCard } from '@/components/ai/PortfolioCard';
import { MetricCard } from '@/components/common/MetricCard';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { CreatePortfolioInput } from '@arthora/shared';

export default function AIPage() {
  const {
    portfolios,
    currentPortfolio,
    isGenerating,
    createPortfolio,
    pollPortfolioStatus,
    fetchPortfolios,
    setCurrentPortfolio,
  } = usePortfolioStore();

  useEffect(() => {
    void fetchPortfolios();
  }, [fetchPortfolios]);

  const handleFormSubmit = async (data: CreatePortfolioInput) => {
    try {
      const portfolioId = await createPortfolio(data);
      pollPortfolioStatus(portfolioId);
      toast.info('Goal submitted. AI is analyzing Indian mutual funds...');
    } catch {
      toast.error('Failed to submit goal. Please check your inputs.');
    }
  };

  const handleReset = () => {
    setCurrentPortfolio(null);
  };

  return (
    <div className="space-y-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>AI Portfolio Builder</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/20 text-[#00D2FF] text-[11px] font-bold border border-[#6C63FF]/30">
              PRO
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9BB4] mt-1">
            Build custom, goal-based portfolios backed by 10,000 Monte Carlo simulations.
          </p>
        </div>
      </div>

      {/* Main 2-Column AI Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (col-span-5) */}
        <div className="lg:col-span-5">
          <GoalInputForm onSubmit={handleFormSubmit} isGenerating={isGenerating} />
        </div>

        {/* Right Column: Result / Polling / Empty State (col-span-7) */}
        <div className="lg:col-span-7">
          {isGenerating ? (
            <PollingLoader />
          ) : currentPortfolio?.aiSuggestion?.status === 'completed' ? (
            <PortfolioResult portfolio={currentPortfolio} onReset={handleReset} />
          ) : (
            /* Empty state preview */
            <div className="p-8 sm:p-12 rounded-3xl bg-[#1A1B2E]/60 border border-white/5 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-[#6C63FF] shadow-inner">
                <Sparkles className="w-8 h-8 opacity-70" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-white">Your portfolio will appear here</h3>
                <p className="text-xs text-[#9B9BB4] leading-relaxed">
                  Fill in your investment goal, time horizon, and monthly budget to generate a customized mutual fund portfolio.
                </p>
              </div>

              {/* Blurred Placeholder Demo Cards */}
              <div className="w-full grid grid-cols-3 gap-3 opacity-40 select-none pointer-events-none pt-4">
                <MetricCard label="Expected CAGR" value="~15.2%" size="sm" />
                <MetricCard label="Sharpe Ratio" value="1.48" size="sm" />
                <MetricCard label="Target Corpus" value="₹1.25 Cr" size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio History Section */}
      {portfolios.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#00D2FF]" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Your Saved Portfolios ({portfolios.length})
              </h2>
            </div>

            {portfolios.length > 4 && (
              <Link
                href="/portfolios"
                className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.slice(0, 4).map((port) => (
              <PortfolioCard key={port._id} portfolio={port} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
