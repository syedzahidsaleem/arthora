'use client';

import React, { useState } from 'react';
import { Bookmark, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { useFavorites, type IFavoriteWithMarketData } from '@/hooks/useFavorites';
import { WatchlistFundCard } from '@/components/research/WatchlistFundCard';
import { WatchlistStockCard } from '@/components/research/WatchlistStockCard';
import { CompareTable } from '@/components/research/CompareTable';
import { EmptyState } from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/PageSkeleton';

export default function WatchlistPage() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  if (isLoading && favorites.length === 0) {
    return <PageSkeleton />;
  }

  const fundFavorites = favorites.filter((f) => f.assetType === 'mutual_fund');
  const stockFavorites = favorites.filter((f) => f.assetType === 'stock');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedItems: IFavoriteWithMarketData[] = favorites.filter((f) =>
    selectedIds.includes(f._id),
  );

  const hasAnyFavorites = favorites.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Your Investment Watchlist</span>
            <span className="px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#00D2FF] text-[11px] font-bold border border-[#6C63FF]/30">
              {favorites.length} SAVED
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9BB4] mt-1">
            Track live NAVs, stock quotes, and compare metrics side-by-side.
          </p>
        </div>

        {selectedIds.length >= 2 && (
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 shadow-lg shadow-[#6C63FF]/20 animate-in fade-in"
          >
            <Sparkles className="w-4 h-4" />
            <span>Compare Selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Side by side comparison view */}
      {showCompare && (
        <CompareTable
          items={selectedItems}
          onClose={() => {
            setShowCompare(false);
            setSelectedIds([]);
          }}
        />
      )}

      {!hasAnyFavorites ? (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          description="Start researching mutual funds and stocks to track them here in real-time."
          action={{
            label: 'Explore Research Hub',
            href: '/research',
          }}
          className="my-12"
        />
      ) : (
        <div className="space-y-8">
          {/* Mutual Funds Watchlist Section */}
          {fundFavorites.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00D2FF]" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Mutual Funds ({fundFavorites.length})
                  </h2>
                </div>
                <span className="text-[11px] text-[#9B9BB4]">
                  Select up to 3 to compare
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fundFavorites.map((fav) => (
                  <WatchlistFundCard
                    key={fav._id}
                    favorite={fav}
                    isSelected={selectedIds.includes(fav._id)}
                    onToggleSelect={() => toggleSelect(fav._id)}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* NSE Stocks Watchlist Section */}
          {stockFavorites.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#6C63FF]" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    NSE Stocks ({stockFavorites.length})
                  </h2>
                </div>
                <span className="text-[11px] text-[#9B9BB4]">
                  Select up to 3 to compare
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockFavorites.map((fav) => (
                  <WatchlistStockCard
                    key={fav._id}
                    favorite={fav}
                    isSelected={selectedIds.includes(fav._id)}
                    onToggleSelect={() => toggleSelect(fav._id)}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
