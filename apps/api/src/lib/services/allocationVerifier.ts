import mongoose from 'mongoose';
import { FundMetadata } from '../models/FundMetadata';
import { StockMetadata } from '../models/StockMetadata';
import { fetchSchemeDetail } from '../external/mfapi';
import { fetchStockQuote } from '../external/yfinance';
import type { AllocationItem } from '../validators/aiResponse';

export interface AllocationVerificationFailure {
  assetType: 'mutual_fund' | 'stock';
  code: string | number;
  reason: string;
}

export interface AllocationVerificationResult {
  isValid: boolean;
  failure?: AllocationVerificationFailure;
}

const TOLERANT_LOOKUP_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Lookup timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Verifies that each mutual fund in an allocation exists in AMFI fund data (FundMetadata or mfapi)
 * and that any provided ISIN matches the stored/official ISIN without conflicts.
 * Also verifies that each stock ticker resolves via the stock service.
 * Does NOT alter or rewrite codes.
 */
export async function verifyAllocation(
  allocation: AllocationItem[],
): Promise<AllocationVerificationResult> {
  const isDbAvailable =
    mongoose.connection.readyState === 1 ||
    typeof (FundMetadata.findOne as unknown as { mock?: unknown })?.mock !== 'undefined';

  for (const item of allocation) {
    if (item.assetType === 'mutual_fund') {
      if (item.schemeCode === null || item.schemeCode === undefined || typeof item.schemeCode !== 'number') {
        return {
          isValid: false,
          failure: {
            assetType: 'mutual_fund',
            code: item.schemeCode ?? 'unknown',
            reason: `Invalid or missing numeric schemeCode for mutual fund "${item.name}"`,
          },
        };
      }

      let storedIsin: string | null = null;
      let fundFound = false;

      // 1. Try local MongoDB FundMetadata
      if (isDbAvailable) {
        try {
          const doc = await FundMetadata.findOne({ schemeCode: item.schemeCode }).lean();
          if (doc) {
            fundFound = true;
            storedIsin = doc.isin ? doc.isin.trim().toUpperCase() : null;
          }
        } catch {
          // Ignore DB read errors and proceed to fallback wrapper
        }
      }

      // 2. If not found in local DB, attempt lookup via mfapi wrapper with tolerant timeout
      if (!fundFound) {
        try {
          const extDetail = await withTimeout(fetchSchemeDetail(item.schemeCode), TOLERANT_LOOKUP_TIMEOUT_MS);
          if (extDetail?.meta?.scheme_code) {
            fundFound = true;
            storedIsin = extDetail.meta.isin_growth
              ? extDetail.meta.isin_growth.trim().toUpperCase()
              : null;
          }
        } catch {
          // 404 or timeout means fund scheme does not exist
          fundFound = false;
        }
      }

      if (!fundFound) {
        return {
          isValid: false,
          failure: {
            assetType: 'mutual_fund',
            code: item.schemeCode,
            reason: `Scheme code ${item.schemeCode} does not exist in AMFI fund data`,
          },
        };
      }

      // Check for ISIN conflict if we store an ISIN and the allocation item provides one
      const providedIsin = item.isin ? item.isin.trim().toUpperCase() : null;
      if (storedIsin && providedIsin && storedIsin !== providedIsin) {
        return {
          isValid: false,
          failure: {
            assetType: 'mutual_fund',
            code: item.schemeCode,
            reason: `ISIN conflict for schemeCode ${item.schemeCode}: provided "${providedIsin}", stored "${storedIsin}"`,
          },
        };
      }
    } else if (item.assetType === 'stock') {
      if (!item.ticker || typeof item.ticker !== 'string' || item.ticker.trim().length === 0) {
        return {
          isValid: false,
          failure: {
            assetType: 'stock',
            code: item.ticker ?? 'unknown',
            reason: 'Missing stock ticker symbol',
          },
        };
      }

      const cleanSymbol = item.ticker.toUpperCase().replace(/\.NS$/, '').trim();
      let stockFound = false;

      // 1. Try local MongoDB StockMetadata
      const isStockDbAvailable =
        mongoose.connection.readyState === 1 ||
        typeof (StockMetadata.findOne as unknown as { mock?: unknown })?.mock !== 'undefined';

      if (isStockDbAvailable) {
        try {
          const doc = await StockMetadata.findOne({ symbol: cleanSymbol }).lean();
          if (doc) {
            stockFound = true;
          }
        } catch {
          // Ignore DB error and proceed to external service check
        }
      }

      // 2. Fall back to stock service fetch with tolerant timeout
      if (!stockFound) {
        try {
          const quote = await withTimeout(fetchStockQuote(cleanSymbol), TOLERANT_LOOKUP_TIMEOUT_MS);
          if (quote?.symbol) {
            stockFound = true;
          }
        } catch {
          stockFound = false;
        }
      }

      if (!stockFound) {
        return {
          isValid: false,
          failure: {
            assetType: 'stock',
            code: cleanSymbol,
            reason: `Stock symbol "${cleanSymbol}" failed to resolve via stock service`,
          },
        };
      }
    }
  }

  return { isValid: true };
}
