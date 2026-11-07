import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAllocation } from '../../lib/services/allocationVerifier';
import { FundMetadata } from '../../lib/models/FundMetadata';
import { StockMetadata } from '../../lib/models/StockMetadata';
import * as mfapi from '../../lib/external/mfapi';
import * as yfinance from '../../lib/external/yfinance';
import { AppError } from '../../lib/errors/AppError';
import type { AllocationItem } from '../../lib/validators/aiResponse';

vi.mock('../../lib/models/FundMetadata', () => ({
  FundMetadata: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../lib/models/StockMetadata', () => ({
  StockMetadata: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../lib/external/mfapi', () => ({
  fetchSchemeDetail: vi.fn(),
}));

vi.mock('../../lib/external/yfinance', () => ({
  fetchStockQuote: vi.fn(),
}));

describe('allocationVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validMfItem: AllocationItem = {
    assetType: 'mutual_fund',
    name: 'UTI Nifty 50 Index Fund',
    isin: 'INF789F01XS6',
    schemeCode: 120716,
    ticker: null,
    category: 'large_cap',
    allocationPercent: 60,
    reason: 'Core index fund',
    expectedReturn: 12.0,
  };

  const validStockItem: AllocationItem = {
    assetType: 'stock',
    name: 'Reliance Industries',
    isin: null,
    schemeCode: null,
    ticker: 'RELIANCE',
    category: 'large_cap',
    allocationPercent: 40,
    reason: 'Market leader',
    expectedReturn: 14.0,
  };

  describe('mutual_fund verification', () => {
    it('passes and returns VERIFIED when schemeCode and matching ISIN exist in FundMetadata', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          schemeCode: 120716,
          isin: 'INF789F01XS6',
          schemeName: 'UTI Nifty 50 Index Fund',
        }),
      } as never);

      const result = await verifyAllocation([validMfItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
      expect(result.failure).toBeUndefined();
    });

    it('local hit never calls upstream mfapi', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          schemeCode: 120716,
          isin: 'INF789F01XS6',
          schemeName: 'UTI Nifty 50 Index Fund',
        }),
      } as never);

      const result = await verifyAllocation([validMfItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
      expect(mfapi.fetchSchemeDetail).not.toHaveBeenCalled();
    });

    it('falls back to mfapi when not in DB and succeeds if found with matching ISIN', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(mfapi.fetchSchemeDetail).mockResolvedValue({
        meta: {
          scheme_code: 120716,
          scheme_name: 'UTI Nifty 50 Index Fund',
          fund_house: 'UTI',
          scheme_type: 'Open Ended',
          scheme_category: 'Index',
          isin_growth: 'INF789F01XS6',
        },
        data: [{ date: '01-01-2024', nav: '150.00' }],
      });

      const result = await verifyAllocation([validMfItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
      expect(mfapi.fetchSchemeDetail).toHaveBeenCalledWith(120716);
    });

    it('rejects hallucinated code when mfapi returns 404 (REJECTED)', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(mfapi.fetchSchemeDetail).mockRejectedValue(
        new AppError('Mutual fund scheme not found', 404, 'NOT_FOUND'),
      );

      const hallucinatedItem: AllocationItem = {
        ...validMfItem,
        schemeCode: 999999,
      };

      const result = await verifyAllocation([hallucinatedItem]);
      expect(result.isValid).toBe(false);
      expect(result.overallStatus).toBe('REJECTED');
      expect(result.failure?.code).toBe(999999);
      expect(result.failure?.reason).toContain('does not exist in AMFI fund data');
    });

    it('marks as UNVERIFIABLE when mfapi times out or hits network error without rejecting', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(mfapi.fetchSchemeDetail).mockRejectedValue(
        new AppError('Request to mfapi.in timed out after 15s', 504, 'GATEWAY_TIMEOUT'),
      );

      const result = await verifyAllocation([validMfItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('UNVERIFIABLE');
      expect(result.unverifiedAssets?.length).toBe(1);
      expect(result.unverifiedAssets?.[0]?.code).toBe(120716);
      expect(result.unverifiedAssets?.[0]?.status).toBe('UNVERIFIABLE');
    });

    it('fails when schemeCode exists but provided ISIN conflicts with stored ISIN', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          schemeCode: 120716,
          isin: 'INF789F01XS6', // Official ISIN
        }),
      } as never);

      const conflictingItem: AllocationItem = {
        ...validMfItem,
        isin: 'INF111K01111', // Conflicting hallucinated ISIN
      };

      const result = await verifyAllocation([conflictingItem]);
      expect(result.isValid).toBe(false);
      expect(result.overallStatus).toBe('REJECTED');
      expect(result.failure?.code).toBe(120716);
      expect(result.failure?.reason).toContain('ISIN conflict');
    });

    it('fails when mutual fund is missing numeric schemeCode', async () => {
      const invalidItem = {
        ...validMfItem,
        schemeCode: null as unknown as number,
      };

      const result = await verifyAllocation([invalidItem]);
      expect(result.isValid).toBe(false);
      expect(result.overallStatus).toBe('REJECTED');
      expect(result.failure?.reason).toContain('Invalid or missing numeric schemeCode');
    });
  });

  describe('stock verification', () => {
    it('passes and returns VERIFIED when symbol resolves in StockMetadata', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Ltd',
        }),
      } as never);

      const result = await verifyAllocation([validStockItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
    });

    it('local hit never calls upstream stock quote service', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Ltd',
        }),
      } as never);

      const result = await verifyAllocation([validStockItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
      expect(yfinance.fetchStockQuote).not.toHaveBeenCalled();
    });

    it('falls back to stock quote when not in DB and succeeds', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(yfinance.fetchStockQuote).mockResolvedValue({
        symbol: 'RELIANCE',
        currentPrice: 2500,
        previousClose: 2480,
        open: 2490,
        dayHigh: 2510,
        dayLow: 2475,
        volume: 1000000,
        marketCap: 1700000000000,
        fiftyTwoWeekHigh: 2600,
        fiftyTwoWeekLow: 2000,
        beta: 1.1,
        currency: 'INR',
      });

      const result = await verifyAllocation([validStockItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('VERIFIED');
      expect(yfinance.fetchStockQuote).toHaveBeenCalledWith('RELIANCE');
    });

    it('rejects when stock ticker returns 404 (REJECTED)', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(yfinance.fetchStockQuote).mockRejectedValue(
        new AppError('Stock symbol FAKECOMPANY not found on NSE', 404, 'NOT_FOUND'),
      );

      const hallucinatedStock: AllocationItem = {
        ...validStockItem,
        ticker: 'FAKECOMPANY',
      };

      const result = await verifyAllocation([hallucinatedStock]);
      expect(result.isValid).toBe(false);
      expect(result.overallStatus).toBe('REJECTED');
      expect(result.failure?.code).toBe('FAKECOMPANY');
      expect(result.failure?.reason).toContain('not found on NSE');
    });

    it('marks as UNVERIFIABLE when stock service times out or hits 502', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(yfinance.fetchStockQuote).mockRejectedValue(
        new AppError('Yahoo Finance quote error for RELIANCE: 502 Bad Gateway', 502, 'EXTERNAL_API_ERROR'),
      );

      const result = await verifyAllocation([validStockItem]);
      expect(result.isValid).toBe(true);
      expect(result.overallStatus).toBe('UNVERIFIABLE');
      expect(result.unverifiedAssets?.length).toBe(1);
    });
  });
});
