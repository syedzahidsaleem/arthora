import { Router, Request, Response, NextFunction } from 'express';
import { SearchHistory } from '../lib/models/SearchHistory';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import type { ApiResponse, PaginatedResponse, ISearchHistory } from '@arthora/shared';

const router: Router = Router();

/**
 * GET /search/history - List user's recent searches
 */
router.get('/history', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
    const limit = req.query.limit
      ? Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10)))
      : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      SearchHistory.find({ userId }).sort({ searchedAt: -1 }).skip(skip).limit(limit).lean(),
      SearchHistory.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const result: PaginatedResponse<ISearchHistory>['data'] = {
      items: items as unknown as ISearchHistory[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /search/history - Clear all user search history
 */
router.delete('/history', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await SearchHistory.deleteMany({ userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
