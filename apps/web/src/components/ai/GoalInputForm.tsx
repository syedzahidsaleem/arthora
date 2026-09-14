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
      className="p-5 sm:p-6 rounded-xl bg-[#161620] border-[3px] border-black shadow-neo-lg space-y-6"
    >
      {/* Form Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
        <div className="w-8 h-8 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
          <Sparkles className="w-4 h-4 fill-black" />
        </div>
        <div>
          <h2 className="font-black text-base text-white uppercase tracking-tight">AI Portfolio Builder</h2>
          <p className="text-xs font-mono text-[#A0A0B2]">
            Describe your investment goal and let Gemini AI tailor your portfolio
          </p>
        </div>
      </div>

      {/* Goal Preset Category Chips */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-black text-[#A0A0B2] uppercase tracking-wider">
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
                  'px-3 py-1.5 rounded-md text-xs font-bold font-mono uppercase whitespace-nowrap transition-all border-2 border-black shrink-0 active:translate-x-0.5 active:translate-y-0.5',
                  isSelected
                    ? 'bg-neo-yellow text-black shadow-neo-sm'
                    : 'bg-[#1E1E28] text-white hover:bg-[#282834]',
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
        <label className="text-xs font-mono font-black text-[#A0A0B2] uppercase tracking-wider flex items-center justify-between">
          <span>Describe Your Goal in Detail</span>
          <span className="text-[11px] text-neo-yellow font-bold">Natural Language</span>
        </label>
        <textarea
          {...register('goal')}
          rows={3}
          placeholder="e.g., Save ₹50 Lakhs for house down payment in Bangalore in 7 years..."
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg bg-[#121218] border-2 border-black text-sm font-medium text-white placeholder-[#A0A0B2] focus:outline-none focus:border-black focus:shadow-neo transition-all resize-none',
            errors.goal ? 'border-[#FF4D6D]' : '',
          )}
        />
        {errors.goal && (
          <p className="text-xs text-[#FF4D6D] font-mono font-bold">{errors.goal.message}</p>
        )}
      </div>

      {/* Time Horizon Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black text-[#A0A0B2] uppercase tracking-wider">
            Investment Horizon
          </label>
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-neo-cyan text-black border border-black shadow-[1px_1px_0px_0px_#000]">
            {currentTimePeriod} {currentTimePeriod === 1 ? 'Year' : 'Years'}
          </span>
        </div>

        <Controller
          name="timePeriod"
          control={control}
          render={({ field }) => (
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-6"
              value={[field.value]}
              max={30}
              min={1}
              step={1}
              onValueChange={(vals) => field.onChange(vals[0])}
            >
              <Slider.Track className="bg-[#121218] relative grow rounded-md h-3 overflow-hidden border-2 border-black">
                <Slider.Range className="absolute bg-neo-yellow h-full border-r-2 border-black" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-6 h-6 bg-neo-cyan border-2 border-black shadow-neo-sm rounded-md hover:scale-110 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Time period in years"
              />
            </Slider.Root>
          )}
        />

        {/* Milestone labels */}
        <div className="flex justify-between text-[10px] font-mono font-bold text-[#A0A0B2] px-1">
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
        <label className="text-xs font-mono font-black text-[#A0A0B2] uppercase tracking-wider">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Conservative */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'low')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all',
              selectedRisk === 'low'
                ? 'bg-neo-lime text-black shadow-neo'
                : 'bg-[#1E1E28] text-white hover:bg-[#282834]',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Conservative</span>
            </div>
            <p className={cn('text-[11px] leading-snug font-medium', selectedRisk === 'low' ? 'text-black' : 'text-[#A0A0B2]')}>
              Capital preservation. Mostly debt and hybrid funds.
            </p>
          </button>

          {/* Moderate */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'medium')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all',
              selectedRisk === 'medium'
                ? 'bg-neo-yellow text-black shadow-neo'
                : 'bg-[#1E1E28] text-white hover:bg-[#282834]',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase">
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>Moderate</span>
            </div>
            <p className={cn('text-[11px] leading-snug font-medium', selectedRisk === 'medium' ? 'text-black' : 'text-[#A0A0B2]')}>
              Balanced growth. Index, flexi cap, & large cap funds.
            </p>
          </button>

          {/* Aggressive */}
          <button
            type="button"
            onClick={() => setValue('riskLevel', 'high')}
            className={cn(
              'p-3 rounded-xl border-2 border-black text-left transition-all',
              selectedRisk === 'high'
                ? 'bg-neo-pink text-black shadow-neo'
                : 'bg-[#1E1E28] text-white hover:bg-[#282834]',
            )}
          >
            <div className="flex items-center gap-1.5 mb-1 font-mono font-black text-xs uppercase">
              <Flame className="w-4 h-4 stroke-[2.5]" />
              <span>Aggressive</span>
            </div>
            <p className={cn('text-[11px] leading-snug font-medium', selectedRisk === 'high' ? 'text-black' : 'text-[#A0A0B2]')}>
              Maximum compounding. Small cap, mid cap, & equities.
            </p>
          </button>
        </div>
      </div>

      {/* Monthly Investment Amount */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-black text-[#A0A0B2] uppercase tracking-wider flex items-center justify-between">
          <span>Monthly SIP Amount (INR)</span>
          <span className="font-mono text-white text-xs font-black">
            {formatINR(monthlyAmount)}
          </span>
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-[#A0A0B2]">
            ₹
          </span>
          <input
            type="number"
            {...register('monthlyInvestment', { valueAsNumber: true })}
            placeholder="25000"
            className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#121218] border-2 border-black text-sm font-mono font-black text-white focus:outline-none focus:shadow-neo transition-all"
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
                  'px-2.5 py-1 rounded-md text-xs font-mono font-bold border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5',
                  isSelected
                    ? 'bg-neo-cyan text-black shadow-neo-sm font-black'
                    : 'bg-[#1E1E28] text-white hover:bg-[#282834]',
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
          'w-full py-4 rounded-xl font-black text-base uppercase tracking-wider text-black flex items-center justify-center gap-2.5 border-[3px] border-black transition-all',
          isGenerating
            ? 'bg-[#282834] cursor-not-allowed text-[#A0A0B2] border-black'
            : 'bg-neo-yellow shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#FFE570]',
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
            <span>Generate My Portfolio</span>
          </>
        )}
      </button>
    </form>
  );
}
