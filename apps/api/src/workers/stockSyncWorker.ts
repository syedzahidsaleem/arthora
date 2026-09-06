import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import { SERVERLESS_WORKER_DEFAULTS } from '../lib/constants/workerOptions';
import { StockPriceHistory } from '../lib/models/StockPriceHistory';
import { StockMetrics } from '../lib/models/StockMetrics';
import {
  fetchStockQuote,
  fetchStockPriceHistory,
  isMarketHours,
} from '../lib/external/yfinance';

export const STOCK_SYNC_QUEUE = 'stock-sync';
export const stockSyncQueue = new Queue(STOCK_SYNC_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/**
 * Benchmark Indian Stock Universe: NIFTY 50 and NIFTY NEXT 50 symbols.
 */
export const TRACKED_NSE_SYMBOLS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'ICICIBANK',
  'HINDUNILVR',
  'ITC',
  'SBIN',
  'BHARTIARTL',
  'KOTAKBANK',
  'LT',
  'AXISBANK',
  'ASIANPAINT',
  'HCLTECH',
  'MARUTI',
  'BAJFINANCE',
  'SUNPHARMA',
  'TITAN',
  'ULTRACEMCO',
  'TATAMOTORS',
  'NTPC',
  'ONGC',
  'POWERGRID',
  'TATASTEEL',
  'M&M',
  'JSWSTEEL',
  'ADANIENT',
  'ADANIPORTS',
  'COALINDIA',
  'BAJAJFINSV',
  'TECHM',
  'WIPRO',
  'HINDALCO',
  'GRASIM',
  'NESTLEIND',
  'DRREDDY',
  'CIPLA',
  'EICHERMOT',
  'DIVISLAB',
  'APOLLOHOSP',
  'TATACONSUM',
  'SBILIFE',
  'HDFCLIFE',
  'BPCL',
  'BRITANNIA',
  'HEROMOTOCO',
  'INDUSINDBK',
  'SHREECEM',
  'UPL',
  'ZOMATO',
  'BEL',
  'HAL',
  'TRENT',
  'JIOFIN',
  'VEDL',
  'VBL',
  'CHOLAFIN',
  'DLF',
  'SIEMENS',
  'ABB',
];

/**
 * BullMQ Worker handling live/delayed stock market sync during market hours.
 */
export function createStockSyncWorker(): Worker {
  const worker = new Worker(
    STOCK_SYNC_QUEUE,
    async (job: Job) => {
      const startTime = Date.now();
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'stockSync',
          event: 'job_started',
          jobId: job.id,
          name: job.name,
        }),
      );

      // Check trading market hours
      const inMarketHours = isMarketHours();
      if (!inMarketHours && !job.data?.force) {
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            worker: 'stockSync',
            event: 'skipped_off_market_hours',
          }),
        );
        return { skipped: true, reason: 'Market closed' };
      }

      let successCount = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const symbol of TRACKED_NSE_SYMBOLS) {
        try {
          // Fetch quote
          const quote = await fetchStockQuote(symbol);

          // Update StockMetrics
          await StockMetrics.findOneAndUpdate(
            { symbol },
            {
              $set: {
                symbol,
                currentPrice: quote.currentPrice,
                marketCap: quote.marketCap,
                peRatio: 0,
                beta: quote.beta,
                fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
                dayChange: quote.currentPrice - quote.previousClose,
                dayChangePercent: quote.previousClose > 0 ? ((quote.currentPrice - quote.previousClose) / quote.previousClose) * 100 : 0,
                calculatedAt: new Date(),
              },
            },
            { upsert: true, new: true },
          );

          // Fetch recent 30-day daily price history
          const history = await fetchStockPriceHistory(symbol, thirtyDaysAgo, new Date(), '1d');
          if (history.length > 0) {
            const ops = history.map((point) => ({
              updateOne: {
                filter: { symbol, date: point.date },
                update: {
                  $set: {
                    symbol,
                    date: point.date,
                    open: point.open,
                    high: point.high,
                    low: point.low,
                    close: point.close,
                    volume: point.volume,
                    adjustedClose: point.adjustedClose,
                  },
                },
                upsert: true,
              },
            }));

            await StockPriceHistory.bulkWrite(ops, { ordered: false });
          }

          successCount++;
        } catch (err) {
          console.error(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              worker: 'stockSync',
              event: 'symbol_sync_failed',
              symbol,
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
          );
        }
      }

      return {
        syncedCount: successCount,
        totalTracked: TRACKED_NSE_SYMBOLS.length,
        durationMs: Date.now() - startTime,
      };
    },
    {
      ...SERVERLESS_WORKER_DEFAULTS,
      concurrency: 2,
    },
  );

  return worker;
}
