'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/ai');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#0D0E15] text-[#F8F9FA] flex flex-col selection:bg-neo-yellow selection:text-black">
      {/* Ticker Banner at Top */}
      <div className="w-full bg-neo-yellow text-black border-b-2 border-black py-2 overflow-hidden flex items-center font-mono font-black text-xs uppercase tracking-widest select-none">
        <div className="marquee-container animate-marquee whitespace-nowrap flex items-center gap-8">
          <div className="marquee-content flex items-center gap-8">
            <span>★ 40,000+ AMFI MUTUAL FUNDS</span>
            <span>★ NSE & BSE LIVE QUOTES</span>
            <span>★ 10,000 MONTE CARLO ITERATIONS</span>
            <span>★ ZERO COMMISSIONS & FEES</span>
            <span>★ INSTITUTIONAL QUANT METRICS</span>
            <span>★ SEBI-REGISTERED SCHEMES</span>
            <span>★ POWERED BY GEMINI 1.5 FLASH</span>
          </div>
          <div className="marquee-content flex items-center gap-8" aria-hidden="true">
            <span>★ 40,000+ AMFI MUTUAL FUNDS</span>
            <span>★ NSE & BSE LIVE QUOTES</span>
            <span>★ 10,000 MONTE CARLO ITERATIONS</span>
            <span>★ ZERO COMMISSIONS & FEES</span>
            <span>★ INSTITUTIONAL QUANT METRICS</span>
            <span>★ SEBI-REGISTERED SCHEMES</span>
            <span>★ POWERED BY GEMINI 1.5 FLASH</span>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#121218]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center shadow-neo-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-neo transition-all">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-2xl text-white tracking-tight uppercase">
                Arthora
              </span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-neo-cyan text-black border border-black rounded shadow-[1px_1px_0px_0px_#000]">
                .IN
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white border-2 border-black bg-[#1A1A24] px-4 py-2 rounded-lg shadow-neo-sm hover:bg-[#252533] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-black bg-neo-yellow px-5 py-2.5 rounded-lg border-2 border-black shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg hover:bg-[#FFE570] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Stickers row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-neo-cyan text-black border-2 border-black font-mono font-black text-xs uppercase shadow-neo-sm rotate-[-1.5deg] hover:rotate-0 transition-transform">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Gemini 1.5 Flash AI</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-neo-pink text-black border-2 border-black font-mono font-black text-xs uppercase shadow-neo-sm rotate-[1.5deg] hover:rotate-0 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SEBI Mutual Fund Data</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-neo-lime text-black border-2 border-black font-mono font-black text-xs uppercase shadow-neo-sm rotate-[-1deg] hover:rotate-0 transition-transform">
              <Percent className="w-3.5 h-3.5" />
              <span>100% Free For Retail</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6 uppercase">
            Your AI Investment Advisor For{' '}
            <span className="inline-block bg-neo-yellow text-black px-4 py-1 rounded-lg border-[3px] border-black shadow-neo-lg rotate-[-1.5deg] hover:rotate-0 transition-transform">
              India
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#A0A0B2] max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Research 40,000+ mutual funds, build AI goal portfolios, and analyze NSE & BSE stocks with institutional quant metrics — completely free.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl font-black text-lg uppercase tracking-wider text-black bg-neo-yellow border-[3px] border-black shadow-neo-lg hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-xl hover:bg-[#FFE570] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span>Build Portfolio Now</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 rounded-xl font-bold text-lg uppercase tracking-wider text-white bg-[#1A1A24] border-[3px] border-black shadow-neo-lg hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-xl hover:bg-[#252533] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Explore Research
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold text-[#A0A0B2] flex-wrap mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16161E] border-2 border-black rounded-md shadow-neo-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-neo-lime" /> No Credit Card Required
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16161E] border-2 border-black rounded-md shadow-neo-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-neo-lime" /> Live AMFI & NSE Feeds
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16161E] border-2 border-black rounded-md shadow-neo-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-neo-lime" /> Direct Schemes Only
            </span>
          </div>

          {/* Floating UI Showcase */}
          <div className="relative max-w-4xl mx-auto">
            <div className="p-4 md:p-6 rounded-2xl bg-[#16161E] border-[3px] border-black shadow-neo-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-[#1F202B] border-2 border-black shadow-neo-sm hover:shadow-neo transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#A0A0B2] uppercase font-mono">Parag Parikh Flexi Cap</span>
                  <span className="px-2 py-0.5 rounded bg-neo-lime text-black border border-black font-mono text-[11px] font-black shadow-[1px_1px_0px_0px_#000]">
                    +22.4%
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-white mb-1">₹82.45</div>
                <div className="text-[11px] font-mono text-neo-yellow font-bold">Sharpe 1.42 • Alpha +5.2%</div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-neo-yellow text-black border-2 border-black shadow-neo hover:shadow-neo-lg transition-all sm:scale-105 z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-black" /> AI Target Corpus
                  </span>
                  <span className="text-[11px] font-mono font-black px-1.5 py-0.5 bg-black text-white rounded">15 YRS</span>
                </div>
                <div className="text-2xl font-mono font-black mb-1">₹1.48 Cr</div>
                <div className="text-[11px] font-mono font-black uppercase">10,000 Monte Carlo Iterations</div>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-[#1F202B] border-2 border-black shadow-neo-sm hover:shadow-neo transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#A0A0B2] uppercase font-mono">RELIANCE (NSE)</span>
                  <span className="px-2 py-0.5 rounded bg-neo-cyan text-black border border-black font-mono text-[11px] font-black shadow-[1px_1px_0px_0px_#000]">
                    Bullish
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-white mb-1">₹2,985.50</div>
                <div className="text-[11px] font-mono text-neo-lime font-bold">RSI 58.4 • 50SMA Bull Cross</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-[#121218] border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-md bg-neo-pink text-black border-2 border-black font-mono font-black text-xs uppercase shadow-neo-sm mb-4">
              Institutional Edge
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-4">
              Everything You Need To Invest With Confidence
            </h2>
            <p className="text-[#A0A0B2] text-base font-medium">
              Built specifically for Indian retail investors who want professional-grade research without paying expensive advisor fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-xl bg-[#181822] border-[3px] border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-lg bg-neo-pink border-2 border-black flex items-center justify-center text-black mb-6 shadow-neo-sm group-hover:rotate-3 transition-transform">
                  <Sparkles className="w-6 h-6 fill-black" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-3 tracking-tight">AI Portfolio Builder</h3>
                <p className="text-sm text-[#A0A0B2] leading-relaxed font-medium">
                  Describe your financial goal in plain English. Get a customized, risk-profiled portfolio of real Indian mutual funds and stocks in seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-neo-pink">10,000 Simulations</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-xl bg-[#181822] border-[3px] border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-lg bg-neo-yellow border-2 border-black flex items-center justify-center text-black mb-6 shadow-neo-sm group-hover:rotate-3 transition-transform">
                  <BarChart3 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-3 tracking-tight">Deep Fund Research</h3>
                <p className="text-sm text-[#A0A0B2] leading-relaxed font-medium">
                  Every metric that matters — CAGR, Sharpe, Sortino, Alpha, Beta, maximum drawdown curves, complete asset holdings, and sector allocations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-neo-yellow">40,000+ Schemes</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-xl bg-[#181822] border-[3px] border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-lg bg-neo-cyan border-2 border-black flex items-center justify-center text-black mb-6 shadow-neo-sm group-hover:rotate-3 transition-transform">
                  <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-3 tracking-tight">Stock Analysis & Momentum</h3>
                <p className="text-sm text-[#A0A0B2] leading-relaxed font-medium">
                  NSE & BSE listed stocks with live quotes, P/E ratios, moving averages (SMA 20/50/200), RSI momentum, MACD, and peer valuation comparisons.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-neo-cyan">NSE & BSE Feed</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y-2 border-black bg-neo-black text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono font-bold text-[#A0A0B2]">
          <span className="uppercase tracking-widest text-neo-yellow">Data Verified Direct From</span>
          <div className="flex items-center gap-3 sm:gap-4 text-white flex-wrap justify-center">
            <span className="px-2.5 py-1 rounded bg-[#1C1D26] border border-black shadow-[1px_1px_0px_0px_#000]">AMFI INDIA</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded bg-[#1C1D26] border border-black shadow-[1px_1px_0px_0px_#000]">NSE INDIA</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded bg-[#1C1D26] border border-black shadow-[1px_1px_0px_0px_#000]">BSE INDIA</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded bg-[#1C1D26] border border-black shadow-[1px_1px_0px_0px_#000]">SEBI DIRECT</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-black bg-[#0A0A0E] text-xs text-[#A0A0B2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-neo-yellow border-2 border-black flex items-center justify-center text-black font-black text-xs shadow-neo-sm">
                A
              </div>
              <span className="font-black text-base text-white tracking-tight uppercase">Arthora.in</span>
            </div>
            <p className="text-center sm:text-right font-mono font-bold">
              © {new Date().getFullYear()} Arthora. Built for Indian retail investors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121218] border-2 border-black shadow-neo-sm text-[11px] font-mono text-[#8C8CA0] leading-relaxed max-w-4xl mx-auto">
            <span className="font-bold text-neo-yellow">DISCLAIMER: </span>
            Arthora is a financial research and analytics technology platform and is not registered with SEBI as an Investment Advisor or Research Analyst. Information, AI simulations, and projections presented on this platform are for educational and exploratory purposes only and should not be construed as investment advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
