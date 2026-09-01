'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { onAuthStateChanged, auth } from '../lib/firebase';

/**
 * Custom React hook for accessing authentication state and lifecycle actions.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize session verification on mount
    initialize();

    // Listen to external Firebase Auth changes (e.g. sign-out in another tab)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && isAuthenticated && user?.authProvider === 'google') {
        // If Google user signed out of Firebase, synchronize local store
        logout();
      }
    });

    return () => unsubscribe();
  }, [initialize, isAuthenticated, user?.authProvider, logout]);

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    initialize,
  };
}

export default useAuth;
