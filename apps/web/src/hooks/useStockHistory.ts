import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface StockPriceChartData {
  symbol: string;
  timeframe: string;
  count: number;
  dates: string[];
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

export function useStockHistory(symbol: string, timeframe = '1Y') {
  const [data, setData] = useState<StockPriceChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<StockPriceChartData>(
        API_ENDPOINTS.CHARTS.STOCK_PRICE(symbol),
        { params: { timeframe } },
      );
      setData(res);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch price history';
      setError(msg);
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
