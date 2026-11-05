import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, Bookmark, ArrowLeft, Compass, Home } from 'lucide-react';
import { ArthoraLogo } from '@/components/common/ArthoraLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FBF7EE] text-[#222A2A] relative overflow-hidden select-none">
      {/* Background Subtle Geometric Accents */}
      <div className="absolute top-12 left-12 w-24 h-24 rounded-full bg-neo-yellow/30 border-2 border-black/20 pointer-events-none" />
      <div className="absolute bottom-16 right-16 w-32 h-32 rounded-3xl bg-neo-lilac/50 border-2 border-black/20 pointer-events-none rotate-12" />

      {/* Main Terminal Error Card */}
      <div className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-2xl bg-white border-[3px] border-black shadow-neo-lg text-center space-y-6">
        {/* Brand Vector Mark */}
        <div className="flex justify-center">
          <ArthoraLogo size={64} />
        </div>

        {/* 404 Numerical & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neo-rust text-white border-2 border-black text-xs font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000]">
            <Compass className="w-4 h-4 animate-spin stroke-[2.5]" style={{ animationDuration: '8s' }} />
            <span>ERROR 404 • ROUTE UNINDEXED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#222A2A]">
            Lost In The Terminal
          </h1>
          <p className="text-xs sm:text-sm text-[#525866] font-mono font-bold leading-relaxed max-w-md mx-auto">
            The quantitative model, fund scheme, or terminal page you requested does not exist or has been relocated.
          </p>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="space-y-3 pt-2 text-left">
          <span className="text-[11px] font-mono font-black text-[#525866] uppercase tracking-wider block text-center">
            Suggested Terminal Destinations
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/ai"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-neo-lilac hover:bg-neo-mint border-2 border-black text-xs font-black text-black transition-all group shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-neo-yellow border border-black text-black group-hover:scale-110 transition-transform shadow-[1px_1px_0px_#000]">
                <Sparkles className="w-4 h-4 fill-black" />
              </div>
              <div className="min-w-0">
                <p className="font-black truncate">AI Portfolios</p>
                <p className="text-[10px] text-[#525866] font-mono font-bold truncate">Goal-based allocation</p>
              </div>
            </Link>

            <Link
              href="/research"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-neo-aqua hover:bg-neo-yellow border-2 border-black text-xs font-black text-black transition-all group shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-white border border-black text-black group-hover:scale-110 transition-transform shadow-[1px_1px_0px_#000]">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-black truncate">Research Hub</p>
                <p className="text-[10px] text-[#525866] font-mono font-bold truncate">40K+ Mutual Funds</p>
              </div>
            </Link>

            <Link
              href="/watchlist"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-neo-yellow hover:bg-neo-mint border-2 border-black text-xs font-black text-black transition-all group shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-white border border-black text-black group-hover:scale-110 transition-transform shadow-[1px_1px_0px_#000]">
                <Bookmark className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-black truncate">Watchlist</p>
                <p className="text-[10px] text-[#525866] font-mono font-bold truncate">Pinned investments</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FBF7EE] hover:bg-neo-lilac border-2 border-black text-xs font-black text-black transition-all group shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-neo-mint border border-black text-black group-hover:scale-110 transition-transform shadow-[1px_1px_0px_#000]">
                <Home className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-black truncate">Platform Home</p>
                <p className="text-[10px] text-[#525866] font-mono font-bold truncate">Terminal landing</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Primary Return Button */}
        <div className="pt-2">
          <Link
            href="/ai"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-neo-mint hover:bg-neo-yellow border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Portfolio Terminal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
