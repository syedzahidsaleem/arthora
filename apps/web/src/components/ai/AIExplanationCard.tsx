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
      className="p-5 rounded-2xl bg-white border-2 border-black shadow-neo space-y-3 text-[#222A2A]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-black tracking-wider">
          <Sparkles className="w-4 h-4 fill-black" />
          <span>AI Investment Strategy & Thesis</span>
        </div>

        <span className="text-[10px] font-mono font-black uppercase text-black px-2.5 py-0.5 rounded-lg bg-neo-lilac border border-black shadow-[1px_1px_0px_#000]">
          {model}
        </span>
      </div>

      <div className="text-xs font-mono font-medium text-[#222A2A] leading-relaxed">
        {open ? (
          <p className="whitespace-pre-line text-black">{explanation}</p>
        ) : (
          <p className="line-clamp-2 text-[#525866]">{explanation}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t-2 border-black text-xs font-mono">
        <div className="text-[11px] text-[#525866] font-bold">
          Rebalancing:{' '}
          <strong className="text-black uppercase font-black bg-neo-yellow px-1.5 py-0.5 rounded border border-black">{rebalancing}</strong>
        </div>

        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-black uppercase text-xs text-black hover:text-neo-rust transition-colors"
          >
            <span>{open ? 'Read Less' : 'Read Full Thesis'}</span>
            {open ? <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
}
export default AIExplanationCard;
