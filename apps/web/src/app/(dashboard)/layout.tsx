import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export const metadata: Metadata = {
  title: 'Investor Hub | Arthora',
  description: 'Institutional AI investment analytics, AMFI mutual funds, and NSE/BSE quant research.',
  openGraph: {
    title: 'Arthora Investor Hub',
    description: 'Institutional-grade investment intelligence for Indian retail investors.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arthora Investor Hub',
    description: 'Institutional-grade investment intelligence for Indian retail investors.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
