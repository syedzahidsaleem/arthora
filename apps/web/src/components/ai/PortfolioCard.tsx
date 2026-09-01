'use client';

import React from 'react';
import Link from 'next/link';
import { Pin, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatINR, formatDate } from '@arthora/shared';
import type { IPortfolio } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface PortfolioCardProps {
  portfolio: IPortfolio;
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const { togglePin } = usePortfolioStore();

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void togglePin(portfolio._id);
  };

  const status = portfolio.aiSuggestion?.status || 'pending';
  const allocation = portfolio.aiSuggestion?.allocation || [];
  const projectedCorpus = portfolio.aiSuggestion?.projectedValue || 0;

  return (
    <Link
      href={`/ai/${portfolio._id}`}
      className={cn(
        'group block p-5 rounded-2xl bg-[#1A1B2E] border border-white/5 transition-all duration-200 hover:border-white/15 hover:shadow-xl hover:scale-[1.01] relative overflow-hidden',
        portfolio.isPinned && 'border-[#6C63FF]/30 bg-gradient-to-br from-[#1A1B2E] to-[#6C63FF]/5',
      )}
    >
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-white truncate group-hover:text-[#00D2FF] transition-colors">
              {portfolio.name}
            </h4>

            {portfolio.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#6C63FF]/20 text-[#00D2FF] text-[10px] font-bold">
                <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
              </span>
            )}
          </div>

          <p className="text-xs text-[#9B9BB4] truncate">{portfolio.goal}</p>
        </div>

        {/* Pin toggle button */}
        <button
          type="button"
          onClick={handlePin}
          aria-label={portfolio.isPinned ? 'Unpin portfolio' : 'Pin portfolio'}
          className={cn(
            'p-1.5 rounded-lg transition-colors shrink-0',
            portfolio.isPinned
              ? 'text-[#6C63FF] hover:bg-[#6C63FF]/10'
              : 'text-[#9B9BB4]/40 hover:text-white hover:bg-white/5',
          )}
        >
          <Pin className={cn('w-4 h-4', portfolio.isPinned && 'fill-current')} />
        </button>
      </div>

      {/* Metric Middle Row */}
      <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y border-white/5">
        <div>
          <span className="text-[10px] font-semibold text-[#9B9BB4] uppercase tracking-wider block">
            Target Corpus
          </span>
          <span className="font-mono text-base font-bold text-white">
            {projectedCorpus > 0 ? formatINR(projectedCorpus) : 'Calculating...'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-[#9B9BB4] uppercase tracking-wider block">
            Horizon & Risk
          </span>
          <span className="font-mono text-xs text-[#00D2FF] font-medium capitalize">
            {portfolio.timePeriod}Y • {portfolio.riskLevel}
          </span>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between text-xs pt-1">
        {/* Status Badge */}
        <div>
          {status === 'completed' && (
            <span className="inline-flex items-center gap-1 text-[#00D084] font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{allocation.length} Funds Portfolio</span>
            </span>
          )}

          {status === 'generating' && (
            <span className="inline-flex items-center gap-1.5 text-[#00D2FF] font-medium text-[11px] animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generating AI Model...</span>
            </span>
          )}

          {status === 'pending' && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>In Queue</span>
            </span>
          )}

          {status === 'failed' && (
            <span className="inline-flex items-center gap-1 text-[#FF4D6D] font-medium text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Generation Failed</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-[#9B9BB4]/60 font-mono">
          {formatDate(portfolio.createdAt)}
        </span>
      </div>
    </Link>
  );
}
