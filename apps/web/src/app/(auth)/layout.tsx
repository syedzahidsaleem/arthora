import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-surface-1">
      {/* Left Branding Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#0D0E1A] via-[#13141F] to-[#1A1B2E] border-r border-surface-4 overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-secondary/20 blur-[100px]" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Arthora <span className="text-brand-secondary">India</span>
              </span>
              <p className="text-[10px] tracking-wider uppercase text-content-muted font-mono font-medium">
                Institutional Retail Tech
              </p>
            </div>
          </Link>
        </div>

        {/* Center Tagline & Floating Visual Cards */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full border border-surface-4 bg-surface-2/60 px-3.5 py-1 text-xs font-medium text-brand-secondary backdrop-blur-md">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Next-Gen Indian Financial Analytics</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-content-primary leading-tight">
              India&apos;s Smartest Investment Research Platform
            </h2>
            <p className="text-content-secondary text-sm leading-relaxed">
              Synthesize 4,000+ AMFI mutual funds, deep NSE/BSE fundamental data, and personalized goal-based portfolios with unmatched AI clarity.
            </p>
          </div>

          {/* Floating Metric Cards with Glassmorphism */}
          <div className="space-y-3.5">
            {/* Card 1: Projected Corpus */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between animate-fadeIn transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-content-secondary">Goal: Dream Home (15Y)</p>
                  <p className="text-lg font-bold font-mono text-content-primary">₹12,40,000</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-semibold font-mono text-feedback-success bg-feedback-success/10 px-2.5 py-1 rounded-lg border border-feedback-success/20">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +14.8% CAGR
              </span>
            </div>

            {/* Card 2: Mutual Fund Analysis */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between animate-fadeIn transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-brand-secondary/15 border border-brand-secondary/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-brand-secondary" />
                </div>
                <div>
                  <p className="text-xs text-content-secondary">Mirae Asset ELSS Tax Saver</p>
                  <p className="text-sm font-semibold text-content-primary">AMFI Category Leader</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-semibold font-mono text-brand-secondary bg-brand-secondary/10 px-2.5 py-1 rounded-lg border border-brand-secondary/20">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ↑ 18.3% (3Y)
              </span>
            </div>

            {/* Card 3: Stock Benchmark */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between animate-fadeIn transition-transform hover:scale-[1.02] duration-300">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-surface-4 border border-surface-4 flex items-center justify-center font-mono font-bold text-xs text-content-primary">
                  NSE
                </div>
                <div>
                  <p className="text-xs text-content-secondary">NIFTY 50 Index</p>
                  <p className="text-sm font-bold font-mono text-content-primary">24,850.40</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-semibold font-mono text-feedback-success bg-feedback-success/10 px-2.5 py-1 rounded-lg border border-feedback-success/20">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ↑ 0.42%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 flex items-center space-x-2 text-xs text-content-muted">
          <ShieldAlert className="h-4 w-4 text-brand-secondary" />
          <span>256-Bit Encrypted Data &middot; Firebase Protected &middot; Zero Spam</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-6 sm:p-12">
        {/* Mobile Header Logo */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Arthora <span className="text-brand-secondary">India</span>
            </span>
          </Link>
        </div>

        {/* Centered Auth Form Box */}
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-md bg-surface-2 p-8 sm:p-10 rounded-3xl border border-surface-4 shadow-2xl">
            {children}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="text-center pt-6 text-[11px] text-content-muted leading-tight">
          <p>Disclaimer: Research and educational platform only. Not SEBI registered investment advice.</p>
          <p className="mt-1">Mutual fund investments are subject to market risks. Read all scheme related documents carefully.</p>
        </div>
      </div>
    </div>
  );
}
