import React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, ShieldAlert, ArrowUpRight, Zap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#0D0E15] text-[#F8F9FA] selection:bg-neo-yellow selection:text-black flex-col lg:flex-row">
      {/* Left Branding Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 xl:p-12 bg-[#121218] border-r-[3px] border-black select-none">
        {/* Top Logo */}
        <div className="relative z-10 flex items-center h-11">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neo-yellow border-2 border-black shadow-neo-sm group-hover:shadow-neo group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <Zap className="h-6 w-6 text-black fill-black" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white uppercase font-heading">
                  Arthora
                </span>
                <span className="text-xs font-mono font-black px-1.5 py-0.5 bg-neo-cyan text-black border-2 border-black rounded shadow-[1px_1px_0px_0px_#000]">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] tracking-wider uppercase text-[#A0A0B2] font-mono font-bold">
                Institutional Retail Tech
              </p>
            </div>
          </Link>
        </div>

        {/* Center Tagline & Showcase Visual Cards */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-md border-2 border-black bg-neo-lime px-3 py-1 text-xs font-mono font-black text-black shadow-neo-sm uppercase">
              <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Next-Gen Indian Financial Analytics</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight uppercase font-heading">
              India&apos;s Smartest Investment Research Platform
            </h2>
            <p className="text-[#A0A0B2] text-sm leading-relaxed font-mono">
              Synthesize 40,000+ AMFI mutual funds, deep NSE/BSE fundamental data, and personalized goal-based portfolios with unmatched AI clarity.
            </p>
          </div>

          {/* Floating Metric Cards with Neo-Brutalism */}
          <div className="space-y-3.5">
            {/* Card 1: Projected Corpus */}
            <div className="p-4 rounded-xl bg-[#161620] border-2 border-black shadow-neo flex items-center justify-between hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center text-black shadow-neo-sm shrink-0">
                  <Sparkles className="h-5 w-5 fill-black" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#A0A0B2] uppercase font-bold">Goal: Dream Home (15Y)</p>
                  <p className="text-lg font-black font-mono text-white">₹12,40,000</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-black font-mono text-black bg-neo-lime px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 stroke-[3]" />
                +14.8% CAGR
              </span>
            </div>

            {/* Card 2: Mutual Fund Analysis */}
            <div className="p-4 rounded-xl bg-[#161620] border-2 border-black shadow-neo flex items-center justify-between hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-lg bg-neo-cyan border-2 border-black flex items-center justify-center text-black shadow-neo-sm shrink-0">
                  <TrendingUp className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#A0A0B2] uppercase font-bold">Mirae Asset ELSS Tax Saver</p>
                  <p className="text-xs font-black font-mono text-neo-cyan uppercase">AMFI Category Leader</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-black font-mono text-black bg-neo-cyan px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 stroke-[3]" />
                +18.3% (3Y)
              </span>
            </div>

            {/* Card 3: Stock Benchmark */}
            <div className="p-4 rounded-xl bg-[#161620] border-2 border-black shadow-neo flex items-center justify-between hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-lg bg-neo-pink border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shadow-neo-sm shrink-0">
                  NSE
                </div>
                <div>
                  <p className="text-xs font-mono text-[#A0A0B2] uppercase font-bold">NIFTY 50 Index</p>
                  <p className="text-sm font-black font-mono text-white">24,850.40</p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-black font-mono text-black bg-neo-lime px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 stroke-[3]" />
                +0.42%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 flex items-center space-x-2 text-xs font-mono font-bold text-[#A0A0B2]">
          <ShieldAlert className="h-4 w-4 text-neo-yellow shrink-0" />
          <span>256-BIT ENCRYPTION &middot; FIREBASE AUTH &middot; ZERO ADVISOR BIAS</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-6 sm:p-8 xl:p-12 bg-[#0D0E15]">
        {/* Top Header Row (Maintains symmetrical baseline alignment with left column) */}
        <div className="flex items-center justify-between w-full h-11 mb-4 lg:mb-0">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center space-x-2.5">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neo-yellow border-2 border-black shadow-neo-sm">
                <Zap className="h-4 w-4 text-black fill-black" />
              </div>
              <span className="text-xl font-black text-white uppercase tracking-tight font-heading">
                Arthora <span className="text-neo-yellow">.IN</span>
              </span>
            </Link>
          </div>

          {/* Desktop Back Home Action */}
          <div className="hidden lg:flex items-center justify-end w-full">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg bg-[#161620] border-2 border-black text-xs font-mono font-black uppercase text-white hover:text-neo-yellow shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
            >
              <span>&larr; Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Centered Auth Form Box */}
        <div className="flex flex-1 items-center justify-center my-auto py-4">
          <div className="w-full max-w-md bg-[#161620] p-6 sm:p-8 md:p-9 rounded-2xl border-[3px] border-black shadow-neo-xl">
            {children}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="text-center pt-4 text-[11px] font-mono text-[#8C8CA0] leading-tight">
          <p>Disclaimer: Research and analytics technology platform only. Not SEBI registered investment advice.</p>
          <p className="mt-1">Mutual fund investments are subject to market risks. Read all scheme related documents carefully.</p>
        </div>
      </div>
    </div>
  );
}
