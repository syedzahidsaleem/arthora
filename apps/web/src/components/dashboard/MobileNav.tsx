'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Search, Bookmark, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'AI', href: '/ai', icon: Sparkles },
    { label: 'Research', href: '/research', icon: Search },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
    { label: 'Settings', href: '/settings', icon: Settings2 },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121218] border-t-2 border-black px-2 pb-[env(safe-area-inset-bottom)] select-none"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-bold transition-all active:scale-95',
                isActive ? 'text-white' : 'text-[#A0A0B2] hover:text-white',
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg border-2 transition-all',
                  isActive
                    ? 'bg-neo-yellow text-black border-black shadow-neo-sm'
                    : 'border-transparent text-[#A0A0B2]',
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 stroke-[2.5]',
                    isActive ? 'text-black' : 'text-[#A0A0B2]',
                  )}
                />
              </div>

              <span
                className={cn(
                  'text-[10px] font-mono font-black uppercase tracking-wider mt-0.5',
                  isActive ? 'text-neo-yellow' : 'text-[#A0A0B2]',
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
