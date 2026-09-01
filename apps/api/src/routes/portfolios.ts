import { Router, Request, Response, NextFunction } from 'express';
import { createPortfolioSchema, updatePortfolioSchema, type ApiResponse } from '@arthora/shared';
import * as portfolioService from '../lib/services/portfolioService';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import { validate } from '../lib/middleware/validationMiddleware';

const router: Router = Router();

/**
 * POST /portfolios - Create portfolio and queue async AI synthesis
 */
router.post(
  '/',
  authMiddleware,
  validate(createPortfolioSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await portfolioService.createPortfolio(userId, req.body);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Portfolio creation initiated. AI optimization in progress.',
        timestamp: new Date().toISOString(),
      };
      res.status(202).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /portfolios - List active user portfolios
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await portfolioService.listPortfolios(userId, page, limit);

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /portfolios/:id - Get portfolio by ID
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const portfolio = await portfolioService.getPortfolioById(userId, req.params.id as string);

    const response: ApiResponse<typeof portfolio> = {
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /portfolios/:id/status - Poll generation status of a portfolio
 */
router.get('/:id/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const statusData = await portfolioService.getPortfolioStatus(userId, req.params.id as string);

    const response: ApiResponse<typeof statusData> = {
      success: true,
      data: statusData,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /portfolios/:id - Update portfolio parameters
 */
router.patch(
  '/:id',
  authMiddleware,
  validate(updatePortfolioSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const updated = await portfolioService.updatePortfolio(userId, req.params.id as string, req.body);

      const response: ApiResponse<typeof updated> = {
        success: true,
        data: updated,
        message: 'Portfolio updated successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /portfolios/:id - Soft delete portfolio
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await portfolioService.deletePortfolio(userId, req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /portfolios/:id/pin - Toggle pinned priority
 */
router.patch('/:id/pin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await portfolioService.togglePin(userId, req.params.id as string);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: result.isPinned ? 'Portfolio pinned.' : 'Portfolio unpinned.',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
