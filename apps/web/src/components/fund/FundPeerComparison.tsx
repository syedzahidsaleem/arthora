'use client';

import React from 'react';
import Link from 'next/link';
import type { FundPeerItem } from '@/hooks/useFundPeers';
import { cn } from '@/lib/utils';

interface FundPeerComparisonProps {
  currentSchemeCode: number | string;
  peers: FundPeerItem[];
}

export function FundPeerComparison({
  currentSchemeCode,
  peers,
}: FundPeerComparisonProps) {
  if (peers.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#9B9BB4] bg-[#13141F]/40 rounded-2xl border border-white/5">
        No category peers found for comparison.
      </div>
    );
  }

  const formatCAGR = (val?: number) =>
    val !== undefined ? `${val >= 0 ? '+' : ''}${val.toFixed(1)}%` : '—';

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#13141F]/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#13141F] text-[#9B9BB4] font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5">Fund Scheme</th>
              <th className="py-3 px-3.5 text-right font-mono">1Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">3Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">5Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">Exp. Ratio</th>
              <th className="py-3 px-3.5 text-right font-mono">AUM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {peers.map(({ fund, metrics }) => {
              const isCurrent =
                String(fund.schemeCode) === String(currentSchemeCode);

              return (
                <tr
                  key={fund.schemeCode}
                  className={cn(
                    'transition-colors',
                    isCurrent
                      ? 'bg-gradient-to-r from-[#6C63FF]/20 to-[#00D2FF]/10 font-semibold border-l-2 border-[#6C63FF]'
                      : 'hover:bg-white/5',
                  )}
                >
                  <td className="py-3 px-3.5 max-w-[240px] truncate">
                    {isCurrent ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#00D2FF] truncate">{fund.schemeName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#6C63FF]/30 text-[10px] uppercase font-bold shrink-0">
                          Current
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={`/research/fund/${fund.schemeCode}`}
                        className="hover:text-[#00D2FF] hover:underline truncate block"
                      >
                        {fund.schemeName}
                      </Link>
                    )}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono',
                      (metrics?.cagr1Y ?? 0) >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]',
                    )}
                  >
                    {formatCAGR(metrics?.cagr1Y)}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono font-bold',
                      (metrics?.cagr3Y ?? 0) >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]',
                    )}
                  >
                    {formatCAGR(metrics?.cagr3Y)}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono',
                      (metrics?.cagr5Y ?? 0) >= 0 ? 'text-[#00D084]' : 'text-[#FF4D6D]',
                    )}
                  >
                    {formatCAGR(metrics?.cagr5Y)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-[#9B9BB4]">
                    {metrics?.expenseRatio !== undefined
                      ? `${metrics.expenseRatio.toFixed(2)}%`
                      : '—'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-white/90">
                    {metrics?.aum ? `₹${(metrics.aum / 100).toFixed(0)} Cr` : '—'}
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
