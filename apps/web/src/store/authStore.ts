import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUser, ApiResponse } from '@arthora/shared';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signOut as firebaseSignOut,
  auth,
} from '../lib/firebase';
import { API_ENDPOINTS } from '../lib/api/endpoints';
import { fetchWithColdStartRetry } from '../lib/api/client';
import { getApiBaseUrl } from '../lib/api/config';

const AUTH_REQUEST_TIMEOUT_MS = 8000;

let activeRefreshPromise: Promise<boolean> | null = null;
let activeInitPromise: Promise<void> | null = null;

function parseJwtExp(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(
      decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    ) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastAuthError: 'expired' | 'network' | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  updateUser: (user: Partial<IUser>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshSession: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      lastAuthError: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user && !!get().accessToken });
      },

      updateUser: (partialUser) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...partialUser } });
        }
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
          lastAuthError: null,
        });
      },

      refreshSession: async () => {
        if (activeRefreshPromise) {
          return activeRefreshPromise;
        }

        const runRefresh = async (): Promise<boolean> => {
          const { refreshToken } = get();
          if (!refreshToken) {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              lastAuthError: 'expired',
            });
            return false;
          }

          try {
            const baseUrl = getApiBaseUrl();
            const refreshRes = await fetchWithTimeout(`${baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.status === 401 || refreshRes.status === 403) {
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                lastAuthError: 'expired',
              });
              return false;
            }

            if (!refreshRes.ok) {
              set({ lastAuthError: 'network' });
              return false;
            }

            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              set({
                accessToken: refreshData.data.accessToken,
                refreshToken: refreshData.data.refreshToken ?? refreshToken,
                isAuthenticated: true,
                lastAuthError: null,
              });
              return true;
            }

            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              lastAuthError: 'expired',
            });
            return false;
          } catch {
            set({ lastAuthError: 'network' });
            return false;
          }
        };

        activeRefreshPromise = runRefresh().finally(() => {
          activeRefreshPromise = null;
        });

        return activeRefreshPromise;
      },

      initialize: async () => {
        if (activeInitPromise) {
          return activeInitPromise;
        }

        const runInit = async () => {
          const { accessToken } = get();
          if (!accessToken) {
            set({ isLoading: false, isAuthenticated: false, user: null, lastAuthError: null });
            return;
          }

          set({ isLoading: true });
          const baseUrl = getApiBaseUrl();
          const exp = typeof window !== 'undefined' ? parseJwtExp(accessToken) : null;
          const nowSeconds = Math.floor(Date.now() / 1000);

          try {
            // If access token is already expired or nearly expired, refresh via single-flight lock first
            if (exp !== null && exp - nowSeconds <= 60) {
              const refreshed = await get().refreshSession();
              if (!refreshed) {
                set({ isLoading: false });
                return;
              }
            }

            const activeToken = get().accessToken;
            if (!activeToken) {
              set({ isLoading: false });
              return;
            }

            const response = await fetchWithTimeout(`${baseUrl}${API_ENDPOINTS.AUTH.ME}`, {
              headers: {
                Authorization: `Bearer ${activeToken}`,
              },
            });

            if (response.ok) {
              const result: ApiResponse<IUser> = await response.json();
              if (result.success && result.data) {
                set({
                  user: result.data,
                  isAuthenticated: true,
                  isLoading: false,
                  lastAuthError: null,
                });
                return;
              }
            }

            if (response.status === 401) {
              const refreshed = await get().refreshSession();
              if (refreshed) {
                const newToken = get().accessToken;
                if (newToken) {
                  const meRes = await fetchWithTimeout(`${baseUrl}${API_ENDPOINTS.AUTH.ME}`, {
                    headers: { Authorization: `Bearer ${newToken}` },
                  });
                  if (meRes.ok) {
                    const meData: ApiResponse<IUser> = await meRes.json();
                    if (meData.success && meData.data) {
                      set({
                        user: meData.data,
                        isAuthenticated: true,
                        isLoading: false,
                        lastAuthError: null,
                      });
                      return;
                    }
                  }
                }
              }
              set({ isLoading: false });
              return;
            }

            set({ isLoading: false });
          } catch (error) {
            console.warn('⚠️ [AuthStore] Session initialization deferred due to network issue:', error);
            set({ isLoading: false, lastAuthError: 'network' });
          }
        };

        activeInitPromise = runInit().finally(() => {
          activeInitPromise = null;
        });

        return activeInitPromise;
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, lastAuthError: null });
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetchWithColdStartRetry(`${baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || result.message || 'Invalid email or password');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            lastAuthError: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogleToken: async (idToken: string) => {
        set({ isLoading: true, lastAuthError: null });
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetchWithColdStartRetry(`${baseUrl}${API_ENDPOINTS.AUTH.GOOGLE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || result.message || 'Google authentication failed');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            lastAuthError: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { idToken } = await firebaseGoogleSignIn();
          await get().loginWithGoogleToken(idToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, lastAuthError: null });
        try {
          const baseUrl = getApiBaseUrl();
          const response = await fetchWithColdStartRetry(`${baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || result.message || 'Registration failed');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            lastAuthError: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { accessToken, refreshToken } = get();
        // Immediately clear local state so UI redirects promptly even if backend is unreachable
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          lastAuthError: null,
        });

        try {
          if (accessToken) {
            const baseUrl = getApiBaseUrl();
            await fetchWithTimeout(
              `${baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ refreshToken }),
              },
              2500,
            );
          }
          await firebaseSignOut(auth);
        } catch (error) {
          console.warn('Logout network cleanup skipped:', error);
        }
      },
    }),
    {
      name: 'arthora-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.accessToken) {
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
