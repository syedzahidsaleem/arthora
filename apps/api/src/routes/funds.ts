import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as fundService from '../lib/services/fundService';
import { recordSearchHistoryAsync } from '../lib/services/searchHistoryService';
import { optionalAuth } from '../lib/middleware/authMiddleware';
import { generalLimiter } from '../lib/middleware/rateLimitMiddleware';
import { AppError } from '../lib/errors/AppError';
import type { ApiResponse } from '@arthora/shared';

const router: Router = Router();

const fundSearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  fundHouse: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const schemeCodeParamSchema = z.object({
  schemeCode: z.coerce.number().int().positive(),
});

/**
 * GET /funds/search - Search mutual funds by text query, category, and fundHouse
 */
router.get(
  '/search',
  optionalAuth,
  generalLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = fundSearchQuerySchema.parse(req.query);
      const data = await fundService.searchFunds(parsed.q, {
        category: parsed.category,
        fundHouse: parsed.fundHouse,
        page: parsed.page,
        limit: parsed.limit,
      });

      // Record search history async
      if (parsed.q) {
        recordSearchHistoryAsync(req.user?.userId, parsed.q, 'mutual_fund', data.pagination.total);
      }

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /funds/categories - Get distinct fund categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await fundService.getFundCategories();
    const response: ApiResponse<string[]> = {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /funds/:schemeCode - Get mutual fund scheme details
 */
router.get('/:schemeCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const fund = await fundService.getFundDetail(schemeCode);

    const response: ApiResponse<typeof fund> = {
      success: true,
      data: fund,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /funds/:schemeCode/metrics - Get risk-adjusted metrics (or 202 calculating)
 */
router.get('/:schemeCode/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const result = await fundService.getFundMetrics(schemeCode);

    const response: ApiResponse<typeof result.data> = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    if (result.isPending) {
      res.status(202).json(response);
    } else {
      res.status(200).json(response);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /funds/:schemeCode/nav-history - Get historical NAV series
 */
router.get('/:schemeCode/nav-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const timeframe = (req.query.timeframe as '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'max') || '1Y';

    const history = await fundService.getFundNAVHistory(schemeCode, timeframe);
    const response: ApiResponse<typeof history> = {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /funds/:schemeCode/holdings - Get top portfolio holdings
 */
router.get('/:schemeCode/holdings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const holdings = await fundService.getFundHoldings(schemeCode);

    const response: ApiResponse<typeof holdings> = {
      success: true,
      data: holdings,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /funds/:schemeCode/sector-allocation - Get sector distribution
 */
router.get('/:schemeCode/sector-allocation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const sectorAlloc = await fundService.getFundSectorAlloc(schemeCode);

    const response: ApiResponse<typeof sectorAlloc> = {
      success: true,
      data: sectorAlloc,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /funds/:schemeCode/peers - Get top performing category peers
 */
router.get('/:schemeCode/peers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schemeCode } = schemeCodeParamSchema.parse(req.params);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    const peers = await fundService.getFundPeers(schemeCode, limit);
    const response: ApiResponse<typeof peers> = {
      success: true,
      data: peers,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid schemeCode parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

export default router;
