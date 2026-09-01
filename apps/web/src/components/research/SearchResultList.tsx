'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { FundCard, FundCardData } from './FundCard';
import { StockCard, StockCardData } from './StockCard';
import { EmptyState } from '../common/EmptyState';
import { cn } from '@/lib/utils';

interface SearchResultListProps {
  fundResults: FundCardData[];
  stockResults: StockCardData[];
  isLoading: boolean;
  searchQuery: string;
}

export function SearchResultList({
  fundResults,
  stockResults,
  isLoading,
  searchQuery,
}: SearchResultListProps) {
  const [activeTab, setActiveTab] = useState<'funds' | 'stocks'>('funds');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 bg-[#1A1B2E] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-3 w-1/2 bg-white/5 rounded" />
            <div className="h-8 w-full bg-white/5 rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  const hasFunds = fundResults.length > 0;
  const hasStocks = stockResults.length > 0;

  if (!hasFunds && !hasStocks && searchQuery) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`We couldn't find any mutual funds or stocks matching "${searchQuery}". Try searching by ticker, fund house, or AMC.`}
        className="my-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('funds')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
            activeTab === 'funds'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-[#9B9BB4] hover:text-white',
          )}
        >
          <span>Mutual Funds</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/5 text-[10px] font-mono">
            {fundResults.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stocks')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
            activeTab === 'stocks'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-[#9B9BB4] hover:text-white',
          )}
        >
          <span>NSE Stocks</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/5 text-[10px] font-mono">
            {stockResults.length}
          </span>
        </button>
      </div>

      {/* Result Cards Grid */}
      {activeTab === 'funds' ? (
        hasFunds ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fundResults.map((fund) => (
              <FundCard key={fund.schemeCode} fund={fund} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#9B9BB4]">
            No mutual fund schemes matching &quot;{searchQuery}&quot;
          </div>
        )
      ) : hasStocks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stockResults.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#9B9BB4]">
          No NSE stocks matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
