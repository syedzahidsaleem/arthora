import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import type { ApiResponse } from '@arthora/shared';

/**
 * 404 Not Found catch-all middleware.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const error = new AppError(
    `Cannot find resource ${req.method} ${req.originalUrl} on this server`,
    404,
    'RESOURCE_NOT_FOUND',
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

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID provided in request';
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if ('code' in err && (err as { code: number }).code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    message = 'Duplicate entry conflict with existing records';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction && statusCode === 500) {
    console.error(`💥 [${req.id || 'N/A'}] Unhandled Exception:`, err);
  }

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
