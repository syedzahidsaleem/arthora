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
      <div className="py-12 text-center text-xs font-mono font-bold text-[#525866] bg-[#FBF7EE] rounded-xl border-2 border-black">
        No category peers found for comparison.
      </div>
    );
  }

  const formatCAGR = (val?: number) =>
    val !== undefined ? `${val >= 0 ? '+' : ''}${val.toFixed(1)}%` : '—';

  return (
    <div className="space-y-4 text-[#222A2A]">
      <div className="overflow-x-auto rounded-xl border-2 border-black bg-white shadow-neo-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBF7EE] text-black font-black border-b-2 border-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5">Fund Scheme</th>
              <th className="py-3 px-3.5 text-right font-mono">1Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">3Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">5Y CAGR</th>
              <th className="py-3 px-3.5 text-right font-mono">Exp. Ratio</th>
              <th className="py-3 px-3.5 text-right font-mono">AUM</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10 text-[#222A2A]">
            {peers.map(({ fund, metrics }) => {
              const isCurrent =
                String(fund.schemeCode) === String(currentSchemeCode);

              return (
                <tr
                  key={fund.schemeCode}
                  className={cn(
                    'transition-colors',
                    isCurrent
                      ? 'bg-neo-yellow/30 font-black border-l-4 border-black'
                      : 'hover:bg-neo-lilac/30',
                  )}
                >
                  <td className="py-3 px-3.5 max-w-[240px] truncate">
                    {isCurrent ? (
                      <div className="flex items-center gap-2">
                        <span className="text-black font-black truncate">{fund.schemeName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-black text-neo-yellow text-[10px] uppercase font-black shrink-0 border border-black shadow-[1px_1px_0px_#000]">
                          Current
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={`/research/fund/${fund.schemeCode}`}
                        className="hover:text-neo-rust hover:underline truncate block font-bold text-black"
                      >
                        {fund.schemeName}
                      </Link>
                    )}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono font-bold',
                      (metrics?.cagr1Y ?? 0) >= 0 ? 'text-[#059669]' : 'text-neo-rust',
                    )}
                  >
                    {formatCAGR(metrics?.cagr1Y)}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono font-black',
                      (metrics?.cagr3Y ?? 0) >= 0 ? 'text-[#059669]' : 'text-neo-rust',
                    )}
                  >
                    {formatCAGR(metrics?.cagr3Y)}
                  </td>
                  <td
                    className={cn(
                      'py-3 px-3.5 text-right font-mono font-bold',
                      (metrics?.cagr5Y ?? 0) >= 0 ? 'text-[#059669]' : 'text-neo-rust',
                    )}
                  >
                    {formatCAGR(metrics?.cagr5Y)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-[#525866] font-bold">
                    {metrics?.expenseRatio !== undefined
                      ? `${metrics.expenseRatio.toFixed(2)}%`
                      : '—'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-black font-black">
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
export default FundPeerComparison;
