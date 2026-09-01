import yahooFinance from 'yahoo-finance2';
import { SMA, RSI, MACD } from 'technicalindicators';
import { AppError } from '../errors/AppError';
import * as redisService from '../db/redis';

/**
 * Checks if current time is within Indian Stock Market trading hours (IST Monday-Friday 9:15 AM - 3:30 PM).
 */
export function isMarketHours(now: Date = new Date()): boolean {
  // Convert UTC to IST (+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);

  const dayOfWeek = istDate.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false; // Weekend
  }

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const currentMinutes = hours * 60 + minutes;

  const marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
  const marketCloseMinutes = 15 * 60 + 30; // 3:30 PM

  return currentMinutes >= marketOpenMinutes && currentMinutes <= marketCloseMinutes;
}

export interface StockQuoteResult {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  beta: number;
  currency: string;
}

export interface StockFundamentalsResult {
  peRatioTTM?: number;
  peRatioForward?: number;
  pbRatio?: number;
  dividendYield?: number;
  roe?: number;
  debtToEquity?: number;
  epsTTM?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
}

export interface StockPriceHistoryPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface StockTechnicalsResult {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi: number | null;
  macd: {
    value: number | null;
    signal: number | null;
    histogram: number | null;
  };
  lastClose: number;
}

/**
 * Fetches real-time / delayed stock quote for an NSE ticker symbol.
 */
export async function fetchStockQuote(nseSymbol: string): Promise<StockQuoteResult> {
  const cleanSymbol = nseSymbol.toUpperCase().replace(/\.NS$/, '');
  const yahooTicker = `${cleanSymbol}.NS`;
  const cacheKey = `stock:${cleanSymbol}:quote`;
  const ttl = isMarketHours() ? 900 : 86400;

  const cached = await redisService.get<StockQuoteResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const quote = (await yahooFinance.quote(yahooTicker)) as Record<string, unknown> | null;
    if (!quote || quote.regularMarketPrice === undefined) {
      throw new AppError(`Stock symbol ${cleanSymbol} not found on NSE`, 404, 'NOT_FOUND');
    }

    const regularMarketPrice = Number(quote.regularMarketPrice) || 0;
    const previousClose = Number(quote.regularMarketPreviousClose) || regularMarketPrice;
    const open = Number(quote.regularMarketOpen) || regularMarketPrice;
    const dayHigh = Number(quote.regularMarketDayHigh) || regularMarketPrice;
    const dayLow = Number(quote.regularMarketDayLow) || regularMarketPrice;
    const volume = Number(quote.regularMarketVolume) || 0;
    const marketCap = Number(quote.marketCap) || 0;
    const fiftyTwoWeekHigh = Number(quote.fiftyTwoWeekHigh) || regularMarketPrice;
    const fiftyTwoWeekLow = Number(quote.fiftyTwoWeekLow) || regularMarketPrice;
    const beta = Number(quote.beta) || 1.0;
    const currency = String(quote.currency || 'INR');

    const result: StockQuoteResult = {
      symbol: cleanSymbol,
      currentPrice: regularMarketPrice,
      previousClose,
      open,
      dayHigh,
      dayLow,
      volume,
      marketCap,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      beta,
      currency,
    };

    await redisService.set(cacheKey, result, ttl);
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('Not Found') || msg.includes('404')) {
      throw new AppError(`Stock symbol ${cleanSymbol} not found`, 404, 'NOT_FOUND');
    }
    throw new AppError(`Yahoo Finance quote error for ${cleanSymbol}: ${msg}`, 502, 'EXTERNAL_API_ERROR');
  }
}

/**
 * Fetches comprehensive fundamental indicators for an NSE ticker.
 */
export async function fetchStockFundamentals(
  nseSymbol: string,
): Promise<StockFundamentalsResult> {
  const cleanSymbol = nseSymbol.toUpperCase().replace(/\.NS$/, '');
  const yahooTicker = `${cleanSymbol}.NS`;
  const cacheKey = `stock:${cleanSymbol}:fundamentals`;
  const ttl = 86400;

  const cached = await redisService.get<StockFundamentalsResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const summary = (await yahooFinance.quoteSummary(yahooTicker, {
      modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail'],
    })) as Record<string, unknown> | null;

    if (!summary) {
      throw new AppError(`Fundamental data not available for ${cleanSymbol}`, 404, 'NOT_FOUND');
    }

    const financialData = summary.financialData as Record<string, unknown> | undefined;
    const defaultKeyStatistics = summary.defaultKeyStatistics as Record<string, unknown> | undefined;
    const summaryDetail = summary.summaryDetail as Record<string, unknown> | undefined;

    const result: StockFundamentalsResult = {
      peRatioTTM: summaryDetail?.trailingPE !== undefined ? Number(summaryDetail.trailingPE) : undefined,
      peRatioForward: summaryDetail?.forwardPE !== undefined ? Number(summaryDetail.forwardPE) : undefined,
      pbRatio: defaultKeyStatistics?.priceToBook !== undefined ? Number(defaultKeyStatistics.priceToBook) : undefined,
      dividendYield: summaryDetail?.dividendYield !== undefined ? Number(summaryDetail.dividendYield) : undefined,
      roe: financialData?.returnOnEquity !== undefined ? Number(financialData.returnOnEquity) : undefined,
      debtToEquity: financialData?.debtToEquity !== undefined ? Number(financialData.debtToEquity) : undefined,
      epsTTM: defaultKeyStatistics?.trailingEps !== undefined ? Number(defaultKeyStatistics.trailingEps) : undefined,
      earningsGrowth: financialData?.earningsGrowth !== undefined ? Number(financialData.earningsGrowth) : undefined,
      revenueGrowth: financialData?.revenueGrowth !== undefined ? Number(financialData.revenueGrowth) : undefined,
    };

    await redisService.set(cacheKey, result, ttl);
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(`Yahoo Finance fundamentals error for ${cleanSymbol}: ${msg}`, 502, 'EXTERNAL_API_ERROR');
  }
}

/**
 * Fetches historical OHLCV price series for an NSE ticker.
 */
export async function fetchStockPriceHistory(
  nseSymbol: string,
  period1: Date,
  period2: Date = new Date(),
  interval: '1d' | '1wk' | '1mo' = '1d',
): Promise<StockPriceHistoryPoint[]> {
  const cleanSymbol = nseSymbol.toUpperCase().replace(/\.NS$/, '');
  const yahooTicker = `${cleanSymbol}.NS`;
  const dateStr = period1.toISOString().slice(0, 10);
  const cacheKey = `stock:${cleanSymbol}:history:${interval}:${dateStr}`;
  const ttl = 86400;

  const cached = await redisService.get<Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose?: number;
  }>>(cacheKey);

  if (cached) {
    return cached.map((p) => ({
      ...p,
      date: new Date(p.date),
    }));
  }

  try {
    const historical = (await yahooFinance.historical(yahooTicker, {
      period1,
      period2,
      interval,
    })) as Array<Record<string, unknown>> | null;

    if (!historical || !Array.isArray(historical)) {
      return [];
    }

    const result: StockPriceHistoryPoint[] = historical
      .map((item: Record<string, unknown>) => ({
        date: new Date(item.date as string | number | Date),
        open: Number(item.open) || 0,
        high: Number(item.high) || 0,
        low: Number(item.low) || 0,
        close: Number(item.close) || 0,
        volume: Number(item.volume) || 0,
        adjustedClose: item.adjclose !== undefined ? Number(item.adjclose) : undefined,
      }))
      .filter((item) => !isNaN(item.close) && !isNaN(item.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    await redisService.set(cacheKey, result, ttl);
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(`Failed to fetch history for ${cleanSymbol}: ${msg}`, 502, 'EXTERNAL_API_ERROR');
  }
}

/**
 * Computes technical indicators (SMA 20/50/200, RSI 14, MACD 12/26/9) from historical prices.
 */
export async function fetchStockTechnicals(
  nseSymbol: string,
): Promise<StockTechnicalsResult> {
  const cleanSymbol = nseSymbol.toUpperCase().replace(/\.NS$/, '');
  const cacheKey = `stock:${cleanSymbol}:technical`;
  const ttl = isMarketHours() ? 900 : 86400;

  const cached = await redisService.get<StockTechnicalsResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch 1 year of daily history to ensure sufficient points for SMA 200
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const history = await fetchStockPriceHistory(cleanSymbol, oneYearAgo, new Date(), '1d');
  if (history.length === 0) {
    throw new AppError(`Insufficient price history to compute technicals for ${cleanSymbol}`, 404, 'NOT_FOUND');
  }

  const closePrices = history.map((h) => h.close);
  const lastClose = closePrices[closePrices.length - 1] ?? 0;

  // Calculate SMAs
  const sma20Values = closePrices.length >= 20 ? SMA.calculate({ period: 20, values: closePrices }) : [];
  const sma50Values = closePrices.length >= 50 ? SMA.calculate({ period: 50, values: closePrices }) : [];
  const sma200Values = closePrices.length >= 200 ? SMA.calculate({ period: 200, values: closePrices }) : [];

  // Calculate RSI
  const rsiValues = closePrices.length >= 14 ? RSI.calculate({ period: 14, values: closePrices }) : [];

  // Calculate MACD
  const macdValues =
    closePrices.length >= 26
      ? MACD.calculate({
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          values: closePrices,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        })
      : [];

  const lastSma20 = sma20Values.length > 0 ? sma20Values[sma20Values.length - 1]! : null;
  const lastSma50 = sma50Values.length > 0 ? sma50Values[sma50Values.length - 1]! : null;
  const lastSma200 = sma200Values.length > 0 ? sma200Values[sma200Values.length - 1]! : null;
  const lastRsi = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1]! : null;
  const lastMacd = macdValues.length > 0 ? macdValues[macdValues.length - 1]! : null;

  const result: StockTechnicalsResult = {
    sma20: lastSma20 !== null ? Number(lastSma20.toFixed(2)) : null,
    sma50: lastSma50 !== null ? Number(lastSma50.toFixed(2)) : null,
    sma200: lastSma200 !== null ? Number(lastSma200.toFixed(2)) : null,
    rsi: lastRsi !== null ? Number(lastRsi.toFixed(2)) : null,
    macd: {
      value: lastMacd && lastMacd.MACD !== undefined ? Number(lastMacd.MACD.toFixed(2)) : null,
      signal: lastMacd && lastMacd.signal !== undefined ? Number(lastMacd.signal.toFixed(2)) : null,
      histogram: lastMacd && lastMacd.histogram !== undefined ? Number(lastMacd.histogram.toFixed(2)) : null,
    },
    lastClose,
  };

  await redisService.set(cacheKey, result, ttl);
  return result;
}
