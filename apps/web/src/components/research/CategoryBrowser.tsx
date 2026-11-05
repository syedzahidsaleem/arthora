'use client';

import React from 'react';
import { ChevronDown, X, ArrowUpDown, Building, Layers } from 'lucide-react';

export const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'elss', label: 'ELSS Tax Saver (80C)' },
  { id: 'flexi_cap', label: 'Flexi Cap Fund' },
  { id: 'large_cap', label: 'Large Cap Fund' },
  { id: 'mid_cap', label: 'Mid Cap Fund' },
  { id: 'small_cap', label: 'Small Cap Fund' },
  { id: 'balanced_advantage', label: 'Balanced Advantage (Hybrid)' },
  { id: 'index_funds', label: 'Index & ETF' },
  { id: 'liquid', label: 'Liquid & Overnight' },
];

export const FUND_HOUSES = [
  { id: '', label: 'All Fund Houses (AMCs)' },
  { id: 'Mirae Asset', label: 'Mirae Asset Mutual Fund' },
  { id: 'PPFAS', label: 'Parag Parikh (PPFAS) Mutual Fund' },
  { id: 'UTI', label: 'UTI Mutual Fund' },
  { id: 'Nippon', label: 'Nippon India Mutual Fund' },
  { id: 'HDFC', label: 'HDFC Mutual Fund' },
  { id: 'Axis', label: 'Axis Mutual Fund' },
  { id: 'ICICI', label: 'ICICI Prudential Mutual Fund' },
  { id: 'SBI', label: 'SBI Mutual Fund' },
  { id: 'Kotak', label: 'Kotak Mahindra Mutual Fund' },
  { id: 'Quant', label: 'Quant Mutual Fund' },
];

export const SORT_OPTIONS = [
  { id: 'default', label: 'Featured Institutional Pick' },
  { id: 'cagr3Y_desc', label: 'Highest 3Y Return (CAGR)' },
  { id: 'cagr5Y_desc', label: 'Highest 5Y Return (CAGR)' },
  { id: 'cagr1Y_desc', label: 'Highest 1Y Return' },
  { id: 'aum_desc', label: 'Largest Fund Size (AUM)' },
  { id: 'nav_asc', label: 'Lowest NAV' },
];

interface CategoryBrowserProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedAmc?: string;
  onSelectAmc?: (amc: string) => void;
  sortBy?: string;
  onSelectSortBy?: (sort: string) => void;
  onResetFilters?: () => void;
}

export function CategoryBrowser({
  selectedCategory,
  onSelectCategory,
  selectedAmc = '',
  onSelectAmc,
  sortBy = 'default',
  onSelectSortBy,
  onResetFilters,
}: CategoryBrowserProps) {
  const hasActiveFilters = Boolean(selectedCategory || selectedAmc || sortBy !== 'default');

  return (
    <div className="space-y-3 pt-1 select-none">
      {/* Dropdown Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Category Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono font-bold text-[#A0A0B2] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-brand-primary" />
            <span>Fund Category</span>
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#121218] border-2 border-black text-xs font-semibold text-white focus:outline-none focus:border-brand-primary cursor-pointer transition-colors shadow-neo-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#121218] text-white">
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#A0A0B2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>
        </div>

        {/* 2. AMC / Fund House Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono font-bold text-[#A0A0B2] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-[#00D2FF]" />
            <span>Asset Management Company</span>
          </label>
          <div className="relative">
            <select
              value={selectedAmc}
              onChange={(e) => onSelectAmc?.(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#121218] border-2 border-black text-xs font-semibold text-white focus:outline-none focus:border-[#00D2FF] cursor-pointer transition-colors shadow-neo-sm"
            >
              {FUND_HOUSES.map((amc) => (
                <option key={amc.id} value={amc.id} className="bg-[#121218] text-white">
                  {amc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#A0A0B2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>
        </div>

        {/* 3. Sort By Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono font-bold text-[#A0A0B2] uppercase tracking-wider mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-neo-yellow" />
            <span>Rank & Sort Criteria</span>
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSelectSortBy?.(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#121218] border-2 border-black text-xs font-semibold text-white focus:outline-none focus:border-neo-yellow cursor-pointer transition-colors shadow-neo-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#121218] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#A0A0B2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[10px] font-mono text-[#A0A0B2] uppercase tracking-wider">Active:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-[#8B5CF6] border border-brand-primary/40 text-[11px] font-mono font-bold">
              <span>{CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}</span>
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className="hover:text-white ml-0.5"
                aria-label="Clear category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedAmc && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 text-[11px] font-mono font-bold">
              <span>{selectedAmc}</span>
              <button
                type="button"
                onClick={() => onSelectAmc?.('')}
                className="hover:text-white ml-0.5"
                aria-label="Clear AMC filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sortBy !== 'default' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neo-yellow/20 text-neo-yellow border border-neo-yellow/40 text-[11px] font-mono font-bold">
              <span>{SORT_OPTIONS.find((s) => s.id === sortBy)?.label}</span>
              <button
                type="button"
                onClick={() => onSelectSortBy?.('default')}
                className="hover:text-white ml-0.5"
                aria-label="Reset sort"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-[#A0A0B2] hover:text-white underline font-mono ml-auto"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
