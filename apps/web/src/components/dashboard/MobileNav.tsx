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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#13141F]/95 backdrop-blur-md border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]"
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
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all active:scale-95',
                isActive ? 'text-white' : 'text-[#9B9BB4] hover:text-white',
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-gradient-to-tr from-[#6C63FF]/20 to-[#00D2FF]/20',
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isActive ? 'text-[#00D2FF] stroke-[2.5]' : 'text-[#9B9BB4]',
                  )}
                />
              </div>

              {isActive && (
                <span className="text-[10px] font-semibold bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] bg-clip-text text-transparent mt-0.5">
                  {tab.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
