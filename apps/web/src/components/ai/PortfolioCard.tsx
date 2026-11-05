'use client';

import React from 'react';
import Link from 'next/link';
import { Pin, Sparkles, Clock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatINR, formatDate } from '@arthora/shared';
import type { IPortfolio } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface PortfolioCardProps {
  portfolio: IPortfolio;
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const { togglePin, deletePortfolio } = usePortfolioStore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void togglePin(portfolio._id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePortfolio(portfolio._id);
      toast.success('Portfolio removed from saved list');
    } catch {
      toast.error('Failed to remove portfolio');
      setIsDeleting(false);
    }
  };

  const status = portfolio.aiSuggestion?.status || 'pending';
  const allocation = portfolio.aiSuggestion?.allocation || [];
  const projectedCorpus = portfolio.aiSuggestion?.projectedValue || 0;

  return (
    <Link
      href={`/ai/${portfolio._id}`}
      className={cn(
        'group block p-5 rounded-xl bg-[#161620] border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all relative overflow-hidden',
        portfolio.isPinned && 'bg-[#1C1C2A] border-neo-yellow',
      )}
    >
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-sm text-white uppercase tracking-wide truncate group-hover:text-neo-yellow transition-colors">
              {portfolio.name}
            </h4>

            {portfolio.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neo-yellow text-black text-[10px] font-mono font-black border border-black shadow-[1px_1px_0px_0px_#000]">
                <Pin className="w-2.5 h-2.5 fill-black" /> PINNED
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-[#A0A0B2] truncate">{portfolio.goal}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePin}
            aria-label={portfolio.isPinned ? 'Unpin portfolio' : 'Pin portfolio'}
            className={cn(
              'p-1.5 rounded-md border-2 border-black transition-all shrink-0',
              portfolio.isPinned
                ? 'bg-neo-yellow text-black shadow-[1px_1px_0px_0px_#000]'
                : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white hover:bg-white/10',
            )}
            title={portfolio.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className={cn('w-3.5 h-3.5', portfolio.isPinned && 'fill-black')} />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Remove portfolio"
            className="p-1.5 rounded-md border-2 border-black bg-[#0E0E14] text-[#A0A0B2] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/15 hover:border-[#FF4D6D] transition-all shrink-0"
            title="Delete this portfolio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Middle Row */}
      <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y-2 border-black/40">
        <div>
          <span className="text-[10px] font-black text-[#A0A0B2] uppercase tracking-wider block">
            Target Corpus
          </span>
          <span className="font-mono text-base font-black text-white">
            {projectedCorpus > 0 ? formatINR(projectedCorpus) : 'Calculating...'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-black text-[#A0A0B2] uppercase tracking-wider block">
            Horizon & Risk
          </span>
          <span className="font-mono text-xs text-neo-cyan font-bold capitalize">
            {portfolio.timePeriod}Y • {portfolio.riskLevel}
          </span>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between text-xs pt-1">
        {/* Status Badge */}
        <div>
          {status === 'completed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neo-green text-black border border-black font-mono font-black text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>{allocation.length} FUNDS</span>
            </span>
          )}

          {status === 'generating' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neo-cyan text-black border border-black font-mono font-black text-[10px] animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>GENERATING...</span>
            </span>
          )}

          {status === 'pending' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neo-yellow text-black border border-black font-mono font-black text-[10px]">
              <Clock className="w-3 h-3" />
              <span>QUEUED</span>
            </span>
          )}

          {status === 'failed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neo-coral text-black border border-black font-mono font-black text-[10px]">
              <AlertCircle className="w-3 h-3" />
              <span>FAILED</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-[#A0A0B2] font-mono">
          {formatDate(portfolio.createdAt)}
        </span>
      </div>
    </Link>
  );
}
