import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../lib/middleware/validationMiddleware';
import { generateRiskProfile } from '../lib/external/gemini';
import type { ApiResponse } from '@arthora/shared';

const router: Router = Router();

const riskProfileSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters long'),
});

/**
 * POST /onboard/risk-profile - Classify risk profile from natural language description
 */
router.post(
  '/risk-profile',
  validate(riskProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await generateRiskProfile(req.body.description);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Risk tolerance analyzed successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
