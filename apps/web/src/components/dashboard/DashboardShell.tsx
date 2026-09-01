'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-[#0D0E1A] text-[#F8F9FA] flex flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Dynamic Workspace Area */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 pb-20 md:pb-8 min-h-[calc(100vh-3.5rem)] md:min-h-screen',
          isCollapsed ? 'md:ml-16' : 'md:ml-64',
        )}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Floating Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
