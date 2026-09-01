import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IFundMetadata, IStockMetadata, PaginatedData } from '@arthora/shared';

export interface FundSearchResult extends IFundMetadata {
  latestNAV?: number;
  latestNAVDate?: Date;
}

export interface StockSearchResult extends IStockMetadata {
  currentPrice?: number;
}

interface SearchStoreState {
  query: string;
  fundResults: FundSearchResult[];
  stockResults: StockSearchResult[];
  isLoading: boolean;
  recentSearches: string[];

  setQuery: (q: string) => void;
  search: (q: string, type?: 'funds' | 'stocks' | 'all') => Promise<void>;
  clearResults: () => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      query: '',
      fundResults: [],
      stockResults: [],
      isLoading: false,
      recentSearches: [],

      setQuery: (query: string) => {
        set({ query });
      },

      search: async (query: string, type: 'funds' | 'stocks' | 'all' = 'all') => {
        if (!query || query.trim().length === 0) {
          set({ fundResults: [], stockResults: [], isLoading: false });
          return;
        }

        set({ isLoading: true });
        const trimmed = query.trim();

        try {
          const fetchFunds = type === 'all' || type === 'funds'
            ? api.get<PaginatedData<FundSearchResult>>(API_ENDPOINTS.FUNDS.SEARCH, { params: { q: trimmed, limit: 4 } })
            : Promise.resolve({ items: [] as FundSearchResult[] });

          const fetchStocks = type === 'all' || type === 'stocks'
            ? api.get<PaginatedData<StockSearchResult>>(API_ENDPOINTS.STOCKS.SEARCH, { params: { q: trimmed, limit: 4 } })
            : Promise.resolve({ items: [] as StockSearchResult[] });

          const [fundsRes, stocksRes] = await Promise.allSettled([fetchFunds, fetchStocks]);

          const fundItems = fundsRes.status === 'fulfilled' ? fundsRes.value.items || [] : [];
          const stockItems = stocksRes.status === 'fulfilled' ? stocksRes.value.items || [] : [];

          set({
            fundResults: fundItems,
            stockResults: stockItems,
            isLoading: false,
          });

          get().addRecentSearch(trimmed);
        } catch (error) {
          console.error('Search failed:', error);
          set({ isLoading: false });
        }
      },

      clearResults: () => {
        set({ query: '', fundResults: [], stockResults: [], isLoading: false });
      },

      addRecentSearch: (searchQuery: string) => {
        const clean = searchQuery.trim();
        if (!clean) return;

        set((state) => {
          const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
          return {
            recentSearches: [clean, ...filtered].slice(0, 8),
          };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: 'arthora-recent-searches',
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
