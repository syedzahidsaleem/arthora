import crypto from 'crypto';
import { StockMetadata } from '../models/StockMetadata';
import { StockMetrics } from '../models/StockMetrics';
import { StockPriceHistory } from '../models/StockPriceHistory';
import * as redisService from '../db/redis';
import {
  fetchStockQuote,
  fetchStockFundamentals,
  fetchStockPriceHistory,
  fetchStockTechnicals,
  isMarketHours,
  type StockQuoteResult,
} from '../external/yfinance';
import type { IStockMetadata, PaginatedData } from '@arthora/shared';

export interface StockSearchFilters {
  sector?: string;
  marketCapType?: 'large_cap' | 'mid_cap' | 'small_cap';
  page?: number;
  limit?: number;
}

export interface StockDetailResult extends IStockMetadata {
  quote?: StockQuoteResult;
}

const FALLBACK_TRACKED_STOCKS: Array<{
  symbol: string;
  companyName: string;
  sector: string;
  marketCapType: 'large' | 'mid' | 'small' | 'micro';
}> = [
  { symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Limited', sector: 'Energy', marketCapType: 'large' },
  { symbol: 'TCS.NS', companyName: 'Tata Consultancy Services Limited', sector: 'Technology', marketCapType: 'large' },
  { symbol: 'HDFCBANK.NS', companyName: 'HDFC Bank Limited', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'INFY.NS', companyName: 'Infosys Limited', sector: 'Technology', marketCapType: 'large' },
  { symbol: 'ICICIBANK.NS', companyName: 'ICICI Bank Limited', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'HINDUNILVR.NS', companyName: 'Hindustan Unilever Limited', sector: 'Consumer Defensive', marketCapType: 'large' },
  { symbol: 'ITC.NS', companyName: 'ITC Limited', sector: 'Consumer Defensive', marketCapType: 'large' },
  { symbol: 'SBIN.NS', companyName: 'State Bank of India', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'BHARTIARTL.NS', companyName: 'Bharti Airtel Limited', sector: 'Communication Services', marketCapType: 'large' },
  { symbol: 'KOTAKBANK.NS', companyName: 'Kotak Mahindra Bank Limited', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'LT.NS', companyName: 'Larsen & Toubro Limited', sector: 'Industrials', marketCapType: 'large' },
  { symbol: 'AXISBANK.NS', companyName: 'Axis Bank Limited', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'MARUTI.NS', companyName: 'Maruti Suzuki India Limited', sector: 'Consumer Cyclical', marketCapType: 'large' },
  { symbol: 'SUNPHARMA.NS', companyName: 'Sun Pharmaceutical Industries Limited', sector: 'Healthcare', marketCapType: 'large' },
  { symbol: 'TITAN.NS', companyName: 'Titan Company Limited', sector: 'Consumer Cyclical', marketCapType: 'large' },
  { symbol: 'WIPRO.NS', companyName: 'Wipro Limited', sector: 'Technology', marketCapType: 'large' },
  { symbol: 'HCLTECH.NS', companyName: 'HCL Technologies Limited', sector: 'Technology', marketCapType: 'large' },
  { symbol: 'BAJFINANCE.NS', companyName: 'Bajaj Finance Limited', sector: 'Financial Services', marketCapType: 'large' },
  { symbol: 'NTPC.NS', companyName: 'NTPC Limited', sector: 'Utilities', marketCapType: 'large' },
  { symbol: 'TATAMOTORS.NS', companyName: 'Tata Motors Limited', sector: 'Consumer Cyclical', marketCapType: 'large' },
];

function buildFallbackStockMeta(item: (typeof FALLBACK_TRACKED_STOCKS)[number]): IStockMetadata {
  return {
    _id: item.symbol,
    symbol: item.symbol,
    nseSymbol: item.symbol.replace(/\.NS$/, ''),
    companyName: item.companyName,
    isin: '',
    sector: item.sector,
    marketCapType: item.marketCapType,
    isActive: true,
    lastUpdated: new Date(),
  };
}

/**
 * Searches NSE listed stocks with text query, sector filters, and pagination.
 */
export async function searchStocks(
  query?: string,
  filters: StockSearchFilters = {},
): Promise<PaginatedData<IStockMetadata>> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const cachePayload = { query: query || '', ...filters, page, limit };
  const cacheHash = crypto.createHash('sha256').update(JSON.stringify(cachePayload)).digest('hex');
  const cacheKey = `stock:search:${cacheHash}`;

  const cached = await redisService.get<PaginatedData<IStockMetadata>>(cacheKey);
  if (cached) {
    return cached;
  }

  const filterQuery: Record<string, unknown> = { isActive: true };

  if (query && query.trim().length > 0) {
    const safeRegex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filterQuery.$or = [
      { symbol: safeRegex },
      { companyName: safeRegex },
    ];
  }

  if (filters.sector && filters.sector !== 'all') {
    filterQuery.sector = filters.sector;
  }

  if (filters.marketCapType) {
    const capMap: Record<string, string> = {
      large_cap: 'large',
      mid_cap: 'mid',
      small_cap: 'small',
    };
    filterQuery.marketCapType = capMap[filters.marketCapType] || filters.marketCapType;
  }

  let [items, total] = await Promise.all([
    StockMetadata.find(filterQuery)
      .sort({ symbol: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StockMetadata.countDocuments(filterQuery),
  ]);

  if (total === 0) {
    const dbCount = await StockMetadata.countDocuments({});
    if (dbCount === 0) {
      const qLower = query?.trim().toLowerCase() || '';
      const matched = FALLBACK_TRACKED_STOCKS.filter((s) => {
        if (qLower && !s.symbol.toLowerCase().includes(qLower) && !s.companyName.toLowerCase().includes(qLower)) {
          return false;
        }
        if (filters.sector && filters.sector !== 'all' && s.sector.toLowerCase() !== filters.sector.toLowerCase()) {
          return false;
        }
        return true;
      });
      total = matched.length;
      items = matched.slice(skip, skip + limit).map(buildFallbackStockMeta) as unknown as typeof items;
    }
  }

  const totalPages = Math.ceil(total / limit);
  const result: PaginatedData<IStockMetadata> = {
    items: items as unknown as IStockMetadata[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  await redisService.set(cacheKey, result, 3600);
  return result;
}

/**
 * Retrieves stock metadata merged with real-time / delayed NSE quote.
 */
export async function getStockDetail(symbol: string): Promise<StockDetailResult> {
  const cleanSymbol = symbol.toUpperCase().trim();
  const normalizedQuerySymbol = cleanSymbol.endsWith('.NS') ? cleanSymbol : `${cleanSymbol}.NS`;
  const stock = await StockMetadata.findOne({ symbol: cleanSymbol }).lean();
  const fallbackMeta = FALLBACK_TRACKED_STOCKS.find(
    (s) => s.symbol === normalizedQuerySymbol || s.symbol === cleanSymbol,
  );

  // If not found in DB, use tracked metadata skeleton when available
  const baseMeta: IStockMetadata = stock
    ? (stock as unknown as IStockMetadata)
    : fallbackMeta
      ? buildFallbackStockMeta(fallbackMeta)
      : {
          _id: cleanSymbol,
          symbol: cleanSymbol,
          companyName: cleanSymbol,
          isin: '',
          sector: 'General',
          marketCapType: 'large',
          isActive: true,
          lastUpdated: new Date(),
        };

  let quote: StockQuoteResult | undefined = undefined;
  try {
    quote = await fetchStockQuote(cleanSymbol);
  } catch {
    // Quote may fail if market closed and no cache
  }

  return {
    ...baseMeta,
    quote,
  };
}

/**
 * Retrieves comprehensive quantitative fundamentals and valuation metrics.
 */
export async function getStockMetrics(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const cacheKey = `stock:${cleanSymbol}:metrics`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [storedMetrics, fundamentals, quote] = await Promise.allSettled([
    StockMetrics.findOne({ symbol: cleanSymbol }).lean(),
    fetchStockFundamentals(cleanSymbol),
    fetchStockQuote(cleanSymbol),
  ]);

  const metricsObj = storedMetrics.status === 'fulfilled' ? storedMetrics.value : null;
  const fundObj = fundamentals.status === 'fulfilled' ? fundamentals.value : null;
  const quoteObj = quote.status === 'fulfilled' ? quote.value : null;

  const result = {
    symbol: cleanSymbol,
    currentPrice: quoteObj?.currentPrice ?? 0,
    marketCap: quoteObj?.marketCap ?? metricsObj?.marketCap ?? 0,
    peRatioTTM: fundObj?.peRatioTTM ?? metricsObj?.peRatioTTM ?? null,
    peRatioForward: fundObj?.peRatioForward ?? metricsObj?.peRatioForward ?? null,
    pbRatio: fundObj?.pbRatio ?? metricsObj?.pbRatio ?? null,
    dividendYield: fundObj?.dividendYield ?? metricsObj?.dividendYield ?? null,
    roe: fundObj?.roe ?? metricsObj?.roe ?? null,
    debtToEquity: fundObj?.debtToEquity ?? metricsObj?.debtToEquity ?? null,
    epsTTM: fundObj?.epsTTM ?? metricsObj?.epsTTM ?? null,
    fiftyTwoWeekHigh: quoteObj?.fiftyTwoWeekHigh ?? metricsObj?.week52High ?? null,
    fiftyTwoWeekLow: quoteObj?.fiftyTwoWeekLow ?? metricsObj?.week52Low ?? null,
    beta: quoteObj?.beta ?? metricsObj?.beta ?? 1.0,
    dayChange: quoteObj ? quoteObj.currentPrice - quoteObj.previousClose : 0,
    dayChangePercent:
      quoteObj && quoteObj.previousClose > 0
        ? ((quoteObj.currentPrice - quoteObj.previousClose) / quoteObj.previousClose) * 100
        : 0,
    calculatedAt: new Date(),
  };

  await redisService.set(cacheKey, result, 86400);
  return result;
}

/**
 * Retrieves historical daily OHLCV candlestick series.
 */
export async function getStockHistory(
  symbol: string,
  timeframe: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' = '1Y',
) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const cacheKey = `stock:${cleanSymbol}:history:${timeframe}`;
  const ttl = isMarketHours() ? 900 : 86400;

  const cached = await redisService.get<{
    symbol: string;
    dates: string[];
    opens: number[];
    highs: number[];
    lows: number[];
    closes: number[];
    volumes: number[];
    adjustedCloses?: number[];
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6M':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case '3Y':
      startDate = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      break;
    case '5Y':
    default:
      startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const dbHistory = await StockPriceHistory.find({
    symbol: cleanSymbol,
    date: { $gte: startDate },
  })
    .sort({ date: 1 })
    .lean();

  let history: Array<{
    date: Date | string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose?: number;
  }> = dbHistory as unknown as Array<{
    date: Date | string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose?: number;
  }>;

  if (!history || history.length === 0) {
    try {
      history = await fetchStockPriceHistory(cleanSymbol, startDate, new Date(), '1d');
    } catch {
      history = [];
    }
  }

  const dates = history.map((h) => new Date(h.date).toISOString().slice(0, 10));
  const opens = history.map((h) => h.open);
  const highs = history.map((h) => h.high);
  const lows = history.map((h) => h.low);
  const closes = history.map((h) => h.close);
  const volumes = history.map((h) => h.volume);
  const adjustedCloses = history.map((h) => h.adjustedClose ?? h.close);

  const result = {
    symbol: cleanSymbol,
    dates,
    opens,
    highs,
    lows,
    closes,
    volumes,
    adjustedCloses,
  };

  await redisService.set(cacheKey, result, ttl);
  return result;
}

/**
 * Computes trend and momentum technical indicators.
 */
export async function getStockTechnical(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const rawTechnicals = await fetchStockTechnicals(cleanSymbol);

  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  const { lastClose, sma50, rsi } = rawTechnicals;

  if (sma50 !== null && rsi !== null) {
    if (lastClose > sma50 && rsi < 70) {
      trend = 'bullish';
    } else if (lastClose < sma50 && rsi > 30) {
      trend = 'bearish';
    }
  }

  return {
    ...rawTechnicals,
    trend,
  };
}
