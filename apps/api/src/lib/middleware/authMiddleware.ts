import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import * as Sentry from '@sentry/node';
import { AppError } from '../errors/AppError';

export interface AuthUser {
  userId: string;
  firebaseUid: string;
  email?: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AuthUser;
    }
  }
}

let firebaseApp: admin.app.App | null = null;

/**
 * Initializes and returns the Firebase Admin SDK singleton instance.
 */
export function getFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (admin.apps.length > 0 && admin.apps[0]) {
    firebaseApp = admin.apps[0];
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback initialize for testing or dev environments without certs
    firebaseApp = admin.initializeApp({
      projectId: projectId || 'arthora-dev',
    });
  }

  return firebaseApp;
}

/**
 * Verifies a Firebase ID Token using Firebase Admin SDK.
 *
 * @param idToken - The Firebase ID token string from client SDK
 * @returns Decoded token payload with uid, email, name, picture
 */
export async function verifyFirebaseToken(idToken: string): Promise<{
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}> {
  try {
    const adminApp = getFirebaseAdmin();
    const decoded = await adminApp.auth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Firebase ID token';
    throw new AppError(`Firebase authentication failed: ${message}`, 401, 'INVALID_FIREBASE_TOKEN');
  }
}

/**
 * Generates an Access Token JWT (HS256, 1 hour).
 *
 * @param userId - MongoDB User ID
 * @param firebaseUid - Firebase Auth UID
 */
export function generateAccessToken(userId: string, firebaseUid: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET environment variable is not defined', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(
    {
      sub: userId,
      firebaseUid,
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
    },
  );
}

/**
 * Generates a Refresh Token JWT (HS256, 30 days).
 *
 * @param userId - MongoDB User ID
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new AppError('JWT_REFRESH_SECRET environment variable is not defined', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '30d',
    },
  );
}

/**
 * Express middleware to authenticate incoming requests via Bearer JWT accessToken.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication token is missing.', 401, 'UNAUTHORIZED'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError('Server configuration error: JWT_SECRET missing', 500, 'CONFIG_ERROR'));
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      sub: string;
      firebaseUid: string;
      email?: string;
    };

    req.user = {
      userId: decoded.sub,
      firebaseUid: decoded.firebaseUid,
      email: decoded.email,
    };

    if (process.env.SENTRY_DSN) {
      try {
        Sentry.setUser({ id: decoded.sub, email: decoded.email });
      } catch (err) {
        console.warn('Failed to set Sentry user context', err);
      }
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Access token has expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid access token', 401, 'INVALID_TOKEN'));
  }
}

/**
 * Express middleware for optional authentication: populates req.user if token is present and valid,
 * otherwise proceeds without throwing an error.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      sub: string;
      firebaseUid: string;
      email?: string;
    };

    req.user = {
      userId: decoded.sub,
      firebaseUid: decoded.firebaseUid,
      email: decoded.email,
    };
  } catch {
    // Silently ignore invalid or expired token for optional auth
  }

  next();
}
