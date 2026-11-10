import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockQuoteFn = vi.fn();
const mockHistoricalFn = vi.fn();
const mockSummaryFn = vi.fn();

vi.mock('yahoo-finance2', () => ({
  default: class MockYahooFinance {
    constructor(public opts?: Record<string, unknown>) {}
    quote = mockQuoteFn;
    historical = mockHistoricalFn;
    quoteSummary = mockSummaryFn;
  },
}));

vi.mock('../../lib/db/redis');

import * as yfinance from '../../lib/external/yfinance';
import * as redisService from '../../lib/db/redis';

describe('Yahoo Finance v4 Constructor Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('instantiates class export and fetches quotes and adjClose history cleanly', async () => {
    vi.mocked(redisService.get).mockResolvedValue(null as never);
    vi.mocked(redisService.set).mockResolvedValue('OK' as never);

    mockQuoteFn.mockResolvedValue({
      regularMarketPrice: 1325.5,
      regularMarketPreviousClose: 1310,
      regularMarketOpen: 1312,
      regularMarketDayHigh: 1330,
      regularMarketDayLow: 1308,
      regularMarketVolume: 500000,
      marketCap: 1800000000000,
      fiftyTwoWeekHigh: 1600,
      fiftyTwoWeekLow: 1150,
      beta: 1.05,
      currency: 'INR',
    });

    const quote = await yfinance.fetchStockQuote('RELIANCE');
    expect(quote.symbol).toBe('RELIANCE');
    expect(quote.currentPrice).toBe(1325.5);
    expect(mockQuoteFn).toHaveBeenCalledWith('RELIANCE.NS');

    mockHistoricalFn.mockResolvedValue([
      {
        date: new Date('2026-11-01T00:00:00Z'),
        open: 1300,
        high: 1330,
        low: 1295,
        close: 1320,
        adjClose: 1318,
        volume: 100000,
      },
    ]);

    const history = await yfinance.fetchStockPriceHistory('RELIANCE', new Date('2026-10-01'));
    expect(history).toHaveLength(1);
    expect(history[0]?.adjustedClose).toBe(1318);
  });
});
