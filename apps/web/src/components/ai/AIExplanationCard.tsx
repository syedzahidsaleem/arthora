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
      className="p-5 rounded-xl bg-[#161620] border-2 border-black shadow-neo space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-neo-yellow tracking-wider">
          <Sparkles className="w-4 h-4 fill-neo-yellow" />
          <span>AI Investment Strategy & Thesis</span>
        </div>

        <span className="text-[10px] font-mono font-black uppercase text-black px-2 py-0.5 rounded bg-neo-lavender border border-black">
          {model}
        </span>
      </div>

      <div className="text-xs font-mono text-[#A0A0B2] leading-relaxed">
        {open ? (
          <p className="whitespace-pre-line text-white">{explanation}</p>
        ) : (
          <p className="line-clamp-2 text-[#A0A0B2]">{explanation}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t-2 border-black/40 text-xs font-mono">
        <div className="text-[11px] text-[#A0A0B2]">
          Rebalancing:{' '}
          <strong className="text-neo-cyan uppercase font-black">{rebalancing}</strong>
        </div>

        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-black uppercase text-xs text-neo-yellow hover:underline transition-colors"
          >
            <span>{open ? 'Read Less' : 'Read Full Thesis'}</span>
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
}
