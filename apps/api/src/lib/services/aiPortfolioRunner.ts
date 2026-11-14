import { Portfolio } from '../models/Portfolio';
import {
  hashPortfolioInput,
  getCachedSuggestion,
  cacheSuggestion,
  type PortfolioInput,
} from './aiCacheService';
import { generatePortfolioSuggestion } from '../external/gemini';
import { buildFallbackSuggestion } from './fallbackPortfolioEngine';
import type { PortfolioSuggestion } from '../validators/aiResponse';

/**
 * Generates an AI or deterministic fallback portfolio suggestion and saves it to MongoDB.
 * Used both by BullMQ aiSuggestWorker and as an in-process fallback when Redis is unavailable.
 */
export async function executePortfolioSuggestionJob(
  portfolioId: string,
  input: PortfolioInput,
): Promise<{ portfolioId: string; status: string }> {
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
        console.warn('⚠️ [AI Runner] Gemini generation failed, falling back to deterministic engine:', aiErr);
        suggestion = buildFallbackSuggestion(input);
      }
      await cacheSuggestion(inputHash, input, suggestion);
    }

    portfolio.aiSuggestion = {
      status: 'completed',
      model: suggestion.aiModel || suggestion.model || 'gemini-3.6-flash',
      aiModel: suggestion.aiModel || suggestion.model || 'gemini-3.6-flash',
      allocation: (suggestion.allocation || []) as unknown as NonNullable<
        typeof portfolio.aiSuggestion
      >['allocation'],
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
}
