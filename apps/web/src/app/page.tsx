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
    <div className="min-h-screen bg-[#0D0E1A] text-[#F8F9FA] flex flex-col selection:bg-[#6C63FF]/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0D0E1A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Arthora<span className="text-[#00D2FF]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[#9B9BB4] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 flex-1 flex flex-col justify-center">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#6C63FF]/20 to-[#00D2FF]/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#6C63FF]/30 text-xs font-medium text-[#00D2FF] mb-6 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>Powered by Google Gemini 1.5 Flash</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
            Your AI Investment Advisor for{' '}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#00D2FF] to-[#00D084] bg-clip-text text-transparent">
              India
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#9B9BB4] max-w-2xl mx-auto leading-relaxed mb-8">
            Research 40,000+ mutual funds, build AI-powered goal portfolios, and analyze Indian stocks — with institutional quant metrics, completely free.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#6C63FF]/25"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base text-white bg-[#1A1B2E] border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Explore Research
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex items-center justify-center gap-6 text-xs text-[#9B9BB4]/80 flex-wrap mb-16">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D084]" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D084]" /> Live AMFI & NSE data
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D084]" /> Free forever
            </span>
          </div>

          {/* Floating UI Showcase */}
          <div className="relative max-w-4xl mx-auto">
            <div className="p-4 md:p-6 rounded-3xl bg-[#13141F]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-[#1A1B2E] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#9B9BB4] uppercase">Parag Parikh Flexi Cap</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#00D084]/10 text-[#00D084] font-mono text-[11px] font-bold">
                    +22.4%
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-white mb-1">₹82.45</div>
                <div className="text-[11px] text-[#9B9BB4]">Sharpe 1.42 • Alpha 5.2%</div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6C63FF]/15 to-[#00D2FF]/10 border border-[#6C63FF]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#00D2FF] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Target Corpus
                  </span>
                  <span className="text-[11px] text-white/60">15 Yrs</span>
                </div>
                <div className="text-xl font-mono font-bold text-white mb-1">₹1.48 Cr</div>
                <div className="text-[11px] text-[#00D084] font-mono">10,000 Monte Carlo Iterations</div>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl bg-[#1A1B2E] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#9B9BB4] uppercase">RELIANCE (NSE)</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#00D084]/10 text-[#00D084] font-mono text-[11px] font-bold">
                    Bullish
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-white mb-1">₹2,985.50</div>
                <div className="text-[11px] text-[#9B9BB4]">RSI 58.4 • SMA50 Bull Cross</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-[#13141F]/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Everything you need to invest with confidence
            </h2>
            <p className="text-[#9B9BB4] text-base">
              Built specifically for Indian retail investors who want professional-grade research without paying expensive advisor fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#1A1B2E] border border-white/5 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#00D2FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#00D2FF] mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Portfolio Builder</h3>
              <p className="text-sm text-[#9B9BB4] leading-relaxed">
                Describe your financial goal in plain English. Get a customized, risk-profiled portfolio of real Indian mutual funds and stocks in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#1A1B2E] border border-white/5 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#00D2FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deep Fund Research</h3>
              <p className="text-sm text-[#9B9BB4] leading-relaxed">
                Every metric that matters — CAGR, Sharpe, Sortino, Alpha, Beta, maximum drawdown curves, complete asset holdings, and sector allocations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#1A1B2E] border border-white/5 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#00D2FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#00D084] mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Stock Analysis & Technicals</h3>
              <p className="text-sm text-[#9B9BB4] leading-relaxed">
                NSE & BSE listed stocks with live quotes, P/E ratios, moving averages (SMA 20/50/200), RSI momentum, MACD, and peer valuation comparisons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-white/5 bg-[#0D0E1A] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-[#9B9BB4]">
          <span className="uppercase tracking-widest text-[#9B9BB4]/60">Data Verified Direct From</span>
          <div className="flex items-center gap-6 text-[#F8F9FA]/80">
            <span>AMFI India</span>
            <span>•</span>
            <span>NSE India</span>
            <span>•</span>
            <span>BSE India</span>
            <span>•</span>
            <span>SEBI Registered Schemes</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0A0B14] text-xs text-[#9B9BB4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-white text-xs">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-bold text-sm text-white">Arthora</span>
            </div>
            <p className="text-center sm:text-right">
              © {new Date().getFullYear()} Arthora. Built for Indian retail investors.
            </p>
          </div>

          <p className="text-[11px] text-[#9B9BB4]/60 text-center leading-relaxed max-w-4xl mx-auto">
            Disclaimer: Arthora is a financial research and analytics technology platform and is not registered with SEBI as an Investment Advisor or Research Analyst. Information, AI simulations, and projections presented on this platform are for educational and exploratory purposes only and should not be construed as investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
