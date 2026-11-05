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
        'group block p-5 rounded-2xl bg-white border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all relative overflow-hidden text-[#222A2A]',
        portfolio.isPinned && 'bg-[#FFFDF7] border-black shadow-neo-lg',
      )}
    >
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-sm text-[#222A2A] uppercase tracking-wide truncate group-hover:text-black transition-colors">
              {portfolio.name}
            </h4>

            {portfolio.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neo-yellow text-black text-[10px] font-mono font-black border border-black shadow-[1px_1px_0px_0px_#000]">
                <Pin className="w-2.5 h-2.5 fill-black" /> PINNED
              </span>
            )}
          </div>

          <p className="text-xs font-mono font-bold text-[#525866] truncate">{portfolio.goal}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePin}
            aria-label={portfolio.isPinned ? 'Unpin portfolio' : 'Pin portfolio'}
            className={cn(
              'p-1.5 rounded-lg border-2 border-black transition-all shrink-0 shadow-neo-sm',
              portfolio.isPinned
                ? 'bg-neo-yellow text-black'
                : 'bg-[#FBF7EE] text-[#525866] hover:text-black hover:bg-neo-yellow',
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
            className="p-1.5 rounded-lg border-2 border-black bg-[#FBF7EE] text-[#525866] hover:text-white hover:bg-neo-rust transition-all shrink-0 shadow-neo-sm"
            title="Delete this portfolio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Middle Row */}
      <div className="grid grid-cols-2 gap-3 py-2.5 my-2 border-2 border-black bg-[#FBF7EE] px-3 rounded-xl">
        <div>
          <span className="text-[10px] font-black text-[#525866] uppercase tracking-wider block">
            Target Corpus
          </span>
          <span className="font-mono text-base font-black text-[#222A2A]">
            {projectedCorpus > 0 ? formatINR(projectedCorpus) : 'Calculating...'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-black text-[#525866] uppercase tracking-wider block">
            Horizon & Risk
          </span>
          <span className="font-mono text-xs text-black font-black capitalize bg-neo-lilac/60 px-1.5 py-0.5 rounded border border-black/20 inline-block mt-0.5">
            {portfolio.timePeriod}Y • {portfolio.riskLevel}
          </span>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between text-xs pt-1">
        {/* Status Badge */}
        <div>
          {status === 'completed' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neo-mint text-black border border-black font-mono font-black text-[10px] shadow-[1px_1px_0px_#000]">
              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              <span>{allocation.length} FUNDS</span>
            </span>
          )}

          {status === 'generating' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neo-aqua text-black border border-black font-mono font-black text-[10px] animate-pulse shadow-[1px_1px_0px_#000]">
              <Sparkles className="w-3 h-3" />
              <span>GENERATING...</span>
            </span>
          )}

          {status === 'pending' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neo-yellow text-black border border-black font-mono font-black text-[10px] shadow-[1px_1px_0px_#000]">
              <Clock className="w-3 h-3 stroke-[2.5]" />
              <span>QUEUED</span>
            </span>
          )}

          {status === 'failed' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neo-rust text-white border border-black font-mono font-black text-[10px] shadow-[1px_1px_0px_#000]">
              <AlertCircle className="w-3 h-3 stroke-[2.5]" />
              <span>FAILED</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-[#525866] font-mono font-bold">
          {formatDate(portfolio.createdAt)}
        </span>
      </div>
    </Link>
  );
}
export default PortfolioCard;
