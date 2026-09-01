import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting middleware stub (Redis sliding window placeholder).
 * Will be fully implemented in Part 2.
 */
export function rateLimiterStub(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Stub for sliding-window Redis rate limiter
  // In Part 2, will increment Redis key and inspect window threshold
  next();
}
