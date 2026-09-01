import { Router, Request, Response, NextFunction } from 'express';
import { addFavoriteSchema, type ApiResponse } from '@arthora/shared';
import * as favoritesService from '../lib/services/favoritesService';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import { validate } from '../lib/middleware/validationMiddleware';

const router: Router = Router();

/**
 * GET /favorites - List user watchlist with real-time prices
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const favorites = await favoritesService.listFavorites(userId);

    const response: ApiResponse<typeof favorites> = {
      success: true,
      data: favorites,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /favorites - Add asset to watchlist
 */
router.post(
  '/',
  authMiddleware,
  validate(addFavoriteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const favorite = await favoritesService.addFavorite(userId, req.body);

      const response: ApiResponse<typeof favorite> = {
        success: true,
        data: favorite,
        message: 'Added to watchlist successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /favorites/:id - Remove asset from watchlist
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await favoritesService.removeFavorite(userId, req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
