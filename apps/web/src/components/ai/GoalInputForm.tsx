'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Shield, Compass, Flame } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { createPortfolioSchema, type CreatePortfolioInput } from '@arthora/shared';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatINR } from '@arthora/shared';
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

  const handleCategorySelect = (cat: typeof PRESET_CATEGORIES[0]) => {
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
      className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6"
    >
      {/* Form Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-base text-white">AI Portfolio Builder</h2>
          <p className="text-xs text-[#9B9BB4]">
            Describe your investment goal and let Gemini AI tailor your portfolio
          </p>
        </div>
      </div>

      {/* Goal Preset Category Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">
          Choose a Goal Template
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0',
                  isSelected
                    ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D2FF]/20 text-white border-[#6C63FF] shadow-sm'
                    : 'bg-[#13141F] text-[#9B9BB4] border-white/5 hover:border-white/10 hover:text-white',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider flex items-center justify-between">
          <span>Describe Your Goal in Detail</span>
          <span className="text-[11px] text-[#9B9BB4]/60 font-normal">Natural Language</span>
        </label>
        <textarea
          {...register('goal')}
          rows={3}
          placeholder="e.g., Save ₹50 Lakhs for house down payment in Bangalore in 7 years..."
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl bg-[#13141F] border text-sm text-white placeholder-[#9B9BB4]/50 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all resize-none',
            errors.goal ? 'border-[#FF4D6D]' : 'border-white/5 focus:border-transparent',
          )}
        />
        {errors.goal && (
          <p className="text-xs text-[#FF4D6D]">{errors.goal.message}</p>
        )}
      </div>

      {/* Time Horizon Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">
            Investment Horizon
          </label>
          <span className="font-mono font-bold text-sm text-[#00D2FF]">
            {currentTimePeriod} {currentTimePeriod === 1 ? 'Year' : 'Years'}
          </span>
        </div>

        <Controller
          name="timePeriod"
          control={control}
          render={({ field }) => (
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[field.value]}
              max={30}
              min={1}
              step={1}
              onValueChange={(vals) => field.onChange(vals[0])}
            >
              <Slider.Track className="bg-[#13141F] relative grow rounded-full h-2 overflow-hidden border border-white/5">
                <Slider.Range className="absolute bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white shadow-lg shadow-black/50 rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Time period in years"
              />
            </Slider.Root>
          )}
        />

        {/* Milestone labels */}
        <div className="flex justify-between text-[10px] font-mono text-[#9B9BB4]/60 px-1">
          <span>1Y</span>
          <span>3Y</span>
          <span>5Y</span>
          <span>10Y</span>
          <span>15Y</span>
          <span>20Y</span>
          <span>30Y</span>
        </div>
      </div>

      {/* Risk Appetite 3 Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Conservative */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'low')}
            className={cn(
              'p-3 rounded-2xl border text-left transition-all relative overflow-hidden',
              selectedRisk === 'low'
                ? 'bg-gradient-to-br from-[#00D084]/20 to-[#00D084]/5 border-[#00D084] shadow-md shadow-[#00D084]/10'
                : 'bg-[#13141F] border-white/5 hover:border-white/10',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#00D084]">
              <Shield className="w-4 h-4" />
              <span className="font-bold text-xs text-white">Conservative</span>
            </div>
            <p className="text-[11px] text-[#9B9BB4] leading-snug">
              Capital preservation. Mostly debt and balanced hybrid funds.
            </p>
          </button>

          {/* Moderate */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'medium')}
            className={cn(
              'p-3 rounded-2xl border text-left transition-all relative overflow-hidden',
              selectedRisk === 'medium'
                ? 'bg-gradient-to-br from-[#6C63FF]/20 to-[#6C63FF]/5 border-[#6C63FF] shadow-md shadow-[#6C63FF]/10'
                : 'bg-[#13141F] border-white/5 hover:border-white/10',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#00D2FF]">
              <Compass className="w-4 h-4" />
              <span className="font-bold text-xs text-white">Moderate</span>
            </div>
            <p className="text-[11px] text-[#9B9BB4] leading-snug">
              Balanced growth. Index, flexi cap, and large cap funds.
            </p>
          </button>

          {/* Aggressive */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'high')}
            className={cn(
              'p-3 rounded-2xl border text-left transition-all relative overflow-hidden',
              selectedRisk === 'high'
                ? 'bg-gradient-to-br from-[#FF4D6D]/20 to-[#FF4D6D]/5 border-[#FF4D6D] shadow-md shadow-[#FF4D6D]/10'
                : 'bg-[#13141F] border-white/5 hover:border-white/10',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#FF4D6D]">
              <Flame className="w-4 h-4" />
              <span className="font-bold text-xs text-white">Aggressive</span>
            </div>
            <p className="text-[11px] text-[#9B9BB4] leading-snug">
              Maximum wealth compounding. Small cap, mid cap, & equities.
            </p>
          </button>
        </div>
      </div>

      {/* Monthly Investment Amount */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider flex items-center justify-between">
          <span>Monthly SIP Amount (INR)</span>
          <span className="font-mono text-white text-xs font-bold">
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
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#13141F] border border-white/5 text-sm font-mono font-semibold text-white placeholder-[#9B9BB4]/50 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all"
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
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all',
                  isSelected
                    ? 'bg-[#6C63FF]/20 text-[#00D2FF] border-[#6C63FF]'
                    : 'bg-[#13141F] text-[#9B9BB4] border-white/5 hover:border-white/10 hover:text-white',
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
          'w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#6C63FF]/25',
          isGenerating
            ? 'bg-white/10 cursor-not-allowed text-[#9B9BB4]'
            : 'bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-[0.98]',
        )}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Analyzing your goal with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate My Portfolio</span>
          </>
        )}
      </button>
    </form>
  );
}
