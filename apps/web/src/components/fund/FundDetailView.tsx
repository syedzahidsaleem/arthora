'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Users, Calculator } from 'lucide-react';
import { useFund } from '@/hooks/useFund';
import { useFundHoldings } from '@/hooks/useFundHoldings';
import { useFundPeers } from '@/hooks/useFundPeers';
import { FundHeader } from './FundHeader';
import { FundNAVChart } from './FundNAVChart';
import { FundMetricsGrid } from './FundMetricsGrid';
import { FundDrawdownChart } from './FundDrawdownChart';
import { FundRollingReturns } from './FundRollingReturns';
import { FundSectorPie } from './FundSectorPie';
import { MarketCapBar } from './MarketCapBar';
import { FundHoldingsTable } from './FundHoldingsTable';
import { FundPeerComparison } from './FundPeerComparison';
import { SIPCalculator } from './SIPCalculator';
import { PageSkeleton } from '../common/PageSkeleton';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { cn } from '@/lib/utils';

interface FundDetailViewProps {
  schemeCode: string;
}

export function FundDetailView({ schemeCode }: FundDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'holdings' | 'peers' | 'calculator'>('overview');
  const [selectedSector, setSelectedSector] = useState<string | undefined>(undefined);

  const { fund, metrics, metricsCalculating, isLoading, error, refetch } = useFund(schemeCode);
  const { holdings, sectorAlloc } = useFundHoldings(schemeCode);
  const { peers } = useFundPeers(schemeCode);

  if (isLoading && !fund) {
    return <PageSkeleton />;
  }

  if (error || !fund) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Mutual Fund not found</h3>
        <p className="text-xs text-[#9B9BB4] max-w-sm mx-auto">
          {error || 'The requested mutual fund could not be found or is inactive.'}
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
    { id: 'performance', label: 'Performance & Risk', icon: TrendingUp },
    { id: 'holdings', label: 'Holdings & Sectors', icon: PieChart },
    { id: 'peers', label: 'Category Peers', icon: Users },
    { id: 'calculator', label: 'SIP Calculator', icon: Calculator },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <FundHeader fund={fund} />

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
            <FundNAVChart schemeCode={schemeCode} />
            <FundMetricsGrid metrics={metrics} calculating={metricsCalculating} />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <FundDrawdownChart schemeCode={schemeCode} />
            <FundRollingReturns metrics={metrics} />
            <FundMetricsGrid metrics={metrics} calculating={metricsCalculating} />
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 p-5 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sector Breakdown
                </h3>
                <FundSectorPie
                  sectorAlloc={sectorAlloc}
                  onSelectSector={(s) => setSelectedSector(selectedSector === s ? undefined : s)}
                />
              </div>

              <div className="lg:col-span-6 p-5 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Market Capitalization Allocation
                  </h3>
                  <MarketCapBar holdings={holdings?.holdings || []} />
                </div>

                <div className="p-4 rounded-2xl bg-[#13141F] border border-white/5 text-xs text-[#9B9BB4] space-y-1">
                  <span className="font-semibold text-white">Portfolio Concentration:</span>
                  <p>
                    Top 10 holdings represent approximately{' '}
                    <strong className="text-[#00D2FF]">
                      {(holdings?.holdings || [])
                        .slice(0, 10)
                        .reduce((acc, h) => acc + (h.percentage || 0), 0)
                        .toFixed(1)}
                      %
                    </strong>{' '}
                    of total fund assets.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Complete Holdings Portfolio ({holdings?.holdings?.length || 0} Assets)
                </h3>
                {selectedSector && (
                  <button
                    type="button"
                    onClick={() => setSelectedSector(undefined)}
                    className="text-xs text-[#00D2FF] hover:underline"
                  >
                    Filter: {selectedSector} (Clear)
                  </button>
                )}
              </div>
              <FundHoldingsTable
                holdings={holdings?.holdings || []}
                filterSector={selectedSector}
              />
            </div>
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Category Peer Group Benchmark
              </h3>
              <p className="text-xs text-[#9B9BB4] mt-0.5">
                Compare performance and expense ratio against top competing funds in{' '}
                {fund.category || 'this category'}
              </p>
            </div>
            <FundPeerComparison currentSchemeCode={schemeCode} peers={peers} />
          </div>
        )}

        {activeTab === 'calculator' && (
          <SIPCalculator initialCAGR={metrics?.cagr3Y || metrics?.cagr5Y || 14.0} />
        )}
      </div>

      <DisclaimerBanner inline />
    </div>
  );
}
