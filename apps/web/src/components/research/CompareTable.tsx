'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { formatINR } from '@arthora/shared';
import type { IFavoriteWithMarketData } from '@/hooks/useFavorites';

interface CompareTableProps {
  items: IFavoriteWithMarketData[];
  onClose: () => void;
}

export function CompareTable({ items, onClose }: CompareTableProps) {
  if (items.length === 0) return null;

  const isFunds = items[0].assetType === 'mutual_fund';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-[#6C63FF]/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Side-by-Side Comparison ({items.length} of 3)
            </h3>
            <p className="text-xs text-[#9B9BB4]">
              {isFunds ? 'Mutual Fund Metrics Comparison' : 'Equity Stocks Benchmark'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close comparison view"
          className="p-1.5 rounded-xl text-[#9B9BB4] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#13141F]">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-white/5 text-[#9B9BB4] font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4 w-1/4">Metric</th>
              {items.map((it) => (
                <th key={it._id} className="py-3 px-4 font-bold text-white max-w-[200px] truncate">
                  {it.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white font-mono">
            {isFunds ? (
              <>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">Latest NAV</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-bold text-[#00D2FF]">
                      {it.latestNAV ? formatINR(it.latestNAV) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">1Y CAGR</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-[#00D084] font-bold">
                      {it.cagr1Y !== undefined ? `${it.cagr1Y >= 0 ? '+' : ''}${it.cagr1Y.toFixed(1)}%` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">Category</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-white/90 font-sans capitalize">
                      {it.category?.replace(/_/g, ' ') || 'Mutual Fund'}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">Current Price</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-bold text-[#00D2FF]">
                      {it.currentPrice ? formatINR(it.currentPrice) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">1D Change</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-[#00D084] font-bold">
                      {it.priceChangePercent !== undefined
                        ? `${it.priceChangePercent >= 0 ? '+' : ''}${it.priceChangePercent.toFixed(2)}%`
                        : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#9B9BB4] font-sans">Ticker (NSE)</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-white/90 font-mono font-bold">
                      {it.symbol}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
