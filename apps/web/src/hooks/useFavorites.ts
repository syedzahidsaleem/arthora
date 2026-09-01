import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IFavorite, FavoriteAssetType } from '@arthora/shared';

export interface IFavoriteWithMarketData extends IFavorite {
  latestNAV?: number;
  navChange?: number;
  cagr1Y?: number;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  peRatio?: number;
  marketCap?: number;
  category?: string;
}

export interface AddFavoriteInput {
  assetType: FavoriteAssetType;
  schemeCode?: number;
  symbol?: string;
  isin?: string;
  name: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<IFavoriteWithMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<IFavoriteWithMarketData[]>(API_ENDPOINTS.FAVORITES.LIST);
      setFavorites(Array.isArray(res) ? res : []);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch favorites';
      setError(msg);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(async (payload: AddFavoriteInput) => {
    // Optimistic addition
    const tempId = `temp-${Date.now()}`;
    const optimisticFav: IFavoriteWithMarketData = {
      _id: tempId,
      userId: 'current-user',
      assetType: payload.assetType,
      schemeCode: payload.schemeCode,
      symbol: payload.symbol,
      isin: payload.isin,
      name: payload.name,
      addedAt: new Date(),
    };

    setFavorites((prev) => [optimisticFav, ...prev]);

    try {
      const created = await api.post<IFavoriteWithMarketData>(
        API_ENDPOINTS.FAVORITES.ADD,
        payload,
      );

      // Replace temp item with server response
      setFavorites((prev) =>
        prev.map((f) => (f._id === tempId ? { ...optimisticFav, ...created } : f)),
      );
      toast.success(`${payload.name} added to your watchlist!`);
    } catch {
      // Rollback
      setFavorites((prev) => prev.filter((f) => f._id !== tempId));
      toast.error('Could not add to watchlist. Item may already be saved.');
    }
  }, []);

  const removeFavorite = useCallback(async (id: string) => {
    const itemToRemove = favorites.find((f) => f._id === id);
    if (!itemToRemove) return;

    // Optimistic removal
    setFavorites((prev) => prev.filter((f) => f._id !== id));

    try {
      await api.delete(API_ENDPOINTS.FAVORITES.REMOVE(id));
      toast.info(`${itemToRemove.name} removed from watchlist.`);
    } catch {
      // Rollback
      setFavorites((prev) => [itemToRemove, ...prev]);
      toast.error('Failed to remove item from watchlist.');
    }
  }, [favorites]);

  const isFavorited = useCallback(
    (schemeCode?: number | string, symbol?: string) => {
      return favorites.some((f) => {
        if (schemeCode && f.schemeCode === Number(schemeCode)) return true;
        if (symbol && f.symbol?.toUpperCase() === symbol.toUpperCase()) return true;
        return false;
      });
    },
    [favorites],
  );

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
    refetch: fetchFavorites,
  };
}
