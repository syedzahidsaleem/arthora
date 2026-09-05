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

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE_URL = RAW_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

export interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  updateUser: (user: Partial<IUser>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
      },

      initialize: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          // Verify current access token by fetching /me
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const result: ApiResponse<IUser> = await response.json();
            if (result.success && result.data) {
              set({ user: result.data, isAuthenticated: true, isLoading: false });
              return;
            }
          }

          // If /me failed, try refreshing using refreshToken
          if (refreshToken) {
            const refreshRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data) {
                const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
                set({ accessToken: newAccess, refreshToken: newRefresh });

                // Retry fetching /me with new access token
                const meRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
                  headers: { Authorization: `Bearer ${newAccess}` },
                });
                if (meRes.ok) {
                  const meData: ApiResponse<IUser> = await meRes.json();
                  if (meData.success && meData.data) {
                    set({ user: meData.data, isAuthenticated: true, isLoading: false });
                    return;
                  }
                }
              }
            }
          }

          // Invalidation fallback
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize session:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetchWithColdStartRetry(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || 'Invalid email or password');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
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

          const response = await fetchWithColdStartRetry(`${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || 'Google authentication failed');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetchWithColdStartRetry(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message || 'Registration failed');
          }

          const { user, accessToken, refreshToken } = result.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { accessToken, refreshToken } = get();
        try {
          if (accessToken) {
            await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ refreshToken }),
            });
          }
          await firebaseSignOut(auth);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
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
