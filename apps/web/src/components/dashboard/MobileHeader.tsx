'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { SearchInput } from '../common/SearchInput';
import { ThemeToggle } from '../common/ThemeToggle';

export function MobileHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname?.startsWith('/ai')) return 'AI Portfolio';
    if (pathname?.startsWith('/research')) return 'Research';
    if (pathname?.startsWith('/watchlist')) return 'Watchlist';
    if (pathname?.startsWith('/settings')) return 'Settings';
    return 'Arthora';
  };

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#13141F]/80 backdrop-blur-md border-b border-white/5">
      <Link href="/ai" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-sm text-white">
          Arthora<span className="text-[#00D2FF]">.</span>
        </span>
      </Link>

      <span className="font-semibold text-xs text-[#F8F9FA] tracking-wide">
        {getTitle()}
      </span>

      <div className="flex items-center gap-1">
        <SearchInput isMobileTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
}
