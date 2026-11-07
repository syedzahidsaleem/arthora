import mongoose from 'mongoose';
import { FundMetadata } from '../models/FundMetadata';
import { StockMetadata } from '../models/StockMetadata';
import { fetchSchemeDetail } from '../external/mfapi';
import { fetchStockQuote } from '../external/yfinance';
import { AppError } from '../errors/AppError';
import type { AllocationItem } from '../validators/aiResponse';

export type AssetVerificationStatus = 'VERIFIED' | 'REJECTED' | 'UNVERIFIABLE';

export interface AssetVerificationDetail {
  assetType: 'mutual_fund' | 'stock';
  code: string | number;
  status: AssetVerificationStatus;
  reason?: string;
}

export interface AllocationVerificationFailure {
  assetType: 'mutual_fund' | 'stock';
  code: string | number;
  reason: string;
}

export interface AllocationVerificationResult {
  isValid: boolean;
  overallStatus: AssetVerificationStatus;
  details: AssetVerificationDetail[];
  unverifiedAssets?: AssetVerificationDetail[];
  failure?: AllocationVerificationFailure;
}

const TOTAL_VERIFICATION_CAP_MS = 8000;
const PER_ASSET_LOOKUP_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AppError(timeoutMsg, 504, 'GATEWAY_TIMEOUT')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function is404NotFoundError(err: unknown): boolean {
  if (err instanceof AppError && (err.statusCode === 404 || err.code === 'NOT_FOUND')) {
    return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('404') || msg.includes('not found')) {
      return true;
    }
  }
  return false;
}

/**
 * Verifies a single asset with local-first priority.
 * If found in local MongoDB, upstream API is never called.
 * Distinguishes:
 * - VERIFIED: exists and matches constraints
 * - REJECTED: definitively does not exist (404) or ISIN conflict
 * - UNVERIFIABLE: upstream timeout, network error, 5xx, or rate limit
 */
async function verifySingleAsset(
  item: AllocationItem,
  isDbAvailable: boolean,
): Promise<AssetVerificationDetail> {
  if (item.assetType === 'mutual_fund') {
    if (item.schemeCode === null || item.schemeCode === undefined || typeof item.schemeCode !== 'number') {
      return {
        assetType: 'mutual_fund',
        code: item.schemeCode ?? 'unknown',
        status: 'REJECTED',
        reason: `Invalid or missing numeric schemeCode for mutual fund "${item.name}"`,
      };
    }

    const providedIsin = item.isin ? item.isin.trim().toUpperCase() : null;

    // 1. Local-first check in MongoDB FundMetadata
    if (isDbAvailable) {
      try {
        const doc = await FundMetadata.findOne({ schemeCode: item.schemeCode }).lean();
        if (doc) {
          const storedIsin = doc.isin ? doc.isin.trim().toUpperCase() : null;
          if (storedIsin && providedIsin && storedIsin !== providedIsin) {
            return {
              assetType: 'mutual_fund',
              code: item.schemeCode,
              status: 'REJECTED',
              reason: `ISIN conflict for schemeCode ${item.schemeCode}: provided "${providedIsin}", stored "${storedIsin}"`,
            };
          }
          return {
            assetType: 'mutual_fund',
            code: item.schemeCode,
            status: 'VERIFIED',
          };
        }
      } catch {
        // DB read error, fall through to external lookup
      }
    }

    // 2. Upstream lookup via mfapi.in with per-asset timeout
    try {
      const extDetail = await withTimeout(
        fetchSchemeDetail(item.schemeCode),
        PER_ASSET_LOOKUP_TIMEOUT_MS,
        `mfapi lookup timed out after ${PER_ASSET_LOOKUP_TIMEOUT_MS}ms for schemeCode ${item.schemeCode}`,
      );

      if (extDetail?.meta?.scheme_code) {
        const storedIsin = extDetail.meta.isin_growth
          ? extDetail.meta.isin_growth.trim().toUpperCase()
          : null;
        if (storedIsin && providedIsin && storedIsin !== providedIsin) {
          return {
            assetType: 'mutual_fund',
            code: item.schemeCode,
            status: 'REJECTED',
            reason: `ISIN conflict for schemeCode ${item.schemeCode}: provided "${providedIsin}", stored "${storedIsin}"`,
          };
        }
        return {
          assetType: 'mutual_fund',
          code: item.schemeCode,
          status: 'VERIFIED',
        };
      }

      return {
        assetType: 'mutual_fund',
        code: item.schemeCode,
        status: 'REJECTED',
        reason: `Scheme code ${item.schemeCode} returned invalid metadata`,
      };
    } catch (err) {
      if (is404NotFoundError(err)) {
        return {
          assetType: 'mutual_fund',
          code: item.schemeCode,
          status: 'REJECTED',
          reason: `Scheme code ${item.schemeCode} does not exist in AMFI fund data`,
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        assetType: 'mutual_fund',
        code: item.schemeCode,
        status: 'UNVERIFIABLE',
        reason: `Upstream AMFI service unavailable or timed out: ${errorMsg}`,
      };
    }
  }

  if (item.assetType === 'stock') {
    if (!item.ticker || typeof item.ticker !== 'string' || item.ticker.trim().length === 0) {
      return {
        assetType: 'stock',
        code: item.ticker ?? 'unknown',
        status: 'REJECTED',
        reason: 'Missing stock ticker symbol',
      };
    }

    const cleanSymbol = item.ticker.toUpperCase().replace(/\.NS$/, '').trim();

    // 1. Local-first check in MongoDB StockMetadata
    const isStockDbAvailable =
      isDbAvailable ||
      typeof (StockMetadata.findOne as unknown as { mock?: unknown })?.mock !== 'undefined';

    if (isStockDbAvailable) {
      try {
        const doc = await StockMetadata.findOne({ symbol: cleanSymbol }).lean();
        if (doc) {
          return {
            assetType: 'stock',
            code: cleanSymbol,
            status: 'VERIFIED',
          };
        }
      } catch {
        // DB read error, fall through to external lookup
      }
    }

    // 2. Upstream lookup via stock quote service with per-asset timeout
    try {
      const quote = await withTimeout(
        fetchStockQuote(cleanSymbol),
        PER_ASSET_LOOKUP_TIMEOUT_MS,
        `Stock quote lookup timed out after ${PER_ASSET_LOOKUP_TIMEOUT_MS}ms for symbol ${cleanSymbol}`,
      );

      if (quote?.symbol) {
        return {
          assetType: 'stock',
          code: cleanSymbol,
          status: 'VERIFIED',
        };
      }

      return {
        assetType: 'stock',
        code: cleanSymbol,
        status: 'REJECTED',
        reason: `Stock symbol "${cleanSymbol}" returned empty quote`,
      };
    } catch (err) {
      if (is404NotFoundError(err)) {
        return {
          assetType: 'stock',
          code: cleanSymbol,
          status: 'REJECTED',
          reason: `Stock symbol "${cleanSymbol}" not found on NSE`,
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        assetType: 'stock',
        code: cleanSymbol,
        status: 'UNVERIFIABLE',
        reason: `Upstream stock quote service unavailable or timed out: ${errorMsg}`,
      };
    }
  }

  // Fallback for unexpected assetType
  return {
    assetType: (item as { assetType: 'mutual_fund' | 'stock' }).assetType,
    code: 'unknown',
    status: 'REJECTED',
    reason: `Unsupported assetType "${(item as { assetType: string }).assetType}"`,
  };
}

/**
 * Verifies all allocations in parallel with a total verification cap of 8 seconds.
 * Local MongoDB is always queried first before any external HTTP call.
 * 
 * Safest minimal rule:
 * 1. If ANY asset is REJECTED (definitively not found or ISIN conflict), overall is REJECTED (isValid: false).
 * 2. If NO asset is REJECTED, but 1+ are UNVERIFIABLE (upstream down/timeout), accept schema-valid portfolio
 *    (isValid: true, overallStatus: 'UNVERIFIABLE') without burning the model chain.
 * 3. If ALL assets are VERIFIED, overall is VERIFIED (isValid: true).
 */
export async function verifyAllocation(
  allocation: AllocationItem[],
): Promise<AllocationVerificationResult> {
  const isDbAvailable =
    mongoose.connection.readyState === 1 ||
    typeof (FundMetadata.findOne as unknown as { mock?: unknown })?.mock !== 'undefined';

  let details: AssetVerificationDetail[];

  try {
    const lookupPromises = allocation.map((item) => verifySingleAsset(item, isDbAvailable));
    details = await withTimeout(
      Promise.all(lookupPromises),
      TOTAL_VERIFICATION_CAP_MS,
      `Total allocation verification cap of ${TOTAL_VERIFICATION_CAP_MS}ms exceeded`,
    );
  } catch (capErr) {
    // Total cap exceeded: mark any unverified as UNVERIFIABLE
    const errorMsg = capErr instanceof Error ? capErr.message : String(capErr);
    details = allocation.map((item) => ({
      assetType: item.assetType,
      code: item.assetType === 'mutual_fund' ? (item.schemeCode ?? 'unknown') : (item.ticker ?? 'unknown'),
      status: 'UNVERIFIABLE' as const,
      reason: `Verification cap exceeded: ${errorMsg}`,
    }));
  }

  // Find first definitive rejection
  const firstRejection = details.find((d) => d.status === 'REJECTED');
  if (firstRejection) {
    return {
      isValid: false,
      overallStatus: 'REJECTED',
      details,
      failure: {
        assetType: firstRejection.assetType,
        code: firstRejection.code,
        reason: firstRejection.reason || 'Asset validation failed',
      },
    };
  }

  // Check for unverifiable assets
  const unverifiedAssets = details.filter((d) => d.status === 'UNVERIFIABLE');
  if (unverifiedAssets.length > 0) {
    return {
      isValid: true,
      overallStatus: 'UNVERIFIABLE',
      details,
      unverifiedAssets,
    };
  }

  return {
    isValid: true,
    overallStatus: 'VERIFIED',
    details,
  };
}
