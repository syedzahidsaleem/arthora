'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArthoraLogo } from '../common/ArthoraLogo';
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
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#FFFDF7] border-b-2 border-black select-none shadow-[0_2px_0_0_#000]">
      <Link href="/ai" className="flex items-center gap-2">
        <ArthoraLogo size={28} />
        <span className="font-black text-base text-[#222A2A] uppercase tracking-tight">
          Arthora<span className="text-[#EC4624] font-mono text-xs ml-0.5">.IN</span>
        </span>
      </Link>

      <span className="font-mono font-black text-xs uppercase px-2 py-0.5 bg-neo-yellow text-black border border-black rounded shadow-[1px_1px_0px_0px_#000]">
        {getTitle()}
      </span>

      <div className="flex items-center gap-1">
        <SearchInput isMobileTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
}
