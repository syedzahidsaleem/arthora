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
        'hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-[#0E101B] border-r border-white/10 transition-all duration-300 select-none backdrop-blur-md',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Top Brand Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <Link href="/ai" className="flex items-center gap-3 overflow-hidden group">
          <ArthoraLogo size={36} />

          {!isCollapsed && (
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-black text-lg tracking-tight text-white uppercase leading-none group-hover:text-brand-primary transition-colors font-sans">
                Arthora
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-brand-primary/20 text-[#8B5CF6] border border-brand-primary/30 rounded-md">
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
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[#A0A0B2] hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Global Search Button */}
      <div className="p-3 border-b border-white/5">
        {isCollapsed ? (
          <SearchInput isMobileTrigger triggerClassName="w-full flex justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20" />
        ) : (
          <SearchInput />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-none">
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
                        'w-full h-11 flex items-center justify-center rounded-xl transition-all relative group',
                        isActive
                          ? 'bg-brand-primary/20 text-white border border-brand-primary/40 shadow-[0_0_15px_rgba(108,99,255,0.25)]'
                          : 'text-[#9B9BB4] hover:text-white hover:bg-white/[0.05] border border-transparent',
                      )}
                    >
                      <Icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', isActive ? 'text-brand-primary' : 'text-[#9B9BB4]')} />
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-primary shadow-[0_0_8px_#6C63FF]" />
                      )}
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-[#181A2A] border border-white/15 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-xl z-50 ml-2"
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-[#181A2A]" />
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
                  'h-11 flex items-center justify-between px-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative',
                  isActive
                    ? 'bg-gradient-to-r from-brand-primary/25 to-brand-primary/10 text-white border border-brand-primary/40 shadow-[0_0_18px_rgba(108,99,255,0.2)]'
                    : 'text-[#9B9BB4] hover:text-white hover:bg-white/[0.05] border border-transparent',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-brand-primary' : 'text-[#9B9BB4] group-hover:text-white',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-white/5 text-[#80819A] group-hover:text-white group-hover:bg-white/10',
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-brand-primary shadow-[0_0_8px_#6C63FF]" />
                )}
              </Link>
            );
          })}
        </Tooltip.Provider>
      </nav>

      {/* Financial Market Quick Pulse Widget */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[#121422] border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8B8D9F] uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>NSE NIFTY 50</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              +0.42%
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-sm font-black text-white">24,850.40</span>
            <span className="text-[10px] text-[#8B8D9F]">IST Market Live</span>
          </div>
        </div>
      )}

      {/* Footer User Profile & Theme Toggle */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#0B0D17]/60">
        <div className={cn('flex items-center justify-between', isCollapsed && 'flex-col gap-2')}>
          {/* User Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="User profile menu"
                className={cn(
                  'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.06] transition-all text-left group border border-transparent hover:border-white/10',
                  isCollapsed ? 'justify-center w-full' : 'flex-1 min-w-0',
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0 shadow-sm">
                  {userInitials}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs font-semibold text-white truncate">
                      {user?.name || 'Investor'}
                    </div>
                    <div className="text-[10px] font-mono text-[#8B8D9F] truncate">
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
                className="w-56 bg-[#161828] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 text-xs text-[#F8F9FA] animate-in fade-in-0 zoom-in-95 backdrop-blur-xl"
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white truncate">{user?.name || 'Investor Session'}</div>
                  <div className="text-[11px] font-mono text-[#9B9BB4] truncate">{user?.email || 'investor@arthora.in'}</div>
                </div>

                <DropdownMenu.Item
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-white/10 outline-none transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#9B9BB4]" />
                  <span>Profile & Security</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/10 my-1" />

                <DropdownMenu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-red-500/15 text-red-400 outline-none transition-colors"
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
                className="p-2 rounded-xl text-[#9B9BB4] hover:text-white hover:bg-white/10 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
