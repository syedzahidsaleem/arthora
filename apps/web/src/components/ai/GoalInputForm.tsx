'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Shield, Compass, Flame } from 'lucide-react';
import { Slider } from '../ui/slider';
import { createPortfolioSchema, type CreatePortfolioInput, formatINR } from '@arthora/shared';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { cn } from '@/lib/utils';

const PRESET_CATEGORIES = [
  { id: 'retirement', label: '🏖️ Retirement', goal: 'Build a retirement corpus for a peaceful post-retirement life' },
  { id: 'home', label: '🏠 Buy a Home', goal: 'Save for a down payment to buy a dream house' },
  { id: 'education', label: '🎓 Child Education', goal: "Fund my child's higher education and overseas university" },
  { id: 'wealth_building', label: '📈 Wealth Building', goal: 'Maximize long term compounding wealth through equity' },
  { id: 'tax_saving', label: '💰 Tax Saving', goal: 'Save tax under section 80C with high growth ELSS funds' },
  { id: 'emergency', label: '🛡️ Emergency Fund', goal: 'Build a secure liquid emergency fund for 6-12 months of expenses' },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const TIME_TICKS = [
  { value: 1, label: '1Y' },
  { value: 5, label: '5Y' },
  { value: 10, label: '10Y' },
  { value: 15, label: '15Y' },
  { value: 20, label: '20Y' },
  { value: 30, label: '30Y' },
];

interface GoalInputFormProps {
  onSubmit: (data: CreatePortfolioInput) => Promise<void>;
  isGenerating: boolean;
}

export function GoalInputForm({ onSubmit, isGenerating }: GoalInputFormProps) {
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(25000);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreatePortfolioInput>({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      name: 'Retirement Wealth Goal',
      goal: 'Build a retirement corpus for a peaceful post-retirement life',
      goalCategory: 'retirement',
      timePeriod: 10,
      riskLevel: 'medium',
      monthlyInvestment: 25000,
      lumpSum: 0,
    },
  });

  const selectedCategory = watch('goalCategory');
  const selectedRisk = watch('riskLevel');
  const currentTimePeriod = watch('timePeriod');
  const monthlyAmount = watch('monthlyInvestment') ?? 0;

  const handleCategorySelect = (cat: (typeof PRESET_CATEGORIES)[0]) => {
    setValue('goalCategory', cat.id as CreatePortfolioInput['goalCategory']);
    setValue('goal', cat.goal);
    setValue('name', `${cat.label.replace(/^[^\s]+ /, '')} Goal`);
  };

  const handleQuickAmount = (amt: number) => {
    setSelectedQuickAmount(amt);
    setValue('monthlyInvestment', amt);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 sm:p-6 rounded-2xl bg-[#13141F] border border-white/[0.08] shadow-2xl space-y-6"
    >
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-white uppercase tracking-wider">AI Portfolio Builder</h2>
          <p className="text-xs font-mono text-[#9B9BB4]">
            Describe your goal and let Gemini AI tailor an optimized portfolio
          </p>
        </div>
      </div>

      {/* Goal Preset Category Chips */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-[#9B9BB4] uppercase tracking-wider">
          Choose a Goal Template
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase whitespace-nowrap transition-all border shrink-0',
                  isSelected
                    ? 'bg-brand-primary text-white border-brand-primary shadow-[0_0_12px_rgba(108,99,255,0.3)] font-bold'
                    : 'bg-[#181926] text-[#9B9BB4] border-white/[0.06] hover:bg-[#202234] hover:text-white',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Description Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-medium text-[#9B9BB4] uppercase tracking-wider">
            Describe Your Goal in Detail
          </label>
          <span className="text-[10px] font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20 font-bold">
            Natural Language
          </span>
        </div>
        <textarea
          {...register('goal')}
          rows={3}
          placeholder="e.g., Save ₹50 Lakhs for house down payment in Bangalore in 7 years..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E1A] border border-white/[0.08] text-sm text-white placeholder:text-[#5A5A7A] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none font-sans"
        />
        {errors.goal && (
          <p className="text-xs text-feedback-error font-mono">{errors.goal.message}</p>
        )}
      </div>

      {/* Time Horizon Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-medium text-[#9B9BB4] uppercase tracking-wider">
            Investment Horizon
          </label>
          <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 tabular-nums">
            {currentTimePeriod} {currentTimePeriod === 1 ? 'Year' : 'Years'}
          </span>
        </div>

        <Controller
          name="timePeriod"
          control={control}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              max={30}
              min={1}
              step={1}
              ticks={TIME_TICKS}
              showTicks
              onValueChange={(vals) => field.onChange(vals[0])}
              aria-label="Time period in years"
            />
          )}
        />
      </div>

      {/* Risk Appetite 3 Cards */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-[#9B9BB4] uppercase tracking-wider">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Conservative */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'low')}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              selectedRisk === 'low'
                ? 'bg-feedback-success/10 border-feedback-success/40 text-feedback-success shadow-[0_0_12px_rgba(0,208,132,0.15)]'
                : 'bg-[#181926] border-white/[0.06] text-[#9B9BB4] hover:bg-[#202234] hover:text-white',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-xs uppercase">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Conservative</span>
            </div>
            <p className="text-[11px] leading-snug text-[#9B9BB4]">
              Capital preservation. Mostly debt & hybrid funds.
            </p>
          </button>

          {/* Moderate */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'medium')}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              selectedRisk === 'medium'
                ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-[0_0_12px_rgba(108,99,255,0.15)]'
                : 'bg-[#181926] border-white/[0.06] text-[#9B9BB4] hover:bg-[#202234] hover:text-white',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-xs uppercase">
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>Moderate</span>
            </div>
            <p className="text-[11px] leading-snug text-[#9B9BB4]">
              Balanced growth. Index, flexi cap, & large cap.
            </p>
          </button>

          {/* Aggressive */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'high')}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              selectedRisk === 'high'
                ? 'bg-feedback-error/10 border-feedback-error/40 text-feedback-error shadow-[0_0_12px_rgba(255,77,109,0.15)]'
                : 'bg-[#181926] border-white/[0.06] text-[#9B9BB4] hover:bg-[#202234] hover:text-white',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-xs uppercase">
              <Flame className="w-4 h-4 stroke-[2.5]" />
              <span>Aggressive</span>
            </div>
            <p className="text-[11px] leading-snug text-[#9B9BB4]">
              Maximum compounding. Small cap, mid cap, equities.
            </p>
          </button>
        </div>
      </div>

      {/* Monthly Investment Amount */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-[#9B9BB4] uppercase tracking-wider flex items-center justify-between">
          <span>Monthly SIP Amount</span>
          <span className="font-mono text-white text-xs font-bold tabular-nums">
            {formatINR(monthlyAmount)}
          </span>
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#9B9BB4]">
            ₹
          </span>
          <input
            type="number"
            {...register('monthlyInvestment', { valueAsNumber: true })}
            placeholder="25000"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0D0E1A] border border-white/[0.08] text-sm font-mono font-bold text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all tabular-nums"
          />
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {QUICK_AMOUNTS.map((amt) => {
            const isSelected = selectedQuickAmount === amt && monthlyAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAmount(amt)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all tabular-nums',
                  isSelected
                    ? 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/40 font-bold'
                    : 'bg-[#181926] text-[#9B9BB4] border-white/[0.06] hover:bg-[#202234] hover:text-white',
                )}
              >
                {formatINR(amt)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className={cn(
          'w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 border transition-all',
          isGenerating
            ? 'bg-[#181926] cursor-not-allowed text-[#5A5A7A] border-white/[0.06]'
            : 'bg-brand-primary hover:bg-brand-primary/90 text-white border-brand-primary shadow-[0_0_20px_rgba(108,99,255,0.35)] active:scale-[0.99]',
        )}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Analyzing your goal with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Optimized Portfolio</span>
          </>
        )}
      </button>
    </form>
  );
}
export default GoalInputForm;
