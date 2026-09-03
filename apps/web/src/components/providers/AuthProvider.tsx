'use client';
 
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { prewarmServer } from '@/lib/api/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();

  useEffect(() => {
    prewarmServer();
  }, []);

  return <>{children}</>;
}
