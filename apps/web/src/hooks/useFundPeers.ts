import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IFundMetadata, IFundMetrics } from '@arthora/shared';

export interface FundPeerItem {
  fund: IFundMetadata;
  metrics: IFundMetrics | null;
}

export function useFundPeers(schemeCode: number | string) {
  const [peers, setPeers] = useState<FundPeerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeers = useCallback(async () => {
    if (!schemeCode) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<FundPeerItem[]>(
        API_ENDPOINTS.FUNDS.PEERS(schemeCode),
      );
      setPeers(Array.isArray(res) ? res : []);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch category peers';
      setError(msg);
      setIsLoading(false);
    }
  }, [schemeCode]);

  useEffect(() => {
    void fetchPeers();
  }, [fetchPeers]);

  return {
    peers,
    isLoading,
    error,
    refetch: fetchPeers,
  };
}
