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
          'flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed',
          className,
        )}
      >
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Disclaimer: </span>
          Arthora is not a SEBI registered investment advisor. All information, projections, and suggested allocations are generated for educational and research purposes only. Past performance does not guarantee future results. Please consult a SEBI-registered financial advisor before investing.
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="SEBI regulatory disclaimer"
      className={cn(
        'fixed bottom-16 md:bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 p-3.5 rounded-xl bg-[#13141F]/95 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200/90 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="leading-snug">
          <strong className="text-amber-300">Regulatory Note:</strong> Arthora is not a SEBI registered advisor. All data is for educational research only.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss disclaimer banner"
        className="p-1 rounded-lg hover:bg-white/10 text-amber-300/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}
