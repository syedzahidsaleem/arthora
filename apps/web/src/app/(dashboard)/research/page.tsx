'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CategoryBrowser } from '@/components/research/CategoryBrowser';
import { SearchResultList } from '@/components/research/SearchResultList';
import { FundCard, FundCardData } from '@/components/research/FundCard';
import { StockCard, StockCardData } from '@/components/research/StockCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { PaginatedData } from '@arthora/shared';

const POPULAR_FUNDS: FundCardData[] = [
  {
    _id: 'pop-1',
    schemeCode: 118834,
    isin: 'INF769K01136',
    schemeName: 'Mirae Asset ELSS Tax Saver Fund - Direct Growth',
    fundHouse: 'Mirae Asset Mutual Fund',
    category: 'ELSS',
    latestNAV: 46.85,
    cagr1Y: 28.4,
    cagr3Y: 18.2,
    cagr5Y: 19.8,
    aum: 2480000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'pop-2',
    schemeCode: 122639,
    isin: 'INF879O01027',
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth',
    fundHouse: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    latestNAV: 82.45,
    cagr1Y: 24.6,
    cagr3Y: 21.3,
    cagr5Y: 23.5,
    aum: 6500000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'pop-3',
    schemeCode: 120716,
    isin: 'INF789F01058',
    schemeName: 'UTI Nifty 50 Index Fund - Direct Growth',
    fundHouse: 'UTI Mutual Fund',
    category: 'Index Fund',
    latestNAV: 168.2,
    cagr1Y: 19.5,
    cagr3Y: 15.2,
    cagr5Y: 16.4,
    aum: 1820000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'pop-4',
    schemeCode: 118778,
    isin: 'INF204K01UX3',
    schemeName: 'Nippon India Small Cap Fund - Direct Growth',
    fundHouse: 'Nippon India Mutual Fund',
    category: 'Small Cap',
    latestNAV: 174.9,
    cagr1Y: 34.2,
    cagr3Y: 28.1,
    cagr5Y: 27.6,
    aum: 5200000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'pop-5',
    schemeCode: 119202,
    isin: 'INF179K01VJ1',
    schemeName: 'HDFC Balanced Advantage Fund - Direct Growth',
    fundHouse: 'HDFC Mutual Fund',
    category: 'Balanced Advantage',
    latestNAV: 495.2,
    cagr1Y: 22.8,
    cagr3Y: 19.4,
    cagr5Y: 18.2,
    aum: 8600000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'pop-6',
    schemeCode: 120503,
    isin: 'INF846K01164',
    schemeName: 'Axis Bluechip Fund - Direct Growth',
    fundHouse: 'Axis Mutual Fund',
    category: 'Large Cap',
    latestNAV: 61.12,
    cagr1Y: 16.4,
    cagr3Y: 12.8,
    cagr5Y: 14.1,
    aum: 3200000,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
];

const POPULAR_STOCKS: StockCardData[] = [
  {
    _id: 'stk-1',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    sector: 'Energy',
    isin: 'INE002A01018',
    currentPrice: 2985.5,
    changePercent: 1.45,
    peRatio: 28.2,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'stk-2',
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd',
    sector: 'Banking',
    isin: 'INE040A01034',
    currentPrice: 1642.0,
    changePercent: 0.85,
    peRatio: 18.9,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'stk-3',
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Ltd',
    sector: 'IT Services',
    isin: 'INE467B01029',
    currentPrice: 4210.0,
    changePercent: -0.42,
    peRatio: 31.4,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'stk-4',
    symbol: 'INFY',
    companyName: 'Infosys Ltd',
    sector: 'IT Services',
    isin: 'INE009A01021',
    currentPrice: 1875.2,
    changePercent: 1.12,
    peRatio: 26.5,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'stk-5',
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd',
    sector: 'Banking',
    isin: 'INE090A01021',
    currentPrice: 1230.8,
    changePercent: 1.82,
    peRatio: 17.6,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'stk-6',
    symbol: 'HINDUNILVR',
    companyName: 'Hindustan Unilever Ltd',
    sector: 'FMCG',
    isin: 'INE030A01027',
    currentPrice: 2740.0,
    changePercent: -0.28,
    peRatio: 56.4,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
];

export default function ResearchHubPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fundResults, setFundResults] = useState<FundCardData[]>([]);
  const [stockResults, setStockResults] = useState<StockCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim() && !selectedCategory) {
      setFundResults([]);
      setStockResults([]);
      setIsSearching(false);
      return;
    }

    const runSearch = async () => {
      setIsSearching(true);
      try {
        const fetchFunds = api.get<PaginatedData<FundCardData>>(
          API_ENDPOINTS.FUNDS.SEARCH,
          {
            params: {
              q: debouncedQuery.trim() || undefined,
              category: selectedCategory || undefined,
              limit: 9,
            },
          },
        );

        const fetchStocks = debouncedQuery.trim()
          ? api.get<PaginatedData<StockCardData>>(API_ENDPOINTS.STOCKS.SEARCH, {
              params: { q: debouncedQuery.trim(), limit: 9 },
            })
          : Promise.resolve({ items: [] as StockCardData[] });

        const [fundsRes, stocksRes] = await Promise.allSettled([
          fetchFunds,
          fetchStocks,
        ]);

        setFundResults(
          fundsRes.status === 'fulfilled' ? fundsRes.value.items || [] : [],
        );
        setStockResults(
          stocksRes.status === 'fulfilled' ? stocksRes.value.items || [] : [],
        );
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    void runSearch();
  }, [debouncedQuery, selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const isSearchActive = Boolean(debouncedQuery.trim() || selectedCategory);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <span>Investment Research Hub</span>
          <span className="px-2 py-0.5 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-[11px] font-bold border border-[#00D2FF]/20">
            LIVE DATA
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9B9BB4] mt-1">
          Explore 40,000+ AMFI mutual funds and NSE listed stocks with quantitative analytics.
        </p>
      </div>

      {/* Prominent Search Bar & Category Chips */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-4">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-[#6C63FF] absolute left-4 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mutual funds by name, AMC, category or stocks by NSE ticker..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#13141F] border border-white/5 text-sm sm:text-base font-medium text-white placeholder-[#9B9BB4]/60 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search input"
              className="absolute right-4 p-1 text-[#9B9BB4] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : isSearching ? (
            <div className="absolute right-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : null}
        </div>

        {/* Category Browser Chips */}
        <CategoryBrowser
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Dynamic Results vs Popular Curated Grids */}
      {isSearchActive ? (
        <SearchResultList
          fundResults={fundResults}
          stockResults={stockResults}
          isLoading={isSearching}
          searchQuery={debouncedQuery || selectedCategory}
        />
      ) : (
        <div className="space-y-10">
          {/* Popular Mutual Funds */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D2FF]" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Popular Indian Mutual Funds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_FUNDS.map((fund) => (
                <FundCard key={fund.schemeCode} fund={fund} />
              ))}
            </div>
          </section>

          {/* Popular NSE Stocks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6C63FF]" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Top Nifty 50 Stocks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_STOCKS.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
