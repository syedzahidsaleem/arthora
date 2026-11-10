import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const storage = vi.hoisted(() => {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, val: string) => map.set(key, val),
      removeItem: (key: string) => map.delete(key),
      clear: () => map.clear(),
    },
    configurable: true,
  });
  return map;
});

vi.mock('../lib/firebase', () => ({
  auth: {},
  signInWithGoogle: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn(() => () => {}),
}));

import { useAuthStore } from '../store/authStore';

describe('useAuthStore resilience', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    storage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      lastAuthError: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('deduplicates concurrent refreshSession calls with a single-flight lock', async () => {
    useAuthStore.setState({
      accessToken: 'old_access',
      refreshToken: 'refresh_123',
      isAuthenticated: true,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { accessToken: 'new_access', refreshToken: 'new_refresh' },
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const [r1, r2, r3] = await Promise.all([
      useAuthStore.getState().refreshSession(),
      useAuthStore.getState().refreshSession(),
      useAuthStore.getState().refreshSession(),
    ]);

    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(r3).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('new_access');
    expect(useAuthStore.getState().refreshToken).toBe('new_refresh');
  });

  it('marks lastAuthError as expired and clears tokens on 401 refresh rejection', async () => {
    useAuthStore.setState({
      accessToken: 'old_access',
      refreshToken: 'revoked_refresh',
      isAuthenticated: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false }),
    }) as unknown as typeof fetch;

    const ok = await useAuthStore.getState().refreshSession();
    expect(ok).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().lastAuthError).toBe('expired');
  });

  it('marks lastAuthError as network on fetch failure without wiping refreshToken', async () => {
    useAuthStore.setState({
      accessToken: 'old_access',
      refreshToken: 'valid_refresh',
      isAuthenticated: true,
    });

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch')) as unknown as typeof fetch;

    const ok = await useAuthStore.getState().refreshSession();
    expect(ok).toBe(false);
    expect(useAuthStore.getState().lastAuthError).toBe('network');
    expect(useAuthStore.getState().refreshToken).toBe('valid_refresh');
  });

  it('clears local auth state immediately during logout even if backend request hangs or fails', async () => {
    vi.useFakeTimers();
    useAuthStore.setState({
      user: { _id: 'u1', name: 'Investor', email: 'inv@example.com' } as never,
      accessToken: 'tok_1',
      refreshToken: 'ref_1',
      isAuthenticated: true,
    });

    globalThis.fetch = vi.fn((_url, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      });
    }) as unknown as typeof fetch;

    const logoutPromise = useAuthStore.getState().logout();
    // Synchronous local state clear happens before network response
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();

    await vi.advanceTimersByTimeAsync(3000);
    await logoutPromise;
  });
});
