import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface StockTechnicalData {
  symbol: string;
  currentPrice: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  rsi14?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  trend?: 'bullish' | 'bearish' | 'neutral';
  signals?: {
    rsiSignal: 'overbought' | 'oversold' | 'neutral';
    smaSignal: 'bullish' | 'bearish' | 'neutral';
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    overallSignal: 'bullish' | 'bearish' | 'neutral';
  };
  lastUpdated: string | Date;
}

export function useStockTechnical(symbol: string) {
  const [technical, setTechnical] = useState<StockTechnicalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnical = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<StockTechnicalData>(
        API_ENDPOINTS.STOCKS.TECHNICAL(symbol),
      );
      setTechnical(res);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch technical indicators';
      setError(msg);
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    void fetchTechnical();
  }, [fetchTechnical]);

  return {
    technical,
    isLoading,
    error,
    refetch: fetchTechnical,
  };
}
