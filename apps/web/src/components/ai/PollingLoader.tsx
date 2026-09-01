'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, BarChart3, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Analyzing your financial goal...',
    subtitle: 'Extracting time horizons, target liquidity, and risk appetite',
  },
  {
    icon: Sparkles,
    title: 'Searching 40,000+ Indian mutual funds...',
    subtitle: 'Filtering Direct Growth schemes by historical Alpha and Sortino',
  },
  {
    icon: BarChart3,
    title: 'Running Monte Carlo projections...',
    subtitle: 'Simulating 10,000 stochastic market return trajectories',
  },
  {
    icon: ShieldCheck,
    title: 'Building your personalized portfolio...',
    subtitle: 'Synthesizing final asset allocation and rebalancing schedule',
  },
];

export function PollingLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="p-8 md:p-12 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
      {/* Background Animated Pulse Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF]/10 via-[#00D2FF]/10 to-transparent animate-pulse pointer-events-none" />

      {/* Animated Icon Circle */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-white shadow-2xl shadow-[#6C63FF]/40 animate-bounce duration-1000">
          <StepIcon className="w-10 h-10" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-[#00D2FF]/40 animate-ping opacity-25 pointer-events-none" />
      </div>

      {/* Dynamic Text Step */}
      <div className="space-y-2 max-w-md relative z-10">
        <h3 className="text-xl font-bold text-white tracking-tight animate-in fade-in duration-300">
          {STEPS[currentStep].title}
        </h3>
        <p className="text-xs text-[#9B9BB4] leading-relaxed animate-in fade-in duration-300">
          {STEPS[currentStep].subtitle}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 pt-2 relative z-10">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx === currentStep
                ? 'w-8 bg-gradient-to-r from-[#6C63FF] to-[#00D2FF]'
                : 'w-2 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
