'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle, RotateCcw, PieChart as PieIcon, TrendingUp, Printer } from 'lucide-react';
import { ProjectedValueChart } from './ProjectedValueChart';
import { AllocationPieChart } from './AllocationPieChart';
import { AllocationCard } from './AllocationCard';
import { AIExplanationCard } from './AIExplanationCard';
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
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* Portfolio Result Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo-lg space-y-4 text-[#222A2A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-neo-yellow text-black text-xs font-mono font-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>AI ASSET ALLOCATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#222A2A] uppercase tracking-tight">
              {portfolio.name}
            </h2>
            <p className="text-xs font-mono font-bold text-[#525866] leading-relaxed">
              Targeting: <span className="text-[#222A2A] font-black">{portfolio.goal}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase text-black bg-white hover:bg-neo-yellow border-2 border-black transition-all shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Goal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase text-black bg-neo-aqua hover:bg-neo-mint border-2 border-black transition-all shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
              title="Print or save client portfolio report as PDF"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <Link
              href="/ai"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase text-black bg-neo-mint border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Build Another</span>
            </Link>
          </div>
        </div>

        {/* Highlight Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t-2 border-black text-xs">
          <div className="p-3 rounded-xl bg-[#FBF7EE] border-2 border-black shadow-neo-sm">
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Projected Value</span>
            <span className="font-mono text-base font-black text-[#222A2A]">
              {formatINR(suggestion.projectedValue)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF7EE] border-2 border-black shadow-neo-sm">
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Expected CAGR</span>
            <span className="font-mono text-base font-black text-[#059669]">
              ~{weightedReturn.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF7EE] border-2 border-black shadow-neo-sm">
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Time Horizon</span>
            <span className="font-mono text-base font-black text-[#222A2A]">
              {portfolio.timePeriod} Yrs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF7EE] border-2 border-black shadow-neo-sm">
            <span className="text-[#525866] text-[10px] font-mono font-bold uppercase tracking-wider block">Created Date</span>
            <span className="font-mono text-xs font-black text-[#222A2A]">
              {formatDate(portfolio.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Projected Growth & Asset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wealth Trajectory Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#222A2A] tracking-wider">
            <TrendingUp className="w-4 h-4 text-[#EC4624] stroke-[2.5]" />
            <span>Monte Carlo Projected Wealth Trajectory</span>
          </div>
          <ProjectedValueChart
            timePeriodYears={portfolio.timePeriod}
            monthlyInvestment={portfolio.monthlyInvestment || 0}
            lumpSum={portfolio.lumpSum || 0}
            expectedCAGR={weightedReturn > 0 ? weightedReturn : 14.0}
          />
        </div>

        {/* Asset Distribution Pie */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#222A2A] tracking-wider">
            <PieIcon className="w-4 h-4 text-[#F39120] stroke-[2.5]" />
            <span>Portfolio Asset Breakdown</span>
          </div>
          <AllocationPieChart allocation={allocation} />
        </div>
      </div>

      {/* Allocation Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-[#222A2A] uppercase tracking-wider">
            Curated Schemes & Allocation Weights ({allocation.length})
          </h3>
          <span className="text-xs font-mono font-bold text-[#525866]">Direct Growth Plans</span>
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
    </div>
  );
}
export default PortfolioResult;
