import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import { SERVERLESS_WORKER_DEFAULTS } from '../lib/constants/workerOptions';
import { type PortfolioInput } from '../lib/services/aiCacheService';
import { executePortfolioSuggestionJob } from '../lib/services/aiPortfolioRunner';

export const AI_SUGGEST_QUEUE = 'ai-suggest';
export const aiSuggestQueue = new Queue(AI_SUGGEST_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
aiSuggestQueue.on('error', (err) => {
  console.warn(`⚠️ [BullMQ:${AI_SUGGEST_QUEUE}] Queue connection warning:`, err.message);
});

/**
 * BullMQ Worker processing async portfolio generation via Gemini AI or Fallback Rules Engine.
 */
export function createAiSuggestWorker(): Worker {
  const worker = new Worker(
    AI_SUGGEST_QUEUE,
    async (job: Job) => {
      const { portfolioId, input } = job.data as {
        portfolioId: string;
        userId: string;
        input: PortfolioInput;
      };

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          worker: 'aiSuggest',
          event: 'job_started',
          jobId: job.id,
          portfolioId,
        }),
      );

      return executePortfolioSuggestionJob(portfolioId, input);
    },
    {
      ...SERVERLESS_WORKER_DEFAULTS,
      concurrency: 3,
    },
  );

  return worker;
}
