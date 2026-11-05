'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, History, TrendingUp, Sparkles, X, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSearch } from '@/hooks/useSearch';
import { useSearchStore } from '@/store/searchStore';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';
import { formatINR } from '@arthora/shared';

interface SearchInputProps {
  triggerClassName?: string;
  isMobileTrigger?: boolean;
}

export function SearchInput({ triggerClassName, isMobileTrigger = false }: SearchInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const {
    query,
    debouncedQuery,
    fundResults,
    stockResults,
    isLoading,
    recentSearches,
    setQuery,
    clearResults,
  } = useSearch();

  const { clearRecentSearches } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalResults = fundResults.length + stockResults.length;

  const allItems = [
    ...fundResults.map((f) => ({ type: 'fund' as const, data: f })),
    ...stockResults.map((s) => ({ type: 'stock' as const, data: s })),
  ];

  const handleSelect = (index: number) => {
    const item = allItems[index];
    if (!item) return;

    if (item.type === 'fund') {
      router.push(`/research/fund/${item.data.schemeCode}`);
    } else {
      router.push(`/research/stock/${item.data.symbol}`);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, totalResults - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalResults > 0) {
        handleSelect(selectedIndex);
      }
    }
  };

  return (
    <>
      {isMobileTrigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className={cn(
            'p-2 rounded-xl border-2 border-black bg-white text-black hover:bg-neo-yellow shadow-neo-sm transition-all',
            triggerClassName,
          )}
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search mutual funds and stocks"
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white border-2 border-black text-[#525866] hover:text-black hover:bg-neo-yellow shadow-neo-sm hover:shadow-neo transition-all text-xs font-bold group',
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="truncate">Search funds, stocks...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neo-yellow border border-black text-[10px] font-mono font-bold text-black shadow-[1px_1px_0px_#000]">
            ⌘K
          </kbd>
        </button>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[15%] left-[50%] translate-x-[-50%] w-full max-w-xl bg-[#FBF7EE] border-[3px] border-black rounded-2xl shadow-neo-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none text-[#222A2A]">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-black bg-white">
              <Search className="w-5 h-5 text-black stroke-[2.5] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by fund name, AMC, stock ticker..."
                className="flex-1 bg-transparent text-[#222A2A] placeholder-[#717684] text-sm font-bold focus:outline-none"
                autoFocus
              />
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => clearResults()}
                  aria-label="Clear search"
                  className="p-1 rounded border border-black bg-neo-yellow text-black hover:bg-neo-mint shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <kbd className="px-1.5 py-0.5 rounded bg-neo-yellow border border-black text-[10px] font-mono font-bold text-black shadow-[1px_1px_0px_#000]">
                  ESC
                </kbd>
              )}
            </div>

            {/* Search Results / History body */}
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
              {!debouncedQuery.trim() ? (
                /* Recent searches */
                <div>
                  {recentSearches.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono font-bold text-[#525866] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 stroke-[2.5]" />
                          Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={() => clearRecentSearches()}
                          className="text-[10px] lowercase text-neo-rust hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>

                      {recentSearches.map((searchTerm, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuery(searchTerm)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#222A2A] bg-white border-2 border-black hover:bg-neo-lilac shadow-neo-sm hover:shadow-neo transition-all text-left"
                        >
                          <span className="truncate">{searchTerm}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs font-mono font-bold text-[#525866]">
                      <Sparkles className="w-6 h-6 text-black mx-auto mb-2" />
                      Type a fund house (e.g. HDFC, Parag Parikh) or stock symbol (e.g. RELIANCE, TCS)
                    </div>
                  )}
                </div>
              ) : totalResults === 0 && !isLoading ? (
                <div className="py-10 text-center text-xs font-mono font-bold text-[#525866]">
                  No matching mutual funds or stocks found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Mutual Funds section */}
                  {fundResults.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono font-bold text-[#525866] uppercase tracking-wider">
                        Mutual Funds
                      </div>
                      <div className="space-y-1.5 mt-1">
                        {fundResults.map((fund, idx) => {
                          const isSelected = selectedIndex === idx;
                          return (
                            <button
                              key={fund.schemeCode}
                              type="button"
                              onClick={() => {
                                router.push(`/research/fund/${fund.schemeCode}`);
                                setOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all border-2 border-black',
                                isSelected
                                  ? 'bg-neo-mint text-black shadow-neo font-black'
                                  : 'bg-white hover:bg-neo-lilac/50 text-[#222A2A] shadow-neo-sm',
                              )}
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-black truncate">{fund.schemeName}</div>
                                <div className="text-[11px] text-[#525866] font-mono capitalize">
                                  {fund.category?.replace(/_/g, ' ') || 'Mutual Fund'} • {fund.fundHouse}
                                </div>
                              </div>
                              {fund.latestNAV ? (
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-black text-[#222A2A]">
                                    {formatINR(fund.latestNAV)}
                                  </div>
                                  <div className="text-[10px] font-mono font-bold text-[#525866]">NAV</div>
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stocks section */}
                  {stockResults.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono font-bold text-[#525866] uppercase tracking-wider">
                        NSE Stocks
                      </div>
                      <div className="space-y-1.5 mt-1">
                        {stockResults.map((stock, idx) => {
                          const itemIndex = fundResults.length + idx;
                          const isSelected = selectedIndex === itemIndex;
                          return (
                            <button
                              key={stock.symbol}
                              type="button"
                              onClick={() => {
                                router.push(`/research/stock/${stock.symbol}`);
                                setOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all border-2 border-black',
                                isSelected
                                  ? 'bg-neo-mint text-black shadow-neo font-black'
                                  : 'bg-white hover:bg-neo-lilac/50 text-[#222A2A] shadow-neo-sm',
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                                <div className="w-7 h-7 rounded-lg bg-neo-aqua border border-black flex items-center justify-center shrink-0 text-black shadow-[1px_1px_0px_#000]">
                                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-mono font-black text-[#222A2A]">{stock.symbol}</div>
                                  <div className="text-[11px] font-medium text-[#525866] truncate">{stock.companyName}</div>
                                </div>
                              </div>
                              {stock.currentPrice ? (
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-black text-[#222A2A]">
                                    {formatINR(stock.currentPrice)}
                                  </div>
                                  <div className="text-[10px] font-mono font-bold text-[#525866]">NSE</div>
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with keyboard guidance */}
            <div className="px-4 py-2.5 border-t-2 border-black bg-[#E2DAC2] flex items-center justify-between text-[11px] font-mono font-bold text-[#222A2A]">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-black shadow-[1px_1px_0px_#000]">↑↓</kbd> navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-black shadow-[1px_1px_0px_#000]">↵</kbd> select</span>
              </div>
              <span>Arthora Terminal</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
export default SearchInput;
