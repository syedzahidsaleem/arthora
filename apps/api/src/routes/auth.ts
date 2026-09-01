import { Router, Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  fcmTokenSchema,
  updateMeSchema,
  ApiResponse,
  IUser,
} from '@arthora/shared';
import { authLimiter } from '../lib/middleware/rateLimitMiddleware';
import { validate } from '../lib/middleware/validationMiddleware';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import * as authService from '../lib/services/authService';

const router: Router = Router();

/**
 * POST /auth/register - Register with email & password
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const result = await authService.registerWithEmail(email, password, name);

      const response: ApiResponse<authService.AuthResult> = {
        success: true,
        data: result,
        message: 'Account created successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /auth/login - Log in with email & password
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.loginWithEmail(email, password);

      const response: ApiResponse<authService.AuthResult> = {
        success: true,
        data: result,
        message: 'Logged in successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /auth/google - Authenticate via Firebase Google ID token
 */
router.post(
  '/google',
  authLimiter,
  validate(googleAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;
      const result = await authService.loginWithGoogle(idToken);

      const response: ApiResponse<authService.AuthResult> = {
        success: true,
        data: result,
        message: 'Authenticated with Google successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /auth/refresh - Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);

      const response: ApiResponse<authService.TokenRefreshResult> = {
        success: true,
        data: result,
        message: 'Token refreshed successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /auth/logout - Invalidate user session
 */
router.post(
  '/logout',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const refreshToken = req.body?.refreshToken;
      await authService.logout(userId, refreshToken);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /auth/me - Retrieve current authenticated user profile
 */
router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);

      const response: ApiResponse<IUser> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /auth/me - Update authenticated user profile / preferences
 */
router.patch(
  '/me',
  authMiddleware,
  validate(updateMeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const updatedUser = await authService.updateMe(userId, req.body);

      const response: ApiResponse<IUser> = {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /auth/fcm-token - Register FCM push notification token
 */
router.post(
  '/fcm-token',
  authMiddleware,
  validate(fcmTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await authService.registerFCMToken(userId, req.body);

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: result,
        message: 'FCM token registered successfully.',
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
