import { Worker, Queue, Job } from 'bullmq';
import { redis } from '../lib/db/redis';
import { Portfolio } from '../lib/models/Portfolio';
import {
  hashPortfolioInput,
  getCachedSuggestion,
  cacheSuggestion,
  type PortfolioInput,
} from '../lib/services/aiCacheService';
import { generatePortfolioSuggestion } from '../lib/external/gemini';
import { buildFallbackSuggestion } from '../lib/services/fallbackPortfolioEngine';
import type { PortfolioSuggestion } from '../lib/validators/aiResponse';

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

      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio ${portfolioId} not found`);
      }

      if (portfolio.aiSuggestion) {
        portfolio.aiSuggestion.status = 'generating';
      }
      await portfolio.save();

      try {
        const inputHash = hashPortfolioInput(input);
        let suggestion: PortfolioSuggestion | null = await getCachedSuggestion(inputHash);

        if (!suggestion) {
          try {
            suggestion = await generatePortfolioSuggestion(input);
          } catch (aiErr) {
            console.warn('⚠️ [AI Worker] Gemini generation failed, falling back to deterministic engine:', aiErr);
            suggestion = buildFallbackSuggestion(input);
          }
          await cacheSuggestion(inputHash, input, suggestion);
        }

        portfolio.aiSuggestion = {
          status: 'completed',
          model: suggestion.model || 'gemini-1.5-flash',
          aiModel: suggestion.model || 'gemini-1.5-flash',
          allocation: (suggestion.allocation || []) as unknown as NonNullable<typeof portfolio.aiSuggestion>['allocation'],
          projectedValue: suggestion.projectedValue,
          rebalancing: suggestion.rebalancing,
          explanation: suggestion.explanation,
          disclaimer: suggestion.disclaimer,
          generatedAt: new Date(),
        };

        await portfolio.save();

        return { portfolioId, status: 'completed' };
      } catch (err) {
        if (portfolio.aiSuggestion) {
          portfolio.aiSuggestion.status = 'failed';
        }
        await portfolio.save();
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: 3,
    },
  );

  return worker;
}
