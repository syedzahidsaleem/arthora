'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const POPULAR_CATEGORIES = [
  { id: 'all', label: 'All Funds' },
  { id: 'elss', label: 'ELSS Tax Saver' },
  { id: 'flexi_cap', label: 'Flexi Cap' },
  { id: 'large_cap', label: 'Large Cap' },
  { id: 'mid_cap', label: 'Mid Cap' },
  { id: 'small_cap', label: 'Small Cap' },
  { id: 'balanced_advantage', label: 'Balanced Advantage' },
  { id: 'index_funds', label: 'Index / ETF' },
  { id: 'liquid', label: 'Liquid / Overnight' },
];

interface CategoryBrowserProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function CategoryBrowser({
  selectedCategory,
  onSelectCategory,
}: CategoryBrowserProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {POPULAR_CATEGORIES.map((cat) => {
        const isSelected =
          selectedCategory === cat.id ||
          (cat.id === 'all' && !selectedCategory);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 active:scale-95',
              isSelected
                ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D2FF]/20 text-white border-[#6C63FF] shadow-sm'
                : 'bg-[#1A1B2E] text-[#9B9BB4] border-white/5 hover:border-white/10 hover:text-white',
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
