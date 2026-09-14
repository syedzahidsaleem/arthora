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
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#121218] border-b-2 border-black select-none">
      <Link href="/ai" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-neo-yellow border-2 border-black flex items-center justify-center text-black shadow-neo-sm">
          <Sparkles className="w-3.5 h-3.5 fill-black" />
        </div>
        <span className="font-black text-base text-white uppercase tracking-tight">
          Arthora<span className="text-neo-yellow font-mono text-xs ml-0.5">.IN</span>
        </span>
      </Link>

      <span className="font-mono font-black text-xs uppercase px-2 py-0.5 bg-neo-cyan text-black border border-black rounded shadow-[1px_1px_0px_0px_#000]">
        {getTitle()}
      </span>

      <div className="flex items-center gap-1">
        <SearchInput isMobileTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
}
