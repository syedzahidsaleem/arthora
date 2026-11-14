'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogIn, WifiOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl } from '../../lib/api/config';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Decodes a JWT payload without external libraries.
 */
function parseJwt(token: string): { exp?: number; sub?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Route protection guard that verifies authentication, coordinates single-flight refresh,
 * and shows actionable recovery if the backend is offline or unreachable.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken, refreshSession, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSlowWait, setIsSlowWait] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Wait for Zustand persist to hydrate from localStorage
  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
      return;
    }

    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });

    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 100);

    return () => {
      if (unsub) unsub();
      clearTimeout(timer);
    };
  }, []);

  const verifySession = useCallback(
    async (isCancelled: () => boolean) => {
      setIsVerifying(true);
      setIsSlowWait(false);
      setBackendError(null);

      const slowTimer = setTimeout(() => {
        if (!isCancelled()) {
          setIsSlowWait(true);
        }
      }, 2500);

      try {
        const store = useAuthStore.getState();
        const currentToken = store.accessToken;
        const isAuth = store.isAuthenticated;

        if (!isAuth || !currentToken) {
          if (!isCancelled()) {
            setIsVerifying(false);
            router.replace('/login');
          }
          return;
        }

        const decoded = parseJwt(currentToken);
        const nowSeconds = Math.floor(Date.now() / 1000);
        const isExpired = Boolean(decoded && decoded.exp && decoded.exp <= nowSeconds);
        const needsProactiveRefresh = Boolean(
          decoded && decoded.exp && decoded.exp - nowSeconds < 300,
        );

        // If token is healthy (> 5 min remaining), allow immediate entry
        if (!needsProactiveRefresh) {
          if (!isCancelled()) {
            setIsVerifying(false);
          }
          return;
        }

        // Attempt single-flight refresh with bounded timeout inside authStore
        const refreshed = await refreshSession();
        if (isCancelled()) return;

        if (refreshed) {
          setIsVerifying(false);
          return;
        }

        // If access token is still valid for a bit and only proactive refresh failed due to network, allow entry
        if (!isExpired) {
          setIsVerifying(false);
          return;
        }

        // Token is expired and refresh failed
        const authErr = useAuthStore.getState().lastAuthError;
        if (authErr === 'network') {
          const apiBase = getApiBaseUrl();
          setBackendError(
            `Could not reach the backend API (${apiBase}) to verify your session. Ensure the backend server is running or retry once it finishes waking up.`,
          );
          setIsVerifying(false);
          return;
        }

        await logout();
        if (!isCancelled()) {
          setIsVerifying(false);
          router.replace('/login');
        }
      } finally {
        clearTimeout(slowTimer);
      }
    },
    [logout, refreshSession, router],
  );

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;
    void verifySession(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, accessToken, retryTick, verifySession]);

  if (isVerifying) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FBF7EE] p-6">
        <div className="flex flex-col items-center space-y-4 text-center max-w-sm">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-black/15 border-t-black" />
          </div>
          <div>
            <p className="text-base font-black uppercase tracking-tight text-black">Arthora</p>
            <p className="text-xs font-mono font-bold text-[#525866] mt-1">
              {isSlowWait
                ? 'Backend server is waking up, please wait a moment...'
                : 'Verifying secure session...'}
            </p>
          </div>
          {isSlowWait && (
            <button
              type="button"
              onClick={() => {
                void logout();
                router.replace('/login');
              }}
              className="text-xs font-mono font-bold underline text-[#525866] hover:text-black"
            >
              Return to Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  if (backendError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FBF7EE] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white border-2 border-black shadow-neo p-6 space-y-4 text-[#222A2A]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neo-yellow border-2 border-black text-xs font-mono font-black uppercase">
            <WifiOff className="w-4 h-4 stroke-[2.5]" />
            <span>Backend Unreachable</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black">
            Unable to verify session
          </h2>
          <p className="text-xs font-mono text-[#525866] leading-relaxed">{backendError}</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRetryTick((t) => t + 1)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neo-mint text-black border-2 border-black shadow-neo-sm font-black text-xs uppercase hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => {
                void logout();
                router.replace('/login');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black border-2 border-black shadow-neo-sm font-bold text-xs uppercase hover:bg-neo-yellow transition-all"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
