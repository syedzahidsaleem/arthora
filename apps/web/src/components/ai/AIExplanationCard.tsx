'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

interface AIExplanationCardProps {
  explanation: string;
  rebalancing?: string;
  model?: string;
}

export function AIExplanationCard({
  explanation,
  rebalancing = 'quarterly',
  model = 'Gemini 1.5 Flash',
}: AIExplanationCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="p-5 rounded-2xl bg-[#1A1B2E] border border-white/10 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00D2FF]">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-wider">AI Investment Strategy & Thesis</span>
        </div>

        <span className="text-[10px] font-mono text-[#9B9BB4] px-2 py-0.5 rounded bg-white/5 border border-white/5">
          {model}
        </span>
      </div>

      <div className="text-xs text-[#9B9BB4] leading-relaxed">
        {open ? (
          <p className="whitespace-pre-line text-[#F8F9FA]/90">{explanation}</p>
        ) : (
          <p className="line-clamp-2 text-[#9B9BB4]">{explanation}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
        <div className="text-[11px] text-[#9B9BB4]">
          Recommended Rebalancing:{' '}
          <strong className="text-white capitalize">{rebalancing}</strong>
        </div>

        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold text-xs text-[#6C63FF] hover:text-[#00D2FF] transition-colors"
          >
            <span>{open ? 'Read Less' : 'Read Full Thesis'}</span>
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
}
