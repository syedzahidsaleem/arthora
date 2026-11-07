'use client';

import React, { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import {
  TrendingUp,
  Activity,
  PieChart as PieIcon,
  Users,
  Calculator,
} from 'lucide-react';
import { useFund } from '@/hooks/useFund';
import { useFundPeers } from '@/hooks/useFundPeers';
import { useFundHoldings } from '@/hooks/useFundHoldings';
import { FundHeader } from '@/components/fund/FundHeader';
import { FundNAVChart } from '@/components/fund/FundNAVChart';
import { FundMetricsGrid } from '@/components/fund/FundMetricsGrid';
import { FundDrawdownChart } from '@/components/fund/FundDrawdownChart';
import { FundRollingReturns } from '@/components/fund/FundRollingReturns';
import { FundSectorPie } from '@/components/fund/FundSectorPie';
import { FundHoldingsTable } from '@/components/fund/FundHoldingsTable';
import { FundPeerComparison } from '@/components/fund/FundPeerComparison';
import { SIPCalculator } from '@/components/fund/SIPCalculator';
import { MarketCapBar } from '@/components/fund/MarketCapBar';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { cn } from '@/lib/utils';

interface FundDetailViewProps {
  schemeCode: number | string;
}

export function FundDetailView({ schemeCode: initialSchemeCode }: FundDetailViewProps) {
  const nextParams = useParams();
  const pathname = usePathname();
  const rawCode = (nextParams?.schemeCode as string) || String(initialSchemeCode);
  const pathCode = pathname?.match(/\/research\/fund\/([0-9a-zA-Z_-]+)/)?.[1];
  const windowCode = typeof window !== 'undefined' ? window.location.pathname.match(/\/research\/fund\/([0-9a-zA-Z_-]+)/)?.[1] : undefined;
  const effectiveCode = (rawCode && rawCode !== '_') ? rawCode : (pathCode && pathCode !== '_' ? pathCode : (windowCode && windowCode !== '_' ? windowCode : String(initialSchemeCode)));
  const schemeCode = Number(effectiveCode) || 0;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSector, setSelectedSector] = useState<string | undefined>();

  const { fund, metrics, metricsCalculating, isLoading, error } = useFund(schemeCode);
  const { peers } = useFundPeers(schemeCode);
  const { holdings, sectorAlloc } = useFundHoldings(schemeCode);

  if (isLoading && !fund) {
    return <PageSkeleton />;
  }

  if (error || !fund) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-black text-[#222A2A] uppercase">Fund Not Found</h3>
        <p className="text-xs text-[#525866] font-mono font-bold max-w-sm mx-auto">
          The requested mutual fund scheme could not be found or has been merged.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & NAV', icon: TrendingUp },
    { id: 'performance', label: 'Risk & Drawdown', icon: Activity },
    { id: 'holdings', label: 'Holdings & Sectors', icon: PieIcon },
    { id: 'peers', label: 'Peer Comparison', icon: Users },
    { id: 'calculator', label: 'SIP Calculator', icon: Calculator },
  ];

  return (
    <div className="space-y-6 select-none text-[#222A2A]">
      {/* Sticky Header */}
      <FundHeader fund={fund} />

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
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all shrink-0 border-2 border-black',
                isActive
                  ? 'bg-neo-mint text-black shadow-neo'
                  : 'bg-white text-[#525866] hover:text-black hover:bg-neo-yellow shadow-neo-sm',
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 stroke-[2.5]', isActive ? 'text-black fill-black' : 'text-[#525866]')} />
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
              <div className="lg:col-span-6 p-5 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4">
                <h3 className="text-xs font-black text-black uppercase tracking-wider">
                  Sector Breakdown
                </h3>
                <FundSectorPie
                  sectorAlloc={sectorAlloc}
                  onSelectSector={(s) => setSelectedSector(selectedSector === s ? undefined : s)}
                />
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-white border-2 border-black shadow-neo space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">
                    Market Capitalization Allocation
                  </h3>
                  <MarketCapBar holdings={holdings?.holdings || []} />
                </div>

                <div className="p-4 rounded-xl bg-[#FBF7EE] border-2 border-black text-xs text-[#525866] space-y-1">
                  <span className="font-black text-black">Portfolio Concentration:</span>
                  <p>
                    Top 10 holdings represent approximately{' '}
                    <strong className="text-black font-black bg-neo-yellow px-1.5 py-0.5 rounded border border-black">
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

            <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-black uppercase tracking-wider">
                  Complete Holdings Portfolio ({holdings?.holdings?.length || 0} Assets)
                </h3>
                {selectedSector && (
                  <button
                    type="button"
                    onClick={() => setSelectedSector(undefined)}
                    className="text-xs text-neo-rust font-bold hover:underline"
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
          <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-neo space-y-4">
            <div>
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Category Peer Group Benchmark
              </h3>
              <p className="text-xs text-[#525866] font-bold mt-0.5">
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
    </div>
  );
}
export default FundDetailView;
