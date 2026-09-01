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
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  const navItems = [
    { label: 'AI Portfolio', href: '/ai', icon: Sparkles },
    { label: 'Research', href: '/research', icon: Search },
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
    : 'U';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-[#13141F] border-r border-white/5 transition-all duration-300 select-none',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Top Brand Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link href="/ai" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#6C63FF]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white leading-none">
                Arthora<span className="text-[#00D2FF]">.</span>
              </span>
              <span className="text-[10px] text-[#9B9BB4] font-medium tracking-wider uppercase">
                India
              </span>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="p-1 rounded-lg text-[#9B9BB4] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Global Search Button */}
      <div className="p-3 border-b border-white/5">
        {isCollapsed ? (
          <SearchInput isMobileTrigger triggerClassName="w-full flex justify-center p-2" />
        ) : (
          <SearchInput />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        <Tooltip.Provider delayDuration={100}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            if (isCollapsed) {
              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'w-full flex items-center justify-center p-2.5 rounded-xl transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 text-white shadow-sm'
                          : 'text-[#9B9BB4] hover:text-white hover:bg-white/5',
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-[#00D2FF]')} />
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-[#1A1B2E] border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl z-50 ml-2"
                    >
                      {item.label}
                      <Tooltip.Arrow className="fill-[#1A1B2E]" />
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 text-white border-l-2 border-[#6C63FF] shadow-sm'
                    : 'text-[#9B9BB4] hover:text-white hover:bg-white/5',
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-[#00D2FF]')} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </Tooltip.Provider>
      </nav>

      {/* Footer User Profile & Theme Toggle */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <div className={cn('flex items-center justify-between', isCollapsed && 'flex-col gap-2')}>
          {/* User Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="User profile menu"
                className={cn(
                  'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-all text-left group',
                  isCollapsed ? 'justify-center w-full' : 'flex-1 min-w-0',
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md">
                  {userInitials}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs font-semibold text-white truncate">
                      {user?.name || 'Investor'}
                    </div>
                    <div className="text-[11px] text-[#9B9BB4] truncate">
                      {user?.email || 'user@arthora.in'}
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
                className="w-56 bg-[#1A1B2E] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 text-xs text-[#F8F9FA] animate-in fade-in-0 zoom-in-95"
              >
                <div className="px-2.5 py-2 border-b border-white/5 mb-1">
                  <div className="font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-[#9B9BB4] truncate">{user?.email}</div>
                </div>

                <DropdownMenu.Item
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/5 outline-none transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#9B9BB4]" />
                  <span>Profile Settings</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/5 my-1" />

                <DropdownMenu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#FF4D6D]/10 text-[#FF4D6D] outline-none transition-colors"
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
                className="p-2 rounded-xl text-[#9B9BB4] hover:text-white hover:bg-white/5 transition-colors"
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
