import 'dotenv/config';
import dotenv from 'dotenv';
import { connectDB } from './lib/db/connection';
import { redis } from './lib/db/redis';
import { createNavSyncWorker, navSyncQueue } from './workers/navSyncWorker';
import { createStockSyncWorker, stockSyncQueue } from './workers/stockSyncWorker';
import { createMetricCalcWorker } from './workers/metricCalcWorker';
import { createReportWorker } from './workers/reportWorker';
import { createAiSuggestWorker } from './workers/aiSuggestWorker';

dotenv.config();

console.log('⚙️ [Worker Process] Initializing Arthora BullMQ workers...');

export async function startWorkers(): Promise<void> {
  try {
    // 1. Connect to Database & Cache
    await connectDB();
    await redis.ping();
    console.log('📡 [Worker Process] Connected to MongoDB and Redis successfully.');

    // 2. Initialize BullMQ Workers
    const navWorker = createNavSyncWorker();
    const stockWorker = createStockSyncWorker();
    const metricWorker = createMetricCalcWorker();
    const reportWorker = createReportWorker();
    const aiWorker = createAiSuggestWorker();

    console.log('🚀 [Worker Process] All 5 BullMQ workers active and listening for jobs.');

    // 3. Register standard recurring cron schedules only if explicitly enabled
    if (process.env.ENABLE_RECURRING_SYNC === 'true') {
      // Sync all funds at 6:00 PM IST on weekdays (12:30 UTC)
      await navSyncQueue.add(
        'sync-all-funds',
        {},
        {
          repeat: {
            pattern: '30 12 * * 1-5',
          },
          jobId: 'recurring-sync-all-funds',
        },
      );

      // Live stock sync hourly (during market hours)
      await stockSyncQueue.add(
        'sync-stock-prices',
        {},
        {
          repeat: {
            every: 60 * 60 * 1000,
          },
          jobId: 'recurring-stock-sync',
        },
      );

      console.log('⏱️ [Worker Process] Recurring cron schedules registered in Redis.');
    } else {
      console.log('ℹ️ [Worker Process] Recurring background sync disabled (ENABLE_RECURRING_SYNC!=true) to protect Redis command limits.');
    }

    // 4. Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 [Worker Process] Received ${signal}. Gracefully stopping workers...`);
      await Promise.all([
        navWorker.close(),
        stockWorker.close(),
        metricWorker.close(),
        reportWorker.close(),
        aiWorker.close(),
      ]);
      console.log('🔒 [Worker Process] All workers closed.');
      process.exit(0);
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 [Worker Process] Worker failed to initialize:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test' && process.env.RUN_WORKER_PROCESS === 'true') {
  startWorkers();
}
