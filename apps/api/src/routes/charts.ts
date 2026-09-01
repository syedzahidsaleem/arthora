import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import { getFundNAVHistory } from '../lib/services/fundService';
import { getStockHistory } from '../lib/services/stockService';
import { calculateMaxDrawdown } from '../lib/calculations/maxDrawdown';
import { AppError } from '../lib/errors/AppError';
import type { ApiResponse } from '@arthora/shared';

const router: Router = Router();

const fundNavQuerySchema = z.object({
  schemeCode: z.coerce.number().int().positive(),
  timeframe: z.enum(['1M', '3M', '6M', '1Y', '3Y', '5Y', 'max']).default('1Y'),
});

const stockPriceQuerySchema = z.object({
  symbol: z.string().toUpperCase().min(1).max(20),
  timeframe: z.enum(['1M', '3M', '6M', '1Y', '3Y', '5Y']).default('1Y'),
});

const drawdownQuerySchema = z.object({
  schemeCode: z.coerce.number().int().positive(),
});

/**
 * GET /charts/fund-nav - Normalized time-series NAV chart data
 */
router.get(
  '/fund-nav',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemeCode, timeframe } = fundNavQuerySchema.parse(req.query);
      const raw = await getFundNAVHistory(schemeCode, timeframe);

      const chartData = raw.dates.map((date, idx) => ({
        date,
        nav: raw.navs[idx] ?? 0,
      }));

      const response: ApiResponse<{ data: typeof chartData }> = {
        success: true,
        data: { data: chartData },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid query parameters for fund-nav chart', 400, 'INVALID_INPUT'));
      }
      next(error);
    }
  },
);

/**
 * GET /charts/stock-price - OHLCV price series chart data
 */
router.get(
  '/stock-price',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { symbol, timeframe } = stockPriceQuerySchema.parse(req.query);
      const raw = await getStockHistory(symbol, timeframe);

      const chartData = raw.dates.map((date, idx) => ({
        date,
        open: raw.opens[idx] ?? 0,
        high: raw.highs[idx] ?? 0,
        low: raw.lows[idx] ?? 0,
        close: raw.closes[idx] ?? 0,
        volume: raw.volumes[idx] ?? 0,
        adjustedClose: raw.adjustedCloses ? raw.adjustedCloses[idx] : undefined,
      }));

      const response: ApiResponse<{ data: typeof chartData }> = {
        success: true,
        data: { data: chartData },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid query parameters for stock-price chart', 400, 'INVALID_INPUT'));
      }
      next(error);
    }
  },
);

/**
 * GET /charts/fund-drawdown - Historical underwater drawdown curves & peak analysis
 */
router.get(
  '/fund-drawdown',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemeCode } = drawdownQuerySchema.parse(req.query);
      const raw = await getFundNAVHistory(schemeCode, 'max');

      const navPoints = raw.dates.map((date, idx) => ({
        date: new Date(date),
        nav: raw.navs[idx] ?? 0,
      }));

      const mddResult = calculateMaxDrawdown(navPoints);

      // Compute underwater drawdown series
      let peakSoFar = 0;
      const drawdownSeries = navPoints.map((p) => {
        if (p.nav > peakSoFar) {
          peakSoFar = p.nav;
        }
        const drawdown = peakSoFar > 0 ? (peakSoFar - p.nav) / peakSoFar : 0;
        return {
          date: p.date.toISOString().slice(0, 10),
          drawdown: Number(drawdown.toFixed(4)),
        };
      });

      const response: ApiResponse<{
        data: typeof drawdownSeries;
        maxDrawdown: number;
        peakDate: Date;
        troughDate: Date;
        recoveryDate: Date | null;
      }> = {
        success: true,
        data: {
          data: drawdownSeries,
          maxDrawdown: mddResult.maxDrawdown,
          peakDate: mddResult.peakDate,
          troughDate: mddResult.troughDate,
          recoveryDate: mddResult.recoveryDate,
        },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid query parameters for fund-drawdown chart', 400, 'INVALID_INPUT'));
      }
      next(error);
    }
  },
);

export default router;
