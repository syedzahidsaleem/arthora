import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IFundHoldings, IFundSectorAlloc } from '@arthora/shared';

export function useFundHoldings(schemeCode: number | string) {
  const [holdings, setHoldings] = useState<IFundHoldings | null>(null);
  const [sectorAlloc, setSectorAlloc] = useState<IFundSectorAlloc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldingsAndSectors = useCallback(async () => {
    if (!schemeCode) return;
    setIsLoading(true);
    setError(null);

    try {
      const [holdingsRes, sectorsRes] = await Promise.allSettled([
        api.get<IFundHoldings>(API_ENDPOINTS.FUNDS.HOLDINGS(schemeCode)),
        api.get<IFundSectorAlloc>(API_ENDPOINTS.FUNDS.SECTOR_ALLOC(schemeCode)),
      ]);

      if (holdingsRes.status === 'fulfilled') {
        setHoldings(holdingsRes.value);
      }
      if (sectorsRes.status === 'fulfilled') {
        setSectorAlloc(sectorsRes.value);
      }

      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load holdings';
      setError(msg);
      setIsLoading(false);
    }
  }, [schemeCode]);

  useEffect(() => {
    void fetchHoldingsAndSectors();
  }, [fetchHoldingsAndSectors]);

  return {
    holdings,
    sectorAlloc,
    isLoading,
    error,
    refetch: fetchHoldingsAndSectors,
  };
}
