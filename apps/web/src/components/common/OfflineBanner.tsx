'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 w-full bg-[#FF4D6D] text-white border-b-2 border-black py-2 px-4 flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase tracking-wider shadow-neo-sm"
    >
      <WifiOff className="w-4 h-4 stroke-[2.5]" />
      <span>Offline Mode — Live AMFI and NSE market quotes may be cached or delayed</span>
    </div>
  );
}
