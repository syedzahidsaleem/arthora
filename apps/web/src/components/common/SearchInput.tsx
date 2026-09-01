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
            'p-2 rounded-xl text-[#9B9BB4] hover:text-white hover:bg-white/5 transition-colors',
            triggerClassName,
          )}
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search mutual funds and stocks"
          className={cn(
            'flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-[#1A1B2E] border border-white/5 text-[#9B9BB4] hover:border-white/10 hover:text-white transition-all text-xs font-medium group',
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#9B9BB4] group-hover:text-[#6C63FF] transition-colors" />
            <span>Search funds, stocks...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#9B9BB4]">
            ⌘K
          </kbd>
        </button>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[15%] left-[50%] translate-x-[-50%] w-full max-w-xl bg-[#13141F] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-[#1A1B2E]/50">
              <Search className="w-5 h-5 text-[#6C63FF] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by fund name, AMC, stock ticker..."
                className="flex-1 bg-transparent text-white placeholder-[#9B9BB4]/60 text-sm font-medium focus:outline-none"
                autoFocus
              />
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => clearResults()}
                  aria-label="Clear search"
                  className="p-1 text-[#9B9BB4] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#9B9BB4]">
                  ESC
                </kbd>
              )}
            </div>

            {/* Search Results / History body */}
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
              {!debouncedQuery.trim() ? (
                /* Recent searches */
                <div>
                  {recentSearches.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#9B9BB4] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-[#9B9BB4]" />
                          Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={() => clearRecentSearches()}
                          className="text-[10px] lowercase text-[#9B9BB4]/70 hover:text-[#FF4D6D] transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      {recentSearches.map((searchTerm, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuery(searchTerm)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#F8F9FA] hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="truncate">{searchTerm}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9B9BB4]" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#9B9BB4]">
                      <Sparkles className="w-6 h-6 text-[#6C63FF] mx-auto mb-2 opacity-60" />
                      Type a fund house (e.g. HDFC, Parag Parikh) or stock symbol (e.g. RELIANCE, TCS)
                    </div>
                  )}
                </div>
              ) : totalResults === 0 && !isLoading ? (
                <div className="py-10 text-center text-xs text-[#9B9BB4]">
                  No matching mutual funds or stocks found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Mutual Funds section */}
                  {fundResults.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[11px] font-semibold text-[#9B9BB4] uppercase tracking-wider">
                        Mutual Funds
                      </div>
                      <div className="space-y-1 mt-1">
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
                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all',
                                isSelected ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 text-white' : 'hover:bg-white/5 text-[#F8F9FA]',
                              )}
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-medium truncate">{fund.schemeName}</div>
                                <div className="text-[11px] text-[#9B9BB4] capitalize">
                                  {fund.category?.replace(/_/g, ' ') || 'Mutual Fund'} • {fund.fundHouse}
                                </div>
                              </div>
                              {fund.latestNAV ? (
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-semibold text-white">
                                    {formatINR(fund.latestNAV)}
                                  </div>
                                  <div className="text-[10px] text-[#9B9BB4]">NAV</div>
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
                      <div className="px-3 py-1 text-[11px] font-semibold text-[#9B9BB4] uppercase tracking-wider">
                        NSE Stocks
                      </div>
                      <div className="space-y-1 mt-1">
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
                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all',
                                isSelected ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 text-white' : 'hover:bg-white/5 text-[#F8F9FA]',
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00D2FF]">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-mono font-bold text-white">{stock.symbol}</div>
                                  <div className="text-[11px] text-[#9B9BB4] truncate">{stock.companyName}</div>
                                </div>
                              </div>
                              {stock.currentPrice ? (
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-semibold text-white">
                                    {formatINR(stock.currentPrice)}
                                  </div>
                                  <div className="text-[10px] text-[#9B9BB4]">NSE</div>
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
            <div className="px-4 py-2.5 border-t border-white/5 bg-[#1A1B2E]/50 flex items-center justify-between text-[11px] text-[#9B9BB4]">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↵</kbd> select</span>
              </div>
              <span>Powered by Arthora Search</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
