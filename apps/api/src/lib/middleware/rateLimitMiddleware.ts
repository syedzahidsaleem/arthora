import { Request, Response, NextFunction } from 'express';
import { redis } from '../db/redis';
import { AppError } from '../errors/AppError';

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyGenerator: (req: Request) => string;
  message?: string;
}

/**
 * Creates an Express rate limiter middleware backed by Redis sliding/fixed window pipeline.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, keyGenerator, message = 'Too many requests, please try again later.' } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Bypass rate limiting for health check probes and uptime monitors
      if (req.path === '/health' || req.path.endsWith('/health') || req.originalUrl.includes('/health')) {
        return next();
      }

      const keySuffix = keyGenerator(req);
      const key = `ratelimit:${keySuffix}`;

      if (!redis || typeof redis.pipeline !== 'function') {
        return next();
      }

      // Redis pipeline: Increment counter and set expiration if first request
      const pipeline = redis.pipeline();
      if (!pipeline || typeof pipeline.incr !== 'function') {
        return next();
      }
      pipeline.incr(key);
      pipeline.ttl(key);

      const results = await pipeline.exec();
      if (!results || results.length < 2) {
        return next();
      }

      const [incrErr, incrResult] = results[0] as [Error | null, number];
      const [ttlErr, ttlResult] = results[1] as [Error | null, number];

      if (incrErr) {
        console.error('❌ [RateLimiter] Error during INCR:', incrErr);
        return next();
      }

      const currentCount = incrResult;
      let remainingTtl = !ttlErr && typeof ttlResult === 'number' ? ttlResult : windowSeconds;

      // If key is newly created (TTL is -1), set its expiration window
      if (remainingTtl === -1 || currentCount === 1) {
        await redis.expire(key, windowSeconds);
        remainingTtl = windowSeconds;
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - currentCount));
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + remainingTtl);

      if (currentCount > max) {
        res.setHeader('Retry-After', remainingTtl > 0 ? remainingTtl : windowSeconds);
        return next(
          new AppError(
            message,
            429,
            'RATE_LIMIT_EXCEEDED',
            {
              limit: max,
              current: currentCount,
              retryAfterSeconds: remainingTtl > 0 ? remainingTtl : windowSeconds,
            },
          ),
        );
      }

      next();
    } catch (error) {
      console.error('❌ [RateLimiter] Unexpected error:', error);
      // Fail open so Redis issues don't completely block traffic
      next();
    }
  };
}

/**
 * IP extractor helper with fallback.
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

/**
 * 10 req/min per IP for authentication endpoints (register, login, google).
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => `auth:${getClientIp(req)}`,
  message: 'Too many authentication attempts. Please try again after 1 minute.',
});

/**
 * 100 req/min per user (falls back to IP if not logged in).
 */
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => `gen:${req.user?.userId || getClientIp(req)}`,
  message: 'Rate limit exceeded. Please throttle your requests.',
});

/**
 * 10 req/hour per user for AI portfolio generation.
 */
export const aiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `ai:${req.user?.userId || getClientIp(req)}`,
  message: 'AI generation limit reached (10 per hour). Please try again later.',
});

/**
 * 5 req/hour per user for PDF report generation.
 */
export const reportLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `report:${req.user?.userId || getClientIp(req)}`,
  message: 'Report generation limit reached (5 per hour). Please try again later.',
});
