import type { ApiResponse } from '@arthora/shared';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl } from './config';

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 15_000;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

/**
 * Automatically retries requests when a remote server is waking from a cold start (502/503/504)
 * while failing fast on localhost or unreachable local connections.
 */
export async function fetchWithColdStartRetry(
  url: string,
  fetchOptions: RequestInit,
  retries = 12,
  delayMs = 2000,
): Promise<Response> {
  const isLocalTarget = url.includes('localhost') || url.includes('127.0.0.1');
  const maxNetworkRetries = isLocalTarget ? 1 : Math.min(retries, 3);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  const signal = fetchOptions.signal ?? controller.signal;

  if (!fetchOptions.signal) {
    timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  }

  try {
    const res = await fetch(url, { ...fetchOptions, signal });
    if (timer) clearTimeout(timer);

    if ((res.status === 502 || res.status === 503 || res.status === 504) && retries > 0) {
      console.warn(`[Arthora API] Server waking up (${res.status}), retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWithColdStartRetry(url, fetchOptions, retries - 1, Math.min(delayMs * 1.3, 4000));
    }
    return res;
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (maxNetworkRetries > 0 && retries > 0) {
      console.warn(`[Arthora API] Connection pending, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWithColdStartRetry(
        url,
        fetchOptions,
        Math.min(retries - 1, maxNetworkRetries - 1),
        Math.min(delayMs * 1.3, 3000),
      );
    }
    throw err;
  }
}

/**
 * Fires a non-blocking background probe to pre-warm the backend.
 */
export function prewarmServer(): void {
  if (typeof window !== 'undefined') {
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/v1/health`, { method: 'GET', keepalive: true }).catch(() => {});
  }
}

/**
 * Core HTTP client with automatic authentication, header injection, and single-flight token refresh.
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

  const response = await fetchWithColdStartRetry(url, {
    ...fetchOptions,
    headers: reqHeaders,
  });

  // Handle 401 Unauthorized - Attempt shared single-flight token refresh
  if (response.status === 401 && !isRetry && !skipAuth) {
    const refreshed = await useAuthStore.getState().refreshSession();
    const newToken = useAuthStore.getState().accessToken;

    if (refreshed && newToken) {
      return request<T>(
        endpoint,
        {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        },
        true,
      );
    }

    if (useAuthStore.getState().lastAuthError === 'expired') {
      void useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error('Authentication expired. Please log in again.');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new Error(`HTTP Error ${response.status}: Unable to parse server response`);
  }

  if (!response.ok || !data.success) {
    const errorMsg =
      data.error?.message ||
      data.message ||
      `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; status?: number; details?: unknown };
    err.code = data.error?.code;
    err.status = response.status;
    err.details = data.error?.details;
    throw err;
  }

  return data.data as T;
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

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
