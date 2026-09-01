import { create } from 'zustand';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { IPortfolio, CreatePortfolioInput, PaginatedData } from '@arthora/shared';

interface PortfolioStatusResponse {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  portfolio: IPortfolio | null;
}

interface CreatePortfolioResponse {
  portfolioId: string;
  status: string;
  pollUrl: string;
}

interface PortfolioStoreState {
  portfolios: IPortfolio[];
  currentPortfolio: IPortfolio | null;
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
  pollingIntervalId: ReturnType<typeof setInterval> | null;

  createPortfolio: (input: CreatePortfolioInput) => Promise<string>;
  pollPortfolioStatus: (portfolioId: string) => void;
  stopPolling: () => void;
  fetchPortfolios: () => Promise<void>;
  fetchPortfolioById: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setCurrentPortfolio: (p: IPortfolio | null) => void;
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  isGenerating: false,
  isLoading: false,
  error: null,
  pollingIntervalId: null,

  createPortfolio: async (input: CreatePortfolioInput): Promise<string> => {
    set({ isGenerating: true, error: null });
    try {
      const res = await api.post<CreatePortfolioResponse>(
        API_ENDPOINTS.PORTFOLIOS.CREATE,
        input,
      );

      return res.portfolioId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create portfolio';
      set({ isGenerating: false, error: msg });
      throw err;
    }
  },

  pollPortfolioStatus: (portfolioId: string) => {
    get().stopPolling();
    set({ isGenerating: true, error: null });

    const checkStatus = async () => {
      try {
        const res = await api.get<PortfolioStatusResponse>(
          API_ENDPOINTS.PORTFOLIOS.STATUS(portfolioId),
        );

        const status = res.status;
        if (status === 'completed' && res.portfolio) {
          get().stopPolling();
          set((state) => ({
            isGenerating: false,
            currentPortfolio: res.portfolio,
            portfolios: [
              res.portfolio!,
              ...state.portfolios.filter((p) => p._id !== portfolioId),
            ],
          }));
        } else if (status === 'failed') {
          get().stopPolling();
          set({
            isGenerating: false,
            error: 'AI portfolio generation encountered an error. Please try again.',
          });
        }
      } catch {
        get().stopPolling();
        set({ isGenerating: false, error: 'Network error while checking status' });
      }
    };

    // Immediate check + interval every 2000ms
    void checkStatus();
    const intervalId = setInterval(checkStatus, 2000);
    set({ pollingIntervalId: intervalId });
  },

  stopPolling: () => {
    const currentId = get().pollingIntervalId;
    if (currentId) {
      clearInterval(currentId);
      set({ pollingIntervalId: null });
    }
  },

  fetchPortfolios: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<PaginatedData<IPortfolio>>(
        API_ENDPOINTS.PORTFOLIOS.LIST,
      );
      set({ portfolios: res.items || [], isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load portfolios';
      set({ isLoading: false, error: msg });
    }
  },

  fetchPortfolioById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<IPortfolio>(API_ENDPOINTS.PORTFOLIOS.DETAIL(id));
      set({ currentPortfolio: res, isLoading: false });

      if (
        res.aiSuggestion?.status === 'pending' ||
        res.aiSuggestion?.status === 'generating'
      ) {
        get().pollPortfolioStatus(id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load portfolio';
      set({ isLoading: false, error: msg });
    }
  },

  togglePin: async (id: string) => {
    try {
      const res = await api.patch<{ isPinned: boolean }>(
        API_ENDPOINTS.PORTFOLIOS.PIN(id),
      );

      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p._id === id ? { ...p, isPinned: res.isPinned } : p,
        ),
        currentPortfolio:
          state.currentPortfolio?._id === id
            ? { ...state.currentPortfolio, isPinned: res.isPinned }
            : state.currentPortfolio,
      }));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  },

  deletePortfolio: async (id: string) => {
    try {
      await api.delete(API_ENDPOINTS.PORTFOLIOS.DELETE(id));
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p._id !== id),
        currentPortfolio:
          state.currentPortfolio?._id === id ? null : state.currentPortfolio,
      }));
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
      throw err;
    }
  },

  setCurrentPortfolio: (p: IPortfolio | null) => {
    set({ currentPortfolio: p });
  },
}));
