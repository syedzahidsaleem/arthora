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

  // Initialize session once on mount without re-running on every auth state change
  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Listen to external Firebase Auth changes (e.g. sign-out in another tab)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const state = useAuthStore.getState();
      if (!firebaseUser && state.isAuthenticated && state.user?.authProvider === 'google') {
        void state.logout();
      }
    });

    return () => unsubscribe();
  }, []);

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
