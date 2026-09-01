'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { IFundHoldingItem } from '@arthora/shared';
import { cn } from '@/lib/utils';

interface FundHoldingsTableProps {
  holdings: IFundHoldingItem[];
  filterSector?: string;
}

export function FundHoldingsTable({
  holdings,
  filterSector,
}: FundHoldingsTableProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'percentage' | 'name'>('percentage');
  const [sortAsc, setSortAsc] = useState(false);

  if (holdings.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#9B9BB4] bg-[#13141F]/40 rounded-2xl border border-white/5">
        Holdings data is not yet available for this scheme.
      </div>
    );
  }

  let filtered = filterSector
    ? holdings.filter((h) => h.sector?.toLowerCase() === filterSector.toLowerCase())
    : holdings;

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'percentage') {
      return sortAsc ? a.percentage - b.percentage : b.percentage - a.percentage;
    }
    return sortAsc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  const toggleSort = (col: 'percentage' | 'name') => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#13141F]/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#13141F] text-[#9B9BB4] font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5 w-10">#</th>
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Stock Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3.5">Sector</th>
              <th className="py-3 px-3.5">Market Cap</th>
              <th
                onClick={() => toggleSort('percentage')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Weight %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {displayed.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="py-2.5 px-3.5 font-mono text-[#9B9BB4] text-[11px]">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3.5 font-medium max-w-[200px] truncate">
                  {item.symbol ? (
                    <Link
                      href={`/research/stock/${item.symbol}`}
                      className="hover:text-[#00D2FF] hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-[#9B9BB4] capitalize">
                  {item.sector || '—'}
                </td>
                <td className="py-2.5 px-3.5">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-semibold',
                      item.marketCapType === 'large' && 'bg-[#00D2FF]/10 text-[#00D2FF]',
                      item.marketCapType === 'mid' && 'bg-[#6C63FF]/10 text-[#A78BFA]',
                      item.marketCapType === 'small' && 'bg-amber-400/10 text-amber-400',
                      !item.marketCapType && 'bg-white/5 text-[#9B9BB4]',
                    )}
                  >
                    {item.marketCapType || 'Large'}
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#00D2FF]">
                  {item.percentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand Button */}
      {filtered.length > 10 && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-[#00D2FF] hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            <span>{showAll ? 'Show Top 10 Holdings' : `Show All ${filtered.length} Holdings`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
