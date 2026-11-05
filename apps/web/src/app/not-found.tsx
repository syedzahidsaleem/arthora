import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, Bookmark, ArrowLeft, Compass, Home } from 'lucide-react';
import { ArthoraLogo } from '@/components/common/ArthoraLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0B0D17] text-white relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Terminal Error Card */}
      <div className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-2xl bg-[#121422]/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl text-center space-y-6">
        {/* Brand Vector Mark */}
        <div className="flex justify-center">
          <ArthoraLogo size={56} />
        </div>

        {/* 404 Numerical & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-mono font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>ERROR 404 • ROUTE UNINDEXED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Lost In The Terminal
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9BB4] leading-relaxed max-w-md mx-auto">
            The quantitative model, fund scheme, or terminal page you requested does not exist or has been relocated.
          </p>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="space-y-3 pt-2 text-left">
          <span className="text-[11px] font-mono font-bold text-[#A0A0B2] uppercase tracking-wider block text-center">
            Suggested Terminal Destinations
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/ai"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C2E] hover:bg-[#22253E] border border-white/5 hover:border-brand-primary/40 text-xs font-semibold text-white transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-brand-primary/20 text-[#8B5CF6] group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">AI Portfolios</p>
                <p className="text-[10px] text-[#80819A] truncate">Goal-based allocation</p>
              </div>
            </Link>

            <Link
              href="/research"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C2E] hover:bg-[#22253E] border border-white/5 hover:border-[#00D2FF]/40 text-xs font-semibold text-white transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-[#00D2FF]/20 text-[#00D2FF] group-hover:scale-110 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">Research Hub</p>
                <p className="text-[10px] text-[#80819A] truncate">40,000+ mutual funds</p>
              </div>
            </Link>

            <Link
              href="/watchlist"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C2E] hover:bg-[#22253E] border border-white/5 hover:border-neo-green/40 text-xs font-semibold text-white transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-neo-green/20 text-neo-green group-hover:scale-110 transition-transform">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">Watchlist</p>
                <p className="text-[10px] text-[#80819A] truncate">Tracked funds & stocks</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C2E] hover:bg-[#22253E] border border-white/5 hover:border-amber-400/40 text-xs font-semibold text-white transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform">
                <Home className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">Terminal Home</p>
                <p className="text-[10px] text-[#80819A] truncate">Overview & analytics</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Primary Back Button */}
        <div className="pt-2">
          <Link
            href="/ai"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AI Terminal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
