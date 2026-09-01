import crypto from 'crypto';
import { FundMetadata } from '../models/FundMetadata';
import { FundNAVHistory } from '../models/FundNAVHistory';
import { FundMetrics } from '../models/FundMetrics';
import { FundHoldings } from '../models/FundHoldings';
import { FundSectorAlloc } from '../models/FundSectorAlloc';
import { AppError } from '../errors/AppError';
import * as redisService from '../db/redis';
import { fetchNAVHistory, fetchLatestNAV } from '../external/mfapi';
import { metricCalcQueue } from '../../workers/metricCalcWorker';
import type { IFundMetadata, PaginatedData } from '@arthora/shared';

export interface FundSearchFilters {
  category?: string;
  fundHouse?: string;
  page?: number;
  limit?: number;
}

export interface FundSearchResult extends IFundMetadata {
  latestNAV?: number;
  latestNAVDate?: Date;
}

/**
 * Searches AMFI mutual funds with text score ranking, category/fundHouse filters, and pagination.
 */
export async function searchFunds(
  query?: string,
  filters: FundSearchFilters = {},
): Promise<PaginatedData<FundSearchResult>> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const cachePayload = { query: query || '', ...filters, page, limit };
  const cacheHash = crypto.createHash('sha256').update(JSON.stringify(cachePayload)).digest('hex');
  const cacheKey = `fund:search:${cacheHash}`;

  const cached = await redisService.get<PaginatedData<FundSearchResult>>(cacheKey);
  if (cached) {
    return cached;
  }

  const filterQuery: Record<string, unknown> = { isActive: true };

  if (query && query.trim().length > 0) {
    filterQuery.$text = { $search: query.trim() };
  }

  if (filters.category && filters.category !== 'all') {
    filterQuery.category = filters.category;
  }

  if (filters.fundHouse) {
    filterQuery.fundHouse = { $regex: new RegExp(filters.fundHouse, 'i') };
  }

  const sortOptions = query && query.trim().length > 0
    ? { score: { $meta: 'textScore' } }
    : { schemeName: 1 };

  const [items, total] = await Promise.all([
    FundMetadata.find(
      filterQuery,
      query && query.trim().length > 0 ? { score: { $meta: 'textScore' } } : {},
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort(sortOptions as any)
      .skip(skip)
      .limit(limit)
      .lean(),
    FundMetadata.countDocuments(filterQuery),
  ]);

  const totalPages = Math.ceil(total / limit);
  const result: PaginatedData<FundSearchResult> = {
    items: items as unknown as FundSearchResult[],
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
 * Retrieves comprehensive scheme details and latest published NAV.
 */
export async function getFundDetail(schemeCode: number): Promise<FundSearchResult> {
  const cacheKey = `fund:${schemeCode}:detail`;
  const cached = await redisService.get<FundSearchResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const fund = await FundMetadata.findOne({ schemeCode }).lean();
  if (!fund) {
    throw new AppError(`Mutual fund scheme with code ${schemeCode} not found`, 404, 'NOT_FOUND');
  }

  // Get latest NAV from DB or external fallback
  let latestNAV = 0;
  let latestNAVDate: Date | undefined = undefined;

  const latestDoc = await FundNAVHistory.findOne({ schemeCode }).sort({ date: -1 }).lean();
  if (latestDoc) {
    latestNAV = latestDoc.nav;
    latestNAVDate = new Date(latestDoc.date);
  } else {
    try {
      const ext = await fetchLatestNAV(schemeCode);
      latestNAV = ext.nav;
      latestNAVDate = ext.date;
    } catch {
      // ignore fallback error
    }
  }

  const result: FundSearchResult = {
    ...(fund as unknown as IFundMetadata),
    latestNAV,
    latestNAVDate,
  };

  await redisService.set(cacheKey, result, 3600);
  return result;
}

/**
 * Retrieves computed risk and return analytics for a scheme or queues calculation.
 */
export async function getFundMetrics(schemeCode: number) {
  const cacheKey = `fund:${schemeCode}:metrics`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return { isPending: false, data: cached };
  }

  const metrics = await FundMetrics.findOne({ schemeCode }).lean();
  if (!metrics) {
    // Queue asynchronous calculation
    await metricCalcQueue.add(
      'calc-fund-metrics',
      { schemeCode },
      { jobId: `calc-${schemeCode}-${Date.now()}` },
    );

    return {
      isPending: true,
      data: {
        status: 'calculating',
        pollUrl: `/api/v1/funds/${schemeCode}/metrics`,
        message: 'Fund metrics are being calculated in the background.',
      },
    };
  }

  await redisService.set(cacheKey, metrics, 3600);
  return { isPending: false, data: metrics };
}

/**
 * Retrieves date-filtered NAV series for charts and trend visualizations.
 */
export async function getFundNAVHistory(
  schemeCode: number,
  timeframe: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'max' = '1Y',
) {
  const cacheKey = `fund:${schemeCode}:nav:${timeframe}`;
  const cached = await redisService.get<{
    schemeCode: number;
    dates: string[];
    navs: number[];
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const now = new Date();
  let startDate: Date | undefined = undefined;

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
      startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      break;
    case 'max':
    default:
      startDate = undefined;
      break;
  }

  const query: Record<string, unknown> = { schemeCode };
  if (startDate) {
    query.date = { $gte: startDate };
  }

  const dbPoints = await FundNAVHistory.find(query).sort({ date: 1 }).lean();

  let points: Array<{ date: Date | string; nav: number }> = dbPoints as unknown as Array<{ date: Date | string; nav: number }>;
  if (!points || points.length === 0) {
    const rawExternal = await fetchNAVHistory(schemeCode);
    if (startDate) {
      points = rawExternal.filter((p) => new Date(p.date) >= startDate!);
    } else {
      points = rawExternal;
    }
  }

  const dates = points.map((p) => new Date(p.date).toISOString().slice(0, 10));
  const navs = points.map((p) => p.nav);

  const result = {
    schemeCode,
    dates,
    navs,
  };

  await redisService.set(cacheKey, result, 3600);
  return result;
}

/**
 * Retrieves latest portfolio asset holdings.
 */
export async function getFundHoldings(schemeCode: number) {
  const cacheKey = `fund:${schemeCode}:holdings`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const holdings = await FundHoldings.findOne({ schemeCode }).sort({ reportDate: -1 }).lean();
  if (holdings) {
    await redisService.set(cacheKey, holdings, 86400);
  }
  return holdings;
}

/**
 * Retrieves latest sector distribution percentages.
 */
export async function getFundSectorAlloc(schemeCode: number) {
  const cacheKey = `fund:${schemeCode}:sector`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const sectorAlloc = await FundSectorAlloc.findOne({ schemeCode }).sort({ reportDate: -1 }).lean();
  if (sectorAlloc) {
    await redisService.set(cacheKey, sectorAlloc, 86400);
  }
  return sectorAlloc;
}

/**
 * Finds top performing peer funds within the same AMFI category.
 */
export async function getFundPeers(schemeCode: number, limit = 5) {
  const cacheKey = `fund:${schemeCode}:peers`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const currentFund = await FundMetadata.findOne({ schemeCode }).lean();
  if (!currentFund) {
    throw new AppError(`Fund with code ${schemeCode} not found`, 404, 'NOT_FOUND');
  }

  const category = currentFund.category;
  const peerFunds = await FundMetadata.find({
    category,
    schemeCode: { $ne: schemeCode },
    isActive: true,
  })
    .limit(limit * 3)
    .lean();

  const peerCodes = peerFunds.map((f) => f.schemeCode);
  const peerMetrics = await FundMetrics.find({ schemeCode: { $in: peerCodes } }).lean();

  const metricsMap = new Map(peerMetrics.map((m) => [m.schemeCode, m]));

  const peers = peerFunds
    .map((f) => {
      const metric = metricsMap.get(f.schemeCode);
      return {
        schemeCode: f.schemeCode,
        schemeName: f.schemeName,
        fundHouse: f.fundHouse,
        category: f.category,
        cagr1Y: metric?.cagr1Y,
        cagr3Y: metric?.cagr3Y,
        cagr5Y: metric?.cagr5Y,
        expenseRatio: metric?.expenseRatio,
        aum: metric?.aum,
      };
    })
    .sort((a, b) => (b.cagr3Y || 0) - (a.cagr3Y || 0))
    .slice(0, limit);

  await redisService.set(cacheKey, peers, 86400);
  return peers;
}

/**
 * Returns distinct AMFI fund categories.
 */
export async function getFundCategories(): Promise<string[]> {
  const cacheKey = 'fund:categories';
  const cached = await redisService.get<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const categories = await FundMetadata.distinct('category', { isActive: true });
  const sorted = categories.filter(Boolean).sort();
  await redisService.set(cacheKey, sorted, 86400);
  return sorted;
}
