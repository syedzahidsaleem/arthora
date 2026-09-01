import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IFundMetadata, IFundMetrics } from '@arthora/shared';

export interface FundDetailData extends IFundMetadata {
  latestNAV?: number;
  latestNAVDate?: Date | string;
  previousNAV?: number;
}

export interface FundMetricsResponse extends IFundMetrics {
  status?: string;
  message?: string;
}

export function useFund(schemeCode: number | string) {
  const [fund, setFund] = useState<FundDetailData | null>(null);
  const [metrics, setMetrics] = useState<IFundMetrics | null>(null);
  const [metricsCalculating, setMetricsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await api.get<FundMetricsResponse>(
        API_ENDPOINTS.FUNDS.METRICS(schemeCode),
      );

      if (res?.status === 'calculating') {
        setMetricsCalculating(true);
        // Start polling if not already active
        if (!pollingRef.current) {
          pollingRef.current = setInterval(async () => {
            try {
              const pollRes = await api.get<FundMetricsResponse>(
                API_ENDPOINTS.FUNDS.METRICS(schemeCode),
              );
              if (pollRes && pollRes.status !== 'calculating') {
                setMetrics(pollRes);
                setMetricsCalculating(false);
                clearPolling();
              }
            } catch {
              clearPolling();
              setMetricsCalculating(false);
            }
          }, 5000);
        }
      } else {
        setMetrics(res);
        setMetricsCalculating(false);
        clearPolling();
      }
    } catch {
      // Metrics may not yet be calculated
      setMetricsCalculating(false);
    }
  }, [schemeCode, clearPolling]);

  const fetchData = useCallback(async () => {
    if (!schemeCode) return;
    setIsLoading(true);
    setError(null);
    clearPolling();

    try {
      const [fundRes] = await Promise.all([
        api.get<FundDetailData>(API_ENDPOINTS.FUNDS.DETAIL(schemeCode)),
        fetchMetrics(),
      ]);

      setFund(fundRes);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load mutual fund details';
      setError(msg);
      setIsLoading(false);
    }
  }, [schemeCode, fetchMetrics, clearPolling]);

  useEffect(() => {
    void fetchData();
    return () => {
      clearPolling();
    };
  }, [fetchData, clearPolling]);

  return {
    fund,
    metrics,
    metricsCalculating,
    isLoading,
    error,
    refetch: fetchData,
  };
}
