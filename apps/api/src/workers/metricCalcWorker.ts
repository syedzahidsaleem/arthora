import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import {
  SERVERLESS_WORKER_DEFAULTS,
  registerQueueCircuitBreaker,
  registerWorkerCircuitBreaker,
} from '../lib/constants/workerOptions';
import { computeAndSaveFundMetrics } from '../lib/services/fundMetricsRunner';

export const METRIC_CALC_QUEUE = 'metric-calc';
export const metricCalcQueue = new Queue(METRIC_CALC_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
registerQueueCircuitBreaker(metricCalcQueue, METRIC_CALC_QUEUE);

/**
 * BullMQ Worker computing risk and return analytics for mutual fund schemes.
 */
export function createMetricCalcWorker(): Worker {
  const worker = new Worker(
    METRIC_CALC_QUEUE,
    async (job: Job) => {
      const startTime = Date.now();
      const { schemeCode } = job.data as { schemeCode: number };

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'metricCalc',
          event: 'job_started',
          jobId: job.id,
          schemeCode,
        }),
      );

      const res = await computeAndSaveFundMetrics(schemeCode);
      return { ...res, durationMs: Date.now() - startTime };
    },
    {
      ...SERVERLESS_WORKER_DEFAULTS,
      concurrency: 5,
    },
  );

  registerWorkerCircuitBreaker(worker, METRIC_CALC_QUEUE);
  return worker;
}
