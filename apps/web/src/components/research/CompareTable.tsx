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
    <div className="neo-box p-5 sm:p-6 bg-white space-y-4 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neo-mint border-2 border-black flex items-center justify-center text-black shadow-sm">
            <Sparkles className="w-4 h-4 fill-black" />
          </div>
          <div>
            <h3 className="font-black text-sm text-black uppercase">
              Side-by-Side Comparison ({items.length} of 3)
            </h3>
            <p className="text-xs font-mono text-black/70">
              {isFunds ? 'Mutual Fund Metrics Comparison' : 'Equity Stocks Benchmark'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close comparison view"
          className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-lg border-2 border-black bg-white">
        <table className="w-full text-xs text-left">
          <thead className="border-b-2 border-black bg-neo-cream text-black font-mono font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4 w-1/4">Metric</th>
              {items.map((it) => (
                <th key={it._id} className="py-3 px-4 font-black text-black max-w-[200px] truncate">
                  {it.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-black font-mono">
            {isFunds ? (
              <>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">Latest NAV</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-black text-black">
                      {it.latestNAV ? formatINR(it.latestNAV) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">1Y CAGR</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-black text-[#059669]">
                      {it.cagr1Y !== undefined ? `${it.cagr1Y >= 0 ? '+' : ''}${it.cagr1Y.toFixed(1)}%` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">Category</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-black font-sans capitalize font-semibold">
                      {it.category?.replace(/_/g, ' ') || 'Mutual Fund'}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">Current Price</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-black text-black">
                      {it.currentPrice ? formatINR(it.currentPrice) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">1D Change</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 font-black text-[#059669]">
                      {it.priceChangePercent !== undefined
                        ? `${it.priceChangePercent >= 0 ? '+' : ''}${it.priceChangePercent.toFixed(2)}%`
                        : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-black/70 font-sans font-bold">Ticker (NSE)</td>
                  {items.map((it) => (
                    <td key={it._id} className="py-2.5 px-4 text-black font-mono font-black">
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
