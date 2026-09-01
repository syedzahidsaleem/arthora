import type { ApiResponse } from '@arthora/shared';
import { useAuthStore } from '../../store/authStore';
import { API_ENDPOINTS } from './endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Core HTTP client with automatic authentication, header injection, and token refresh.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  const store = useAuthStore.getState();
  if (!skipAuth && store.accessToken) {
    reqHeaders['Authorization'] = `Bearer ${store.accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: reqHeaders,
  });

  // Handle 401 Unauthorized - Attempt Token Refresh
  if (response.status === 401 && !isRetry && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success && refreshData.data) {
          const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
          useAuthStore.getState().setTokens(newAccess, newRefresh);
          isRefreshing = false;
          onRefreshed(newAccess);
        } else {
          throw new Error('Refresh token invalid');
        }
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    // Wait for the in-flight refresh to complete, then retry
    return new Promise<T>((resolve, reject) => {
      subscribeTokenRefresh((newToken: string) => {
        const retryOptions = {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        request<T>(endpoint, retryOptions, true).then(resolve).catch(reject);
      });
    });
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || json.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as Error & { code?: string; status?: number }).code = json.error?.code;
    (error as Error & { code?: string; status?: number }).status = response.status;
    throw error;
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
