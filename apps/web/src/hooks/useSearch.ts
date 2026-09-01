import { useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from './useDebounce';

/**
 * Custom search hook with 300ms debounce.
 */
export function useSearch(initialQuery = '', type: 'funds' | 'stocks' | 'all' = 'all') {
  const {
    query,
    fundResults,
    stockResults,
    isLoading,
    recentSearches,
    setQuery,
    search,
    clearResults,
  } = useSearchStore();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (initialQuery && !query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      void search(debouncedQuery, type);
    } else {
      clearResults();
    }
  }, [debouncedQuery, type, search, clearResults]);

  return {
    query,
    debouncedQuery,
    fundResults,
    stockResults,
    isLoading,
    recentSearches,
    setQuery,
    clearResults,
  };
}
