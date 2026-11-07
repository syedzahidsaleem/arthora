import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAllocation } from '../../lib/services/allocationVerifier';
import { FundMetadata } from '../../lib/models/FundMetadata';
import { StockMetadata } from '../../lib/models/StockMetadata';
import * as mfapi from '../../lib/external/mfapi';
import * as yfinance from '../../lib/external/yfinance';
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
    it('passes when schemeCode and matching ISIN exist in FundMetadata', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          schemeCode: 120716,
          isin: 'INF789F01XS6',
          schemeName: 'UTI Nifty 50 Index Fund',
        }),
      } as never);

      const result = await verifyAllocation([validMfItem]);
      expect(result.isValid).toBe(true);
      expect(result.failure).toBeUndefined();
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
    });

    it('fails when schemeCode is hallucinated (neither in DB nor mfapi)', async () => {
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(mfapi.fetchSchemeDetail).mockRejectedValue(new Error('Not found'));

      const hallucinatedItem: AllocationItem = {
        ...validMfItem,
        schemeCode: 999999,
      };

      const result = await verifyAllocation([hallucinatedItem]);
      expect(result.isValid).toBe(false);
      expect(result.failure?.code).toBe(999999);
      expect(result.failure?.reason).toContain('does not exist in AMFI fund data');
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
      expect(result.failure?.reason).toContain('Invalid or missing numeric schemeCode');
    });
  });

  describe('stock verification', () => {
    it('passes when symbol resolves in StockMetadata', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Ltd',
        }),
      } as never);

      const result = await verifyAllocation([validStockItem]);
      expect(result.isValid).toBe(true);
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
    });

    it('fails when stock ticker cannot be resolved via DB or quote service', async () => {
      vi.mocked(StockMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      vi.mocked(yfinance.fetchStockQuote).mockRejectedValue(new Error('Symbol not found'));

      const hallucinatedStock: AllocationItem = {
        ...validStockItem,
        ticker: 'FAKECOMPANY',
      };

      const result = await verifyAllocation([hallucinatedStock]);
      expect(result.isValid).toBe(false);
      expect(result.failure?.code).toBe('FAKECOMPANY');
      expect(result.failure?.reason).toContain('failed to resolve via stock service');
    });
  });
});
