import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiSuggestSchema, type ApiResponse } from '@arthora/shared';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import { aiLimiter } from '../lib/middleware/rateLimitMiddleware';
import { validate } from '../lib/middleware/validationMiddleware';
import {
  hashPortfolioInput,
  getCachedSuggestion,
  cacheSuggestion,
} from '../lib/services/aiCacheService';
import {
  generatePortfolioSuggestion,
  generateFundExplanation,
} from '../lib/external/gemini';
import { buildFallbackSuggestion } from '../lib/services/fallbackPortfolioEngine';
import { FundMetadata } from '../lib/models/FundMetadata';
import { FundMetrics } from '../lib/models/FundMetrics';

const router: Router = Router();

const explainSchema = z.object({
  schemeCode: z.number().optional(),
  fundName: z.string().optional(),
  symbol: z.string().optional(),
  metrics: z.record(z.unknown()).optional(),
});

/**
 * POST /ai/suggest - Synchronous AI portfolio recommendation
 */
router.post(
  '/suggest',
  authMiddleware,
  aiLimiter,
  validate(aiSuggestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = {
        goalName: req.body.goalName || req.body.goal || 'Wealth Creation',
        timePeriodYears: req.body.timePeriod,
        riskLevel: req.body.riskLevel,
        monthlyInvestment: req.body.monthlyInvestment ?? 0,
        lumpSum: req.body.lumpSum ?? 0,
        preferences: req.body.preferences,
      };

      const inputHash = hashPortfolioInput(input);
      let suggestion = await getCachedSuggestion(inputHash);

      if (!suggestion) {
        try {
          suggestion = await generatePortfolioSuggestion(input);
        } catch (aiErr) {
          console.warn('⚠️ [AI Router] Gemini generation failed, using fallback engine:', aiErr);
          suggestion = buildFallbackSuggestion(input);
        }
        await cacheSuggestion(inputHash, input, suggestion);
      }

      const response: ApiResponse<typeof suggestion> = {
        success: true,
        data: suggestion,
        message: 'AI portfolio generated successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /ai/explain - Generate natural language explanation of fund/stock suitability
 */
router.post(
  '/explain',
  authMiddleware,
  validate(explainSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let fundName = req.body.fundName || req.body.symbol || 'Mutual Fund';
      let metrics = req.body.metrics || {};

      if (req.body.schemeCode && Object.keys(metrics).length === 0) {
        const [fund, fundMetrics] = await Promise.all([
          FundMetadata.findOne({ schemeCode: req.body.schemeCode }).lean(),
          FundMetrics.findOne({ schemeCode: req.body.schemeCode }).lean(),
        ]);
        if (fund) fundName = fund.schemeName;
        if (fundMetrics) metrics = fundMetrics as unknown as Record<string, unknown>;
      }

      const explanation = await generateFundExplanation(fundName, metrics);

      const response: ApiResponse<{ explanation: string }> = {
        success: true,
        data: { explanation },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
