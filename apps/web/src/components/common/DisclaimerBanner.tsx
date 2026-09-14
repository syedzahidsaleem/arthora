'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  inline?: boolean;
  className?: string;
}

export function DisclaimerBanner({ inline = false, className }: DisclaimerBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (inline) {
      setIsDismissed(false);
      return;
    }
    const dismissed = localStorage.getItem('arthora-disclaimer-dismissed');
    setIsDismissed(dismissed === 'true');
  }, [inline]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (!inline) {
      localStorage.setItem('arthora-disclaimer-dismissed', 'true');
    }
  };

  if (isDismissed) return null;

  if (inline) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl bg-neo-yellow text-black border-2 border-black shadow-neo font-mono text-xs leading-relaxed',
          className,
        )}
      >
        <AlertCircle className="w-5 h-5 text-black shrink-0 mt-0.5 fill-black text-neo-yellow" />
        <div>
          <span className="font-black uppercase">Regulatory Note: </span>
          Arthora is not a SEBI registered investment advisor. All information, simulations, and suggested allocations are generated for educational and research purposes only. Past performance does not guarantee future results.
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="SEBI regulatory disclaimer"
      className={cn(
        'fixed bottom-16 md:bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 p-3.5 rounded-xl bg-neo-yellow text-black border-2 border-black shadow-neo-lg flex items-center justify-between gap-4 font-mono font-bold text-xs animate-in slide-in-from-bottom-4 duration-300',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-black shrink-0 fill-black text-neo-yellow" />
        <p className="leading-snug">
          <strong className="font-black uppercase">Regulatory Note:</strong> Arthora is not a SEBI registered advisor. All data is for educational research only.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss disclaimer banner"
        className="p-1 rounded border border-black bg-black text-white hover:bg-neutral-800 transition-colors shadow-[1px_1px_0px_0px_#000]"
      >
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </aside>
  );
}
