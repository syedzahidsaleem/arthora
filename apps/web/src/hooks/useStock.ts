import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IStockMetadata, IStockMetrics } from '@arthora/shared';

export interface StockDetailData extends IStockMetadata {
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  volume?: number;
  quoteTime?: string | Date;
}

export function useStock(symbol: string) {
  const [stock, setStock] = useState<StockDetailData | null>(null);
  const [metrics, setMetrics] = useState<IStockMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);

    try {
      const [stockRes, metricsRes] = await Promise.allSettled([
        api.get<StockDetailData>(API_ENDPOINTS.STOCKS.DETAIL(symbol)),
        api.get<IStockMetrics>(API_ENDPOINTS.STOCKS.METRICS(symbol)),
      ]);

      if (stockRes.status === 'fulfilled') {
        setStock(stockRes.value);
      } else {
        throw new Error('Stock not found or unavailable');
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value);
      }

      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load stock details';
      setError(msg);
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    stock,
    metrics,
    isLoading,
    error,
    refetch: fetchData,
  };
}
