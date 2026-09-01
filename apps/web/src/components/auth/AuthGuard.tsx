'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { API_ENDPOINTS } from '../../lib/api/endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
 * Route protection guard that checks authentication and proactively refreshes expiring tokens.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken, refreshToken, setTokens, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isAuthenticated || !accessToken) {
        setIsVerifying(false);
        router.push('/login');
        return;
      }

      // Check if access token is expiring within 5 minutes (300 seconds)
      const decoded = parseJwt(accessToken);
      const nowSeconds = Math.floor(Date.now() / 1000);

      if (decoded && decoded.exp && decoded.exp - nowSeconds < 300) {
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            const refreshData = await refreshRes.json();
            if (refreshRes.ok && refreshData.success && refreshData.data) {
              setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
              setIsVerifying(false);
              return;
            }
          } catch {
            // If proactive refresh fails, proceed with current token or redirect
          }
        }
      }

      // If token is already fully expired and could not refresh
      if (decoded && decoded.exp && decoded.exp <= nowSeconds) {
        logout();
        router.push('/login');
        return;
      }

      setIsVerifying(false);
    }

    checkAuth();
  }, [isAuthenticated, accessToken, refreshToken, setTokens, logout, router]);

  if (isVerifying) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-surface-1">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-brand-primary/20" />
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-primary border-t-transparent shadow-lg shadow-brand-primary/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-content-primary">Arthora</p>
            <p className="text-xs text-content-secondary mt-1">Verifying secure session...</p>
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
