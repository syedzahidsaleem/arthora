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
      className="p-5 sm:p-6 rounded-2xl bg-neo-lilac border-[3px] border-black shadow-neo-lg space-y-6 text-[#222A2A] select-none"
    >
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
        <div className="w-9 h-9 rounded-xl bg-neo-yellow border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
          <Sparkles className="w-5 h-5 fill-black" />
        </div>
        <div>
          <h2 className="font-black text-sm text-black uppercase tracking-wider">AI Portfolio Builder</h2>
          <p className="text-xs font-mono font-bold text-[#525866]">
            Describe your goal and let Gemini AI tailor an optimized portfolio
          </p>
        </div>
      </div>

      {/* Goal Preset Category Chips */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-black text-black uppercase tracking-wider">
          Choose a Goal Template
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-mono uppercase whitespace-nowrap transition-all border-2 border-black shrink-0 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                  isSelected
                    ? 'bg-neo-mint text-black font-black'
                    : 'bg-white text-black hover:bg-neo-yellow font-bold',
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
          <label className="text-xs font-mono font-black text-black uppercase tracking-wider">
            Describe Your Goal in Detail
          </label>
          <span className="text-[10px] font-mono text-black bg-neo-aqua px-2 py-0.5 rounded border border-black font-black shadow-[1px_1px_0px_#000]">
            Natural Language
          </span>
        </div>
        <textarea
          {...register('goal')}
          rows={3}
          placeholder="e.g., Save ₹50 Lakhs for house down payment in Bangalore in 7 years..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black text-sm font-bold text-[#222A2A] placeholder:text-[#717684] focus:outline-none focus:shadow-neo shadow-neo-sm transition-all resize-none font-sans"
        />
        {errors.goal && (
          <p className="text-xs text-neo-rust font-mono font-bold">{errors.goal.message}</p>
        )}
      </div>

      {/* Time Horizon Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black text-black uppercase tracking-wider">
            Investment Horizon
          </label>
          <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-neo-yellow text-black border-2 border-black shadow-[1px_1px_0px_#000] tabular-nums">
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
        <label className="text-xs font-mono font-black text-black uppercase tracking-wider">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Conservative */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'low')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all active:translate-x-0.5 active:translate-y-0.5',
              selectedRisk === 'low'
                ? 'bg-neo-mint text-black shadow-neo font-black'
                : 'bg-white text-[#525866] hover:bg-neo-yellow hover:text-black shadow-neo-sm',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase text-black">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Conservative</span>
            </div>
            <p className="text-[11px] leading-snug font-medium text-black">
              Capital preservation. Mostly debt & hybrid funds.
            </p>
          </button>

          {/* Moderate */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'medium')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all active:translate-x-0.5 active:translate-y-0.5',
              selectedRisk === 'medium'
                ? 'bg-neo-yellow text-black shadow-neo font-black'
                : 'bg-white text-[#525866] hover:bg-neo-yellow hover:text-black shadow-neo-sm',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase text-black">
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>Moderate</span>
            </div>
            <p className="text-[11px] leading-snug font-medium text-black">
              Balanced growth. Index, flexi cap, & large cap.
            </p>
          </button>

          {/* Aggressive */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'high')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all active:translate-x-0.5 active:translate-y-0.5',
              selectedRisk === 'high'
                ? 'bg-neo-rust text-white shadow-neo font-black'
                : 'bg-white text-[#525866] hover:bg-neo-yellow hover:text-black shadow-neo-sm',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase text-black">
              <Flame className="w-4 h-4 stroke-[2.5]" />
              <span>Aggressive</span>
            </div>
            <p className="text-[11px] leading-snug font-medium text-black">
              Maximum compounding. Small cap, mid cap, equities.
            </p>
          </button>
        </div>
      </div>

      {/* Monthly Investment Amount */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-black text-black uppercase tracking-wider flex items-center justify-between">
          <span>Monthly SIP Amount</span>
          <span className="font-mono text-black text-xs font-black tabular-nums">
            {formatINR(monthlyAmount)}
          </span>
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-black">
            ₹
          </span>
          <input
            type="number"
            {...register('monthlyInvestment', { valueAsNumber: true })}
            placeholder="25000"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border-2 border-black text-sm font-mono font-black text-[#222A2A] focus:outline-none focus:shadow-neo shadow-neo-sm transition-all tabular-nums"
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
                  'px-3 py-1 rounded-lg text-xs font-mono font-black border-2 border-black transition-all tabular-nums shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5',
                  isSelected
                    ? 'bg-neo-mint text-black'
                    : 'bg-white text-black hover:bg-neo-yellow',
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
          'w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 border-2 border-black shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
          isGenerating
            ? 'bg-white cursor-not-allowed text-[#717684]'
            : 'bg-neo-mint hover:bg-neo-yellow text-black hover:shadow-neo-lg',
        )}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Analyzing your goal with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-black" />
            <span>Generate Optimized Portfolio</span>
          </>
        )}
      </button>
    </form>
  );
}
export default GoalInputForm;
