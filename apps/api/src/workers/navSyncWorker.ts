import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import { FundMetadata } from '../lib/models/FundMetadata';
import { FundNAVHistory } from '../lib/models/FundNAVHistory';
import { fetchAllSchemes, fetchNAVHistory } from '../lib/external/mfapi';

export const NAV_SYNC_QUEUE = 'nav-sync';
export const navSyncQueue = new Queue(NAV_SYNC_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/**
 * BullMQ Worker handling mutual fund scheme metadata and historical NAV synchronization.
 */
export function createNavSyncWorker(): Worker {
  const worker = new Worker(
    NAV_SYNC_QUEUE,
    async (job: Job) => {
      const startTime = Date.now();
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'navSync',
          event: 'job_started',
          jobId: job.id,
          name: job.name,
          data: job.data,
        }),
      );

      if (job.name === 'sync-all-funds') {
        // 1. Fetch complete list of AMFI mutual fund schemes
        const schemes = await fetchAllSchemes();
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            worker: 'navSync',
            event: 'schemes_fetched',
            count: schemes.length,
          }),
        );

        // 2. Bulk upsert into FundMetadata in chunks of 100
        const chunkSize = 100;
        for (let i = 0; i < schemes.length; i += chunkSize) {
          const chunk = schemes.slice(i, i + chunkSize);
          const ops = chunk.map((scheme) => ({
            updateOne: {
              filter: { schemeCode: scheme.schemeCode },
              update: {
                $setOnInsert: {
                  schemeCode: scheme.schemeCode,
                  schemeName: scheme.schemeName,
                  fundHouse: scheme.schemeName.split(' ')[0] || 'Unknown',
                  category: 'other',
                  schemeType: 'Open Ended',
                  isActive: true,
                },
              },
              upsert: true,
            },
          }));

          await FundMetadata.bulkWrite(ops);
        }

        return { syncedSchemes: schemes.length, durationMs: Date.now() - startTime };
      }

      if (job.name === 'sync-fund-nav') {
        const { schemeCode } = job.data as { schemeCode: number };
        if (!schemeCode) {
          throw new Error('schemeCode is required for sync-fund-nav job');
        }

        const navPoints = await fetchNAVHistory(schemeCode);
        if (navPoints.length > 0) {
          const ops = navPoints.map((point) => ({
            updateOne: {
              filter: { schemeCode, date: point.date },
              update: {
                $set: {
                  schemeCode,
                  date: point.date,
                  nav: point.nav,
                },
              },
              upsert: true,
            },
          }));

          await FundNAVHistory.bulkWrite(ops, { ordered: false });
        }

        return {
          schemeCode,
          navPointsCount: navPoints.length,
          durationMs: Date.now() - startTime,
        };
      }

      throw new Error(`Unknown job name: ${job.name}`);
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  worker.on('completed', (job: Job) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        worker: 'navSync',
        event: 'job_completed',
        jobId: job.id,
        name: job.name,
      }),
    );
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        worker: 'navSync',
        event: 'job_failed',
        jobId: job?.id,
        name: job?.name,
        error: err.message,
      }),
    );
  });

  return worker;
}
