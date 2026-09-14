'use client';

import React from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number; // Positive = green, negative = red
  changeLabel?: string; // e.g. "vs last year"
  tooltip?: string;
  loading?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  tooltip,
  loading = false,
  size = 'md',
  className,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'bg-[#1A1B2E] border border-white/5 rounded-2xl animate-pulse flex flex-col justify-between',
          size === 'sm' ? 'p-3' : 'p-4',
          className,
        )}
      >
        <div className="h-3 w-20 bg-white/10 rounded mb-3" />
        <div className="h-7 w-28 bg-white/10 rounded mb-2" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        'bg-[#1A1A26] border-2 border-black rounded-xl flex flex-col justify-between transition-all duration-150 shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5',
        size === 'sm' ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-xs font-mono font-black text-[#A0A0B2] tracking-wider uppercase truncate">
          {label}
        </span>

        {tooltip && (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label={`Info about ${label}`}
                  className="text-[#A0A0B2] hover:text-white transition-colors cursor-help p-0.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"
                  align="center"
                  className="bg-neo-yellow border-2 border-black text-black font-mono font-black text-xs px-2.5 py-1.5 rounded-md shadow-neo z-50 max-w-xs animate-in fade-in-0 zoom-in-95 uppercase"
                  sideOffset={4}
                >
                  {tooltip}
                  <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>

      <div
        className={cn(
          'font-mono font-black text-white tracking-tight truncate my-0.5',
          size === 'sm' ? 'text-lg' : 'text-2xl',
        )}
      >
        {value}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center font-mono font-black text-xs px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]',
                isPositive && 'bg-neo-lime text-black',
                isNegative && 'bg-[#FF4D6D] text-white',
                !isPositive && !isNegative && 'bg-black text-[#A0A0B2]',
              )}
            >
              {isPositive && <ArrowUpRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />}
              {isNegative && <ArrowDownRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />}
              {change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </span>
          )}

          {changeLabel && (
            <span className="text-[#9B9BB4]/70 text-[11px] truncate">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
