'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { ThemeToggle } from '../common/ThemeToggle';
import { SearchInput } from '../common/SearchInput';
import { ArthoraLogo } from '../common/ArthoraLogo';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  const navItems = [
    { label: 'AI Portfolio', href: '/ai', icon: Sparkles, badge: 'PRO' },
    { label: 'Research Hub', href: '/research', icon: Search, badge: '40K+' },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AZ';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-[#FFFDF7] border-r-2 border-black transition-all duration-300 select-none shadow-[2px_0px_0px_0px_#000]',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Top Brand Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-black bg-[#FBF7EE]">
        <Link href="/ai" className="flex items-center gap-3 overflow-hidden group">
          <ArthoraLogo size={36} />

          {!isCollapsed && (
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-black text-lg tracking-tight text-[#222A2A] uppercase leading-none group-hover:text-black transition-colors font-sans">
                Arthora
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-neo-yellow text-black border border-black rounded shadow-[1px_1px_0px_0px_#000]">
                INDIA
              </span>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg border-2 border-black bg-white text-black hover:bg-neo-yellow shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Global Search Button */}
      <div className="p-3 border-b-2 border-black bg-[#FFFDF7]">
        {isCollapsed ? (
          <SearchInput isMobileTrigger triggerClassName="w-full flex justify-center p-2 rounded-xl bg-white border-2 border-black hover:bg-neo-yellow shadow-[2px_2px_0px_0px_#000]" />
        ) : (
          <SearchInput />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto scrollbar-none">
        <Tooltip.Provider delayDuration={100}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

            if (isCollapsed) {
              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'w-full h-11 flex items-center justify-center rounded-xl transition-all relative group border-2',
                        isActive
                          ? 'bg-neo-mint text-black border-black shadow-[3px_3px_0px_0px_#000]'
                          : 'text-[#525866] hover:text-black hover:bg-[#DDD3FF]/40 border-transparent hover:border-black',
                      )}
                    >
                      <Icon className={cn('w-5 h-5 stroke-[2.5] transition-transform group-hover:scale-110', isActive ? 'text-black' : 'text-[#525866]')} />
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-[#FFFFFF] border-2 border-black text-black font-black text-xs px-3 py-1.5 rounded-lg shadow-neo z-50 ml-2"
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'h-11 flex items-center justify-between px-3.5 rounded-xl text-xs font-black tracking-wide transition-all group relative border-2',
                  isActive
                    ? 'bg-neo-mint text-black border-black shadow-[3px_3px_0px_0px_#000]'
                    : 'text-[#525866] hover:text-black hover:bg-[#DDD3FF]/40 border-transparent hover:border-black',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-black' : 'text-[#525866] group-hover:text-black',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border',
                      isActive
                        ? 'bg-black text-neo-mint border-black shadow-none'
                        : 'bg-[#DDD3FF] text-[#222A2A] border-black group-hover:bg-black group-hover:text-white',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </Tooltip.Provider>
      </nav>

      {/* Financial Market Quick Pulse Widget */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-neo-lilac border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5 text-xs text-[#222A2A]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-black font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>NSE NIFTY 50</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-black bg-neo-mint border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#000]">
              +0.42%
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-sm font-black text-black">24,850.40</span>
            <span className="text-[10px] font-bold text-[#525866]">IST Live</span>
          </div>
        </div>
      )}

      {/* Footer User Profile & Settings */}
      <div className="p-3 border-t-2 border-black space-y-2 bg-[#FBF7EE]">
        <div className={cn('flex items-center justify-between', isCollapsed && 'flex-col gap-2')}>
          {/* User Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="User profile menu"
                className={cn(
                  'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white transition-all text-left group border-2 border-transparent hover:border-black hover:shadow-neo-sm',
                  isCollapsed ? 'justify-center w-full' : 'flex-1 min-w-0',
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shrink-0 shadow-[1px_1px_0px_0px_#000]">
                  {userInitials}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs font-bold text-[#222A2A] truncate">
                      {user?.name || 'Investor'}
                    </div>
                    <div className="text-[10px] font-mono text-[#525866] truncate">
                      {user?.email || 'investor@arthora.in'}
                    </div>
                  </div>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side={isCollapsed ? 'right' : 'top'}
                align="start"
                sideOffset={8}
                className="w-56 bg-white border-2 border-black rounded-xl p-1.5 shadow-neo-lg z-50 text-xs text-[#222A2A] animate-in fade-in-0 zoom-in-95"
              >
                <div className="px-3 py-2 border-b-2 border-black bg-[#FBF7EE] rounded-t-lg mb-1">
                  <div className="font-black text-black truncate">{user?.name || 'Investor Session'}</div>
                  <div className="text-[11px] font-mono text-[#525866] truncate">{user?.email || 'investor@arthora.in'}</div>
                </div>

                <DropdownMenu.Item
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-neo-lilac hover:text-black outline-none font-bold transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#525866]" />
                  <span>Profile & Security</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-0.5 bg-black my-1" />

                <DropdownMenu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-neo-rust hover:text-white outline-none font-bold transition-colors text-neo-rust"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Theme Toggle / Expand button */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                className="p-1.5 rounded-lg border-2 border-black bg-white text-black hover:bg-neo-yellow shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
