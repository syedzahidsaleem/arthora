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
    <div className="neo-box p-8 md:p-12 bg-white flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
      {/* Animated Icon Circle */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-neo-mint border-[3px] border-black flex items-center justify-center text-black shadow-neo animate-bounce duration-1000">
          <StepIcon className="w-10 h-10 stroke-[2.5]" />
        </div>
      </div>

      {/* Dynamic Text Step */}
      <div className="space-y-2 max-w-md relative z-10">
        <h3 className="text-xl font-black text-black tracking-tight animate-in fade-in duration-300 uppercase">
          {STEPS[currentStep].title}
        </h3>
        <p className="text-xs font-mono text-black/70 leading-relaxed animate-in fade-in duration-300">
          {STEPS[currentStep].subtitle}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 pt-2 relative z-10">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2.5 rounded-full border border-black transition-all duration-500 ${
              idx === currentStep
                ? 'w-8 bg-neo-yellow shadow-sm'
                : 'w-2.5 bg-neo-cream'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
