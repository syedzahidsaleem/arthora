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
      <div className="py-12 text-center text-xs font-mono font-bold text-[#525866] bg-[#FBF7EE] rounded-xl border-2 border-black">
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
    <div className="space-y-4 text-[#222A2A]">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border-2 border-black bg-white shadow-neo-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBF7EE] text-black font-black border-b-2 border-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5 w-10">#</th>
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-3.5 cursor-pointer hover:text-neo-rust transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Stock Name</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th className="py-3 px-3.5">Sector</th>
              <th className="py-3 px-3.5">Market Cap</th>
              <th
                onClick={() => toggleSort('percentage')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-neo-rust transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Weight %</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10 text-[#222A2A]">
            {displayed.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-neo-lilac/30 transition-colors group"
              >
                <td className="py-2.5 px-3.5 font-mono text-[#525866] font-bold text-[11px]">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3.5 font-bold max-w-[200px] truncate text-black">
                  {item.symbol ? (
                    <Link
                      href={`/research/stock/${item.symbol}`}
                      className="hover:text-neo-rust hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-[#525866] capitalize font-medium">
                  {item.sector || '—'}
                </td>
                <td className="py-2.5 px-3.5">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded border border-black text-[10px] uppercase font-mono font-black shadow-[1px_1px_0px_#000]',
                      item.marketCapType === 'large' && 'bg-neo-aqua text-black',
                      item.marketCapType === 'mid' && 'bg-neo-yellow text-black',
                      item.marketCapType === 'small' && 'bg-neo-mint text-black',
                      !item.marketCapType && 'bg-[#FBF7EE] text-black',
                    )}
                  >
                    {item.marketCapType || 'Large'}
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-black text-black">
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black bg-white hover:bg-neo-yellow border-2 border-black shadow-neo-sm hover:shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>{showAll ? 'Show Top 10 Holdings' : `Show All ${filtered.length} Holdings`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>
      )}
    </div>
  );
}
export default FundHoldingsTable;
