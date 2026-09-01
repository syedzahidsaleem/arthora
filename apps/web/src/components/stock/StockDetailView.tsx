'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { cn } from '@/lib/utils';

interface StockDetailViewProps {
  symbol: string;
}

export function StockDetailView({ symbol }: StockDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'technical' | 'holdings' | 'peers'>('overview');
  const { stock, metrics, isLoading, error, refetch } = useStock(symbol);

  if (isLoading && !stock) {
    return <PageSkeleton />;
  }

  if (error || !stock) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Stock not found</h3>
        <p className="text-xs text-[#9B9BB4] max-w-sm mx-auto">
          {error || `Unable to fetch stock data for ticker symbol "${symbol}".`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF]"
          >
            Retry
          </button>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15"
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                isActive
                  ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D2FF]/20 text-white border border-[#6C63FF] shadow-sm'
                  : 'bg-[#1A1B2E] text-[#9B9BB4] border border-white/5 hover:border-white/10 hover:text-white',
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', isActive && 'text-[#00D2FF]')} />
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

      <DisclaimerBanner inline />
    </div>
  );
}
