'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  inline?: boolean;
  className?: string;
}

export function DisclaimerBanner({ className }: DisclaimerBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('arthora-disclaimer-dismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('arthora-disclaimer-dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <aside
      aria-label="SEBI regulatory disclaimer"
      className={cn(
        'w-full p-4 rounded-xl bg-neo-yellow text-black border-2 border-black shadow-neo flex items-start sm:items-center justify-between gap-4 font-mono text-xs leading-relaxed transition-all',
        className,
      )}
    >
      <div className="flex items-start sm:items-center gap-3">
        <AlertCircle className="w-5 h-5 text-black shrink-0 mt-0.5 sm:mt-0 fill-black text-neo-yellow" />
        <p>
          <strong className="font-black uppercase">Regulatory Note: </strong>
          Arthora is not a SEBI registered investment advisor or research analyst. All information, simulations, and suggested portfolios are generated for educational and research purposes only. Past performance does not guarantee future results.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss disclaimer banner"
        className="p-1.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 transition-colors shadow-[1px_1px_0px_0px_#000] shrink-0"
      >
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </aside>
  );
}
