import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as stockService from '../lib/services/stockService';
import { recordSearchHistoryAsync } from '../lib/services/searchHistoryService';
import { optionalAuth } from '../lib/middleware/authMiddleware';
import { generalLimiter } from '../lib/middleware/rateLimitMiddleware';
import { AppError } from '../lib/errors/AppError';
import type { ApiResponse } from '@arthora/shared';

const router: Router = Router();

const stockSearchQuerySchema = z.object({
  q: z.string().optional(),
  sector: z.string().optional(),
  marketCapType: z.enum(['large_cap', 'mid_cap', 'small_cap']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const symbolParamSchema = z.object({
  symbol: z.string().toUpperCase().min(1).max(20),
});

/**
 * GET /stocks/search - Search NSE listed stocks
 */
router.get(
  '/search',
  optionalAuth,
  generalLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = stockSearchQuerySchema.parse(req.query);
      const data = await stockService.searchStocks(parsed.q, {
        sector: parsed.sector,
        marketCapType: parsed.marketCapType,
        page: parsed.page,
        limit: parsed.limit,
      });

      if (parsed.q) {
        recordSearchHistoryAsync(req.user?.userId, parsed.q, 'stock', data.pagination.total);
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
 * GET /stocks/:symbol - Get stock detail with live quote
 */
router.get('/:symbol', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = symbolParamSchema.parse(req.params);
    const stock = await stockService.getStockDetail(symbol);

    const response: ApiResponse<typeof stock> = {
      success: true,
      data: stock,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid stock symbol parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /stocks/:symbol/metrics - Get stock valuation & fundamentals
 */
router.get('/:symbol/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = symbolParamSchema.parse(req.params);
    const metrics = await stockService.getStockMetrics(symbol);

    const response: ApiResponse<typeof metrics> = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid stock symbol parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /stocks/:symbol/history - Get OHLCV historical candlestick data
 */
router.get('/:symbol/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = symbolParamSchema.parse(req.params);
    const timeframe = (req.query.timeframe as '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y') || '1Y';

    const history = await stockService.getStockHistory(symbol, timeframe);
    const response: ApiResponse<typeof history> = {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid stock symbol parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

/**
 * GET /stocks/:symbol/technical - Get computed technical indicators & trend
 */
router.get('/:symbol/technical', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = symbolParamSchema.parse(req.params);
    const technical = await stockService.getStockTechnical(symbol);

    const response: ApiResponse<typeof technical> = {
      success: true,
      data: technical,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid stock symbol parameter', 400, 'INVALID_PARAMETER'));
    }
    next(error);
  }
});

export default router;
