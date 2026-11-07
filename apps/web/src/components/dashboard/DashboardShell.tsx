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
    <div className="min-h-screen bg-[#FBF7EE] text-[#222A2A] flex flex-col selection:bg-neo-mint selection:text-black">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Dynamic Workspace Area */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 pb-20 md:pb-8 min-h-[calc(100vh-3.5rem)] md:min-h-screen flex flex-col justify-between',
          isCollapsed ? 'md:ml-20' : 'md:ml-64',
        )}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>

        {/* Dismissible Regulatory Disclaimer (non-fixed, never overlaps content) */}
        <div className="px-4 md:px-8 pb-4 max-w-7xl mx-auto w-full">
          <DisclaimerBanner />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
