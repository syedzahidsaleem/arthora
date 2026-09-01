import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware that assigns a unique UUID v4 request ID to incoming requests
 * and sets the X-Request-ID header on outgoing responses.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existingId = req.header('X-Request-ID');
  const reqId = existingId && existingId.length > 0 ? existingId : uuidv4();

  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  next();
}
