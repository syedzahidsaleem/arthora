'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ArrowLeft, BarChart3, DollarSign, Activity, Users, Layers } from 'lucide-react';
import { useStock } from '@/hooks/useStock';
import { StockHeader } from './StockHeader';
import { StockPriceChart } from './StockPriceChart';
import { StockMetricsGrid } from './StockMetricsGrid';
import { StockQuarterlyResults } from './StockQuarterlyResults';
import { StockTechnicalChart } from './StockTechnicalChart';
import { StockHoldingPattern } from './StockHoldingPattern';
import { StockPeerComparison } from './StockPeerComparison';
import { PageSkeleton } from '../common/PageSkeleton';
import { cn } from '@/lib/utils';

interface StockDetailViewProps {
  symbol: string;
}

export function StockDetailView({ symbol: initialSymbol }: StockDetailViewProps) {
  const nextParams = useParams();
  const pathname = usePathname();
  const rawSymbol = (nextParams?.symbol as string) || initialSymbol || '';
  const pathSymbol = pathname?.match(/\/research\/stock\/([^/?#]+)/)?.[1];
  const windowSymbol = typeof window !== 'undefined' ? window.location.pathname.match(/\/research\/stock\/([^/?#]+)/)?.[1] : undefined;
  const symbol = (rawSymbol && rawSymbol !== '_') ? rawSymbol : (pathSymbol && pathSymbol !== '_' ? pathSymbol : (windowSymbol && windowSymbol !== '_' ? windowSymbol : initialSymbol));
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'technical' | 'holdings' | 'peers'>('overview');
  const { stock, metrics, isLoading, error, refetch } = useStock(symbol);

  if (isLoading && !stock) {
    return <PageSkeleton />;
  }

  if (error || !stock) {
    return (
      <div className="py-16 text-center space-y-4 neo-box p-8 bg-white max-w-lg mx-auto">
        <h3 className="text-xl font-black text-black">Stock not found</h3>
        <p className="text-xs text-black/70 max-w-sm mx-auto font-mono">
          {error || `Unable to fetch stock data for ticker symbol "${symbol}".`}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="neo-btn bg-neo-mint text-black font-bold text-xs"
          >
            Retry
          </button>
          <Link
            href="/research"
            className="neo-btn bg-white text-black font-bold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research</span>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'financials', label: 'Financials & Ratios', icon: DollarSign },
    { id: 'technical', label: 'Technical Signals', icon: Activity },
    { id: 'holdings', label: 'Shareholding Pattern', icon: Layers },
    { id: 'peers', label: 'Sector Peers', icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <StockHeader stock={stock} metrics={metrics} />

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-black scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase whitespace-nowrap transition-all shrink-0 border-2 border-black',
                isActive
                  ? 'bg-neo-mint text-black shadow-neo'
                  : 'bg-white text-black/70 hover:text-black hover:bg-neo-cream',
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-black fill-black' : 'text-black/70')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StockPriceChart symbol={symbol} />
            <StockMetricsGrid metrics={metrics} />
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            <StockQuarterlyResults symbol={symbol} metrics={metrics} />
            <StockMetricsGrid metrics={metrics} />
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            <StockTechnicalChart symbol={symbol} />
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="space-y-6">
            <StockHoldingPattern metrics={metrics} />
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="space-y-6">
            <StockPeerComparison currentSymbol={symbol} sector={stock.sector} />
          </div>
        )}
      </div>
    </div>
  );
}
