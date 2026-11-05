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
    <div className="neo-box p-5 sm:p-6 bg-white space-y-4">
      <div>
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Sector Industry Peers ({sector || 'Market Leaders'})
        </h3>
        <p className="text-xs font-mono text-black/70 mt-0.5">
          Benchmark valuation and market cap against top sector rivals
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-black bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-neo-cream text-black font-mono font-bold border-b-2 border-black uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3.5">Company Symbol</th>
              <th className="py-3 px-3.5">Exchange</th>
              <th className="py-3 px-3.5 text-right font-mono">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-black">
            {peerSymbols.map((sym) => {
              const isCurrent = sym.toUpperCase() === currentSymbol.toUpperCase();

              return (
                <tr
                  key={sym}
                  className={cn(
                    'transition-colors',
                    isCurrent
                      ? 'bg-neo-mint/30 font-bold border-l-4 border-black'
                      : 'hover:bg-neo-cream/50',
                  )}
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-black">{sym}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-neo-mint border border-black text-[10px] uppercase font-black text-black">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-black/70 font-mono font-bold">NSE</td>
                  <td className="py-3 px-3.5 text-right">
                    {isCurrent ? (
                      <span className="text-xs text-black/50 font-mono">Viewing</span>
                    ) : (
                      <Link
                        href={`/research/stock/${sym}`}
                        className="neo-btn bg-neo-yellow text-black font-bold text-[11px] px-2.5 py-1 inline-block"
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
