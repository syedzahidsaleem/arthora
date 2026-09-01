import crypto from 'crypto';
import { AISuggestionCache } from '../models/AISuggestionCache';
import type { PortfolioSuggestion } from '../validators/aiResponse';
import type { PortfolioPromptInput } from '../prompts/portfolioSuggestion';

export type PortfolioInput = PortfolioPromptInput;

/**
 * Generates a deterministic SHA256 hash for portfolio inputs by normalizing parameters.
 * Rounds monthly investment to nearest 5000 to improve cache hit rates.
 */
export function hashPortfolioInput(input: PortfolioInput): string {
  const normalizedMonthly = Math.round(input.monthlyInvestment / 5000) * 5000;
  const normalizedLumpSum = Math.round(input.lumpSum / 10000) * 10000;

  const normalized = {
    riskLevel: input.riskLevel,
    timePeriodYears: input.timePeriodYears,
    monthlyInvestment: normalizedMonthly,
    lumpSum: normalizedLumpSum,
    goalName: input.goalName?.trim().toLowerCase() || '',
  };

  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

/**
 * Retrieves a previously generated AI portfolio suggestion from MongoDB cache if present.
 */
export async function getCachedSuggestion(
  inputHash: string,
): Promise<PortfolioSuggestion | null> {
  const cached = await AISuggestionCache.findOne({ inputHash });
  if (!cached || !cached.response) {
    return null;
  }
  return cached.response as unknown as PortfolioSuggestion;
}

/**
 * Saves an AI portfolio suggestion to MongoDB cache with 7-day TTL expiration.
 */
export async function cacheSuggestion(
  inputHash: string,
  input: PortfolioInput,
  suggestion: PortfolioSuggestion,
): Promise<void> {
  await AISuggestionCache.findOneAndUpdate(
    { inputHash },
    {
      $set: {
        inputHash,
        goalText: input.goalName || 'Wealth Creation',
        riskLevel: input.riskLevel,
        timePeriod: input.timePeriodYears,
        aiModel: suggestion.model || 'gemini-1.5-flash',
        response: suggestion as unknown as Record<string, unknown>,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );
}
