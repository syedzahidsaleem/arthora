import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import {
  SERVERLESS_WORKER_DEFAULTS,
  registerQueueCircuitBreaker,
  registerWorkerCircuitBreaker,
} from '../lib/constants/workerOptions';
import { executeReportGenerationJob } from '../lib/services/reportRunner';

export const REPORT_QUEUE = 'report-gen';
export const reportQueue = new Queue(REPORT_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
registerQueueCircuitBreaker(reportQueue, REPORT_QUEUE);

/**
 * BullMQ Worker generating PDF analysis reports via Chromium & Puppeteer.
 */
export function createReportWorker(): Worker {
  const worker = new Worker(
    REPORT_QUEUE,
    async (job: Job) => {
      const { reportId } = job.data as { reportId: string };
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'reportGen',
          event: 'job_started',
          jobId: job.id,
          reportId,
        }),
      );

      return executeReportGenerationJob(reportId);
    },
    {
      ...SERVERLESS_WORKER_DEFAULTS,
      concurrency: 2,
    },
  );

  registerWorkerCircuitBreaker(worker, REPORT_QUEUE);
  return worker;
}
