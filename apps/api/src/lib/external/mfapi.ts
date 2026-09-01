import { AppError } from '../errors/AppError';
import * as redisService from '../db/redis';

const BASE_URL = 'https://api.mfapi.in/mf';
const TIMEOUT_MS = 15000;

export interface MFSchemeListItem {
  schemeCode: number;
  schemeName: string;
}

export interface MFSchemeDetail {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: Array<{
    date: string; // "DD-MM-YYYY"
    nav: string;
  }>;
}

export interface NAVPoint {
  date: Date;
  nav: number;
}

/**
 * Parses Indian "DD-MM-YYYY" date string into standard UTC Date object.
 */
export function parseDMYDate(dateStr: string): Date {
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1;
    const year = parseInt(parts[2]!, 10);
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(dateStr);
}

/**
 * Core fetch helper with 15-second AbortController timeout.
 */
async function fetchWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(`Mutual fund scheme not found at ${url}`, 404, 'NOT_FOUND');
      }
      throw new AppError(
        `External API error: HTTP ${response.status} from mfapi.in`,
        502,
        'EXTERNAL_API_ERROR',
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('Request to mfapi.in timed out after 15s', 504, 'GATEWAY_TIMEOUT');
    }
    throw new AppError('External API unavailable', 502, 'EXTERNAL_API_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches all AMFI mutual fund scheme listings.
 * Cached in Redis with TTL 86400s (24 hours).
 */
export async function fetchAllSchemes(): Promise<MFSchemeListItem[]> {
  const cacheKey = 'fund:all_schemes';
  const cached = await redisService.get<MFSchemeListItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const rawData = (await fetchWithTimeout(BASE_URL)) as MFSchemeListItem[];
  if (!Array.isArray(rawData)) {
    throw new AppError('Invalid response format from mfapi.in for all schemes', 502, 'EXTERNAL_API_ERROR');
  }

  await redisService.set(cacheKey, rawData, 86400);
  return rawData;
}

/**
 * Fetches metadata and raw NAV data for a specific mutual fund scheme.
 * Cached in Redis with TTL 3600s (1 hour).
 */
export async function fetchSchemeDetail(schemeCode: number): Promise<MFSchemeDetail> {
  const cacheKey = `fund:${schemeCode}:detail`;
  const cached = await redisService.get<MFSchemeDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  const rawData = (await fetchWithTimeout(`${BASE_URL}/${schemeCode}`)) as MFSchemeDetail;
  if (!rawData || !rawData.meta || !Array.isArray(rawData.data)) {
    throw new AppError(`Scheme ${schemeCode} returned invalid data from mfapi.in`, 404, 'NOT_FOUND');
  }

  await redisService.set(cacheKey, rawData, 3600);
  return rawData;
}

/**
 * Fetches complete historical NAV series, parsed and sorted ascending by date.
 * Cached in Redis with TTL 3600s (1 hour).
 */
export async function fetchNAVHistory(schemeCode: number): Promise<NAVPoint[]> {
  const cacheKey = `fund:${schemeCode}:nav`;
  const cached = await redisService.get<Array<{ date: string; nav: number }>>(cacheKey);
  if (cached) {
    return cached.map((item) => ({
      date: new Date(item.date),
      nav: item.nav,
    }));
  }

  const detail = await fetchSchemeDetail(schemeCode);
  if (!detail.data || detail.data.length === 0) {
    return [];
  }

  const parsedHistory: NAVPoint[] = detail.data
    .map((item) => ({
      date: parseDMYDate(item.date),
      nav: parseFloat(item.nav),
    }))
    .filter((item) => !isNaN(item.nav) && !isNaN(item.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort ascending

  await redisService.set(cacheKey, parsedHistory, 3600);
  return parsedHistory;
}

/**
 * Fetches the latest published NAV for a scheme.
 */
export async function fetchLatestNAV(
  schemeCode: number,
): Promise<{ nav: number; date: Date }> {
  const detail = await fetchSchemeDetail(schemeCode);
  const first = detail.data[0];
  if (!first) {
    throw new AppError(`No NAV data available for scheme ${schemeCode}`, 404, 'NOT_FOUND');
  }

  const nav = parseFloat(first.nav);
  const date = parseDMYDate(first.date);

  if (isNaN(nav) || isNaN(date.getTime())) {
    throw new AppError(`Invalid latest NAV values for scheme ${schemeCode}`, 502, 'EXTERNAL_API_ERROR');
  }

  return { nav, date };
}
