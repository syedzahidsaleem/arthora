'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle, RotateCcw, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { ProjectedValueChart } from './ProjectedValueChart';
import { AllocationPieChart } from './AllocationPieChart';
import { AllocationCard } from './AllocationCard';
import { AIExplanationCard } from './AIExplanationCard';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { formatDate, formatINR } from '@arthora/shared';
import type { IPortfolio } from '@arthora/shared';

interface PortfolioResultProps {
  portfolio: IPortfolio;
  onReset?: () => void;
}

export function PortfolioResult({ portfolio, onReset }: PortfolioResultProps) {
  const suggestion = portfolio.aiSuggestion;
  if (!suggestion) return null;

  const allocation = suggestion.allocation || [];

  // Compute average expected return weighted by allocation percent
  const weightedReturn = allocation.reduce((acc, curr) => {
    return acc + (curr.expectedReturn * curr.allocationPercent) / 100;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Portfolio Result Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Optimized Asset Allocation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {portfolio.name}
            </h2>
            <p className="text-xs text-[#9B9BB4] leading-relaxed">
              Targeting: <span className="text-white/90 font-medium">{portfolio.goal}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9B9BB4] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Goal</span>
              </button>
            )}

            <Link
              href="/ai"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 transition-all shadow-md shadow-[#6C63FF]/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Build Another</span>
            </Link>
          </div>
        </div>

        {/* Highlight Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="p-3 rounded-xl bg-[#13141F]">
            <span className="text-[#9B9BB4] text-[11px] block">Projected Value</span>
            <span className="font-mono text-base font-bold text-white">
              {formatINR(suggestion.projectedValue)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F]">
            <span className="text-[#9B9BB4] text-[11px] block">Expected CAGR</span>
            <span className="font-mono text-base font-bold text-[#00D084]">
              ~{weightedReturn.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F]">
            <span className="text-[#9B9BB4] text-[11px] block">Time Horizon</span>
            <span className="font-mono text-base font-bold text-[#00D2FF]">
              {portfolio.timePeriod} Yrs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#13141F]">
            <span className="text-[#9B9BB4] text-[11px] block">Created Date</span>
            <span className="font-mono text-xs font-semibold text-white">
              {formatDate(portfolio.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Projected Growth & Asset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wealth Trajectory Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <TrendingUp className="w-4 h-4 text-[#6C63FF]" />
            <span className="uppercase tracking-wider">Monte Carlo Projected Wealth Trajectory</span>
          </div>
          <ProjectedValueChart
            timePeriodYears={portfolio.timePeriod}
            monthlyInvestment={portfolio.monthlyInvestment || 0}
            lumpSum={portfolio.lumpSum || 0}
            expectedCAGR={weightedReturn > 0 ? weightedReturn : 14.0}
          />
        </div>

        {/* Asset Distribution Pie */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <PieIcon className="w-4 h-4 text-[#00D2FF]" />
            <span className="uppercase tracking-wider">Portfolio Asset Breakdown</span>
          </div>
          <AllocationPieChart allocation={allocation} />
        </div>
      </div>

      {/* Allocation Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Curated Schemes & Allocation Weights ({allocation.length})
          </h3>
          <span className="text-xs text-[#9B9BB4]">Direct Growth Plans</span>
        </div>

        <div className="space-y-3">
          {allocation.map((item, idx) => (
            <AllocationCard key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>

      {/* AI Strategy & Thesis */}
      {suggestion.explanation && (
        <AIExplanationCard
          explanation={suggestion.explanation}
          rebalancing={suggestion.rebalancing}
          model={suggestion.model || suggestion.aiModel}
        />
      )}

      {/* Inline Regulatory Disclaimer */}
      <DisclaimerBanner inline />
    </div>
  );
}
