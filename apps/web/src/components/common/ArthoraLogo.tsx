'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ArthoraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Official Arthora brand logo mark.
 * Features the geometric vector "A" with the institutional orbital curve and emerald node.
 */
export function ArthoraLogo({
  size = 32,
  className,
  showText = false,
  textClassName,
}: ArthoraLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-[0_0_16px_rgba(99,102,241,0.25)] border border-white/10 group-hover:border-brand-primary/50 transition-all"
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="arthoraBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B0F19" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="arthoraPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="arthoraAccent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          <rect width="512" height="512" rx="112" fill="url(#arthoraBg)" />
          <circle cx="256" cy="256" r="180" fill="none" stroke="#334155" strokeWidth="6" opacity="0.4" />
          <path
            d="M160 360 L256 140 L352 360"
            fill="none"
            stroke="url(#arthoraPrimary)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M200 290 L312 290"
            fill="none"
            stroke="url(#arthoraPrimary)"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d="M220 230 Q 280 180, 360 170"
            fill="none"
            stroke="url(#arthoraAccent)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <circle cx="360" cy="170" r="14" fill="#10B981" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-black text-lg tracking-tight text-white uppercase leading-none font-sans',
              textClassName,
            )}
          >
            Arthora
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-brand-primary/20 text-[#8B5CF6] border border-brand-primary/30 rounded-md">
            INDIA
          </span>
        </div>
      )}
    </div>
  );
}

export default ArthoraLogo;
