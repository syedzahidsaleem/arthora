import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError } from '../errors/AppError';
import type { ApiResponse } from '@arthora/shared';

export { AppError };

interface ZodLikeIssue {
  path?: Array<string | number> | string;
  message?: string;
}

interface CustomHttpError {
  status?: number;
  statusCode?: number;
  type?: string;
  code?: number;
  name?: string;
  issues?: ZodLikeIssue[];
  errors?: ZodLikeIssue[];
}

/**
 * 404 Not Found catch-all middleware.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND',
  );
  next(error);
}

/**
 * Global centralized error handling middleware.
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected internal server error occurred';
  let details: Record<string, unknown> | Array<unknown> | undefined;

  const customErr = err as unknown as CustomHttpError;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (customErr.type === 'entity.too.large' || customErr.status === 413) {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    message = 'Request body exceeds size limit';
  } else if (err.name === 'ZodError' || Array.isArray(customErr.issues)) {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    const issues = customErr.issues || customErr.errors || [];
    details = issues.map((item: ZodLikeIssue) => ({
      field: Array.isArray(item.path) ? item.path.join('.') : String(item.path || ''),
      message: item.message || 'Invalid value',
    }));
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID provided in request';
  } else if (customErr.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    message = 'Duplicate entry conflict with existing records';
  } else if (typeof customErr.status === 'number' && customErr.status >= 400 && customErr.status < 600) {
    statusCode = customErr.status;
    message = err.message || message;
  } else {
    if (process.env.SENTRY_DSN) {
      try {
        Sentry.captureException(err);
      } catch (sentryErr) {
        console.warn('Failed to capture exception in Sentry', sentryErr);
      }
    }
    console.error(`💥 [${req.id || 'N/A'}] Unhandled Exception:`, err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
      stack: isProduction ? undefined : err.stack,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
