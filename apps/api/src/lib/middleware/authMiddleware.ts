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
 * Normalizes and formats PEM private keys from environment variables.
 * Handles escaped newlines, surrounding quotes, single-line flattening, and base64 encoding.
 */
function cleanPrivateKey(rawKey: string | undefined): string | undefined {
  if (!rawKey) return undefined;

  let key = rawKey.trim();

  // Strip leading and trailing quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // Detect base64 without PEM markers
  if (!key.includes('BEGIN') && key.length > 50) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('BEGIN')) {
        key = decoded.trim();
      }
    } catch {
      // Not base64
    }
  }

  // Replace literal '\n' and carriage returns
  key = key.replace(/\\n/g, '\n').replace(/\r/g, '');

  // Ensure standard OpenSSL PEM structure with 64-char chunked lines
  if (key.includes('BEGIN') && key.includes('END')) {
    const beginMatch = key.match(/-----BEGIN[ A-Z0-9_-]+-----/);
    const endMatch = key.match(/-----END[ A-Z0-9_-]+-----/);

    if (beginMatch && endMatch) {
      const beginHeader = beginMatch[0];
      const endFooter = endMatch[0];
      const beginIndex = key.indexOf(beginHeader);
      const endIndex = key.indexOf(endFooter);

      if (beginIndex !== -1 && endIndex !== -1) {
        const body = key.slice(beginIndex + beginHeader.length, endIndex).trim();
        const cleanBody = body.replace(/\s+/g, '');
        const chunks: string[] = [];
        for (let i = 0; i < cleanBody.length; i += 64) {
          chunks.push(cleanBody.slice(i, i + 64));
        }
        key = `${beginHeader}\n${chunks.join('\n')}\n${endFooter}\n`;
      }
    }
  }

  return key;
}

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
  const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('✅ [Firebase Admin] Initialized with service account credentials.');
    } catch (certError) {
      console.warn('⚠️ [Firebase Admin] Failed to initialize with cert credentials, falling back to projectId:', certError);
      firebaseApp = admin.initializeApp({
        projectId,
      });
    }
  } else {
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
    const errMsg = error instanceof Error ? error.message : String(error);
    // If cert decoding failed or key was invalid, re-initialize without cert to verify using Google's public keys
    if (errMsg.includes('private key') || errMsg.includes('DECODER')) {
      try {
        console.warn('⚠️ [Firebase] Retrying ID token verification using Google public certificates...');
        if (admin.apps.length > 0) {
          await Promise.all(admin.apps.map((app) => app?.delete().catch(() => {})));
        }
        firebaseApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'arthora-659a8',
        });
        const decoded = await firebaseApp.auth().verifyIdToken(idToken);
        return {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
      } catch (retryError) {
        console.error('❌ [Firebase] Public token verification retry also failed:', retryError);
      }
    }
    throw new AppError(`Firebase authentication failed: ${errMsg}`, 401, 'INVALID_FIREBASE_TOKEN');
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
