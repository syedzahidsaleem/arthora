import { useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';

/**
 * Custom hook to fetch and monitor a portfolio's AI generation status.
 */
export function usePortfolio(portfolioId?: string) {
  const {
    currentPortfolio,
    isGenerating,
    isLoading,
    error,
    fetchPortfolioById,
    stopPolling,
  } = usePortfolioStore();

  useEffect(() => {
    if (portfolioId) {
      void fetchPortfolioById(portfolioId);
    }

    return () => {
      stopPolling();
    };
  }, [portfolioId, fetchPortfolioById, stopPolling]);

  return {
    portfolio: currentPortfolio,
    isGenerating,
    isLoading,
    error,
  };
}
