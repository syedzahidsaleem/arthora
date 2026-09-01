import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yfinance from '../../lib/external/yfinance';
import * as redisService from '../../lib/db/redis';
import yahooFinance from 'yahoo-finance2';
import { AppError } from '../../lib/errors/AppError';

vi.mock('yahoo-finance2', () => ({
  default: {
    quote: vi.fn(),
    quoteSummary: vi.fn(),
    historical: vi.fn(),
  },
}));

vi.mock('../../lib/db/redis');

describe('Yahoo Finance Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isMarketHours', () => {
    it('returns true during IST trading hours on a Wednesday', () => {
      // 2024-01-10 is a Wednesday. 11:00 AM IST = 05:30 UTC
      const marketOpenTime = new Date('2024-01-10T05:30:00.000Z');
      expect(yfinance.isMarketHours(marketOpenTime)).toBe(true);
    });

    it('returns false during weekend', () => {
      // 2024-01-13 is a Saturday
      const weekendTime = new Date('2024-01-13T05:30:00.000Z');
      expect(yfinance.isMarketHours(weekendTime)).toBe(false);
    });
  });

  describe('fetchStockQuote', () => {
    it('returns cached quote on Redis hit without invoking Yahoo Finance API', async () => {
      const cached = {
        symbol: 'RELIANCE',
        currentPrice: 2800,
        previousClose: 2780,
        open: 2790,
        dayHigh: 2820,
        dayLow: 2770,
        volume: 5000000,
        marketCap: 1800000000000,
        fiftyTwoWeekHigh: 3000,
        fiftyTwoWeekLow: 2200,
        beta: 1.1,
        currency: 'INR',
      };

      vi.mocked(redisService.get).mockResolvedValue(cached as never);

      const quote = await yfinance.fetchStockQuote('RELIANCE');
      expect(quote).toEqual(cached);
      expect(yahooFinance.quote).not.toHaveBeenCalled();
    });

    it('fetches quote from yahoo-finance2 and sets Redis on cache miss', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      vi.mocked(yahooFinance.quote).mockResolvedValue({
        regularMarketPrice: 3500,
        regularMarketPreviousClose: 3450,
        regularMarketOpen: 3460,
        regularMarketDayHigh: 3520,
        regularMarketDayLow: 3440,
        regularMarketVolume: 1200000,
        marketCap: 1200000000000,
        fiftyTwoWeekHigh: 4000,
        fiftyTwoWeekLow: 3100,
        beta: 0.9,
        currency: 'INR',
      } as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const quote = await yfinance.fetchStockQuote('TCS');
      expect(quote.symbol).toBe('TCS');
      expect(quote.currentPrice).toBe(3500);
      expect(yahooFinance.quote).toHaveBeenCalledWith('TCS.NS');
    });

    it('throws AppError 404 if symbol is not found', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      vi.mocked(yahooFinance.quote).mockRejectedValue(new Error('Not Found'));

      await expect(yfinance.fetchStockQuote('INVALIDTICKER')).rejects.toThrowError(AppError);
      await expect(yfinance.fetchStockQuote('INVALIDTICKER')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('fetchStockTechnicals', () => {
    it('computes SMA, RSI, and MACD indicators from price history', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      // Generate 250 days of dummy close prices
      const dummyHistory = [];
      const baseDate = new Date('2023-01-01');
      for (let i = 0; i < 250; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        dummyHistory.push({
          date: d,
          open: 100 + i * 0.5,
          high: 105 + i * 0.5,
          low: 98 + i * 0.5,
          close: 100 + i * 0.5,
          volume: 100000,
        });
      }

      vi.mocked(yahooFinance.historical).mockResolvedValue(dummyHistory as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const technicals = await yfinance.fetchStockTechnicals('INFY');
      expect(technicals.sma20).toBeDefined();
      expect(technicals.sma50).toBeDefined();
      expect(technicals.sma200).toBeDefined();
      expect(technicals.rsi).toBeDefined();
      expect(technicals.macd).toBeDefined();
      expect(technicals.lastClose).toBe(dummyHistory[dummyHistory.length - 1]?.close);
    });
  });
});
