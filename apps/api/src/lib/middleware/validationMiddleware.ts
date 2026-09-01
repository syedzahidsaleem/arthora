import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';

interface ZodErrorShape {
  name?: string;
  errors?: Array<{ path: Array<string | number>; message: string }>;
  issues?: Array<{ path: Array<string | number>; message: string }>;
}

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Returns 422 with structured field error details if validation fails.
 * On success, replaces req.body with the parsed/transformed result.
 *
 * @param schema - Zod schema to validate against
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error: unknown) {
      const zodErr = error as ZodErrorShape;
      if (error instanceof ZodError || zodErr?.name === 'ZodError' || Array.isArray(zodErr?.issues)) {
        const issues = zodErr.errors || zodErr.issues || [];
        const details = issues.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message || 'Invalid value',
        }));

        const appError = new AppError(
          'Validation failed',
          422,
          'VALIDATION_ERROR',
          details as unknown as Record<string, unknown>,
        );
        return next(appError);
      }

      next(error);
    }
  };
}
