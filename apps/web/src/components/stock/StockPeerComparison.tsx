'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SECTOR_PEERS: Record<string, string[]> = {
  banking: ['HDFCBANK', 'ICICIBANK', 'AXISBANK', 'KOTAKBANK', 'SBIN'],
  it: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM'],
  technology: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM'],
  energy: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL'],
  oil: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL'],
  fmcg: ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR'],
  pharma: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'APOLLOHOSP'],
  auto: ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT'],
  automotive: ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT'],
};

interface StockPeerComparisonProps {
  currentSymbol: string;
  sector?: string;
}

export function StockPeerComparison({
  currentSymbol,
  sector = 'IT',
}: StockPeerComparisonProps) {
  const normalized = sector.toLowerCase().replace(/[^a-z]/g, '');
  const peerSymbols =
    SECTOR_PEERS[normalized] ||
    Object.entries(SECTOR_PEERS).find(([k]) => normalized.includes(k))?.[1] ||
    ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Sector Industry Peers ({sector || 'Market Leaders'})
        </h3>
        <p className="text-xs text-[#9B9BB4] mt-0.5">
          Benchmark valuation and market cap against top sector rivals
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#13141F]/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#13141F] text-[#9B9BB4] font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5">Company Symbol</th>
              <th className="py-3 px-3.5">Exchange</th>
              <th className="py-3 px-3.5 text-right font-mono">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {peerSymbols.map((sym) => {
              const isCurrent = sym.toUpperCase() === currentSymbol.toUpperCase();

              return (
                <tr
                  key={sym}
                  className={cn(
                    'transition-colors',
                    isCurrent
                      ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 font-semibold border-l-2 border-[#6C63FF]'
                      : 'hover:bg-white/5',
                  )}
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{sym}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-[#6C63FF]/30 text-[10px] uppercase font-bold text-[#00D2FF]">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-[#9B9BB4] font-mono">NSE</td>
                  <td className="py-3 px-3.5 text-right">
                    {isCurrent ? (
                      <span className="text-xs text-[#9B9BB4]">Viewing</span>
                    ) : (
                      <Link
                        href={`/research/stock/${sym}`}
                        className="text-xs font-semibold text-[#00D2FF] hover:underline"
                      >
                        Research ↗
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
