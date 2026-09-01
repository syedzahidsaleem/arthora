import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface FundNAVChartData {
  schemeCode: number;
  timeframe: string;
  count: number;
  dates: string[];
  navs: number[];
}

export function useFundNAV(schemeCode: number | string, timeframe = '1Y') {
  const [data, setData] = useState<FundNAVChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    if (!schemeCode) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<FundNAVChartData>(
        API_ENDPOINTS.CHARTS.FUND_NAV(schemeCode),
        { params: { timeframe } },
      );
      setData(res);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch NAV history';
      setError(msg);
      setIsLoading(false);
    }
  }, [schemeCode, timeframe]);

  useEffect(() => {
    void fetchChart();
  }, [fetchChart]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchChart,
  };
}
