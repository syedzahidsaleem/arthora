import crypto from 'crypto';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { AppError } from '../errors/AppError';
import {
  getFirebaseAdmin,
  verifyFirebaseToken,
  generateAccessToken,
  generateRefreshToken,
} from '../middleware/authMiddleware';
import * as redisService from '../db/redis';
import type {
  IUser,
  FCMPlatform,
  UserPreferences,
} from '@arthora/shared';

const SESSION_TTL = 2592000; // 30 days in seconds

/**
 * Creates a sha256 hash of the token for secure Redis session storage.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Registers a new user with email, password, and name.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists in MongoDB
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
  }

  // Hash password with Argon2id
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  // Create Firebase user via Admin SDK
  let firebaseUid: string;
  try {
    const adminApp = getFirebaseAdmin();
    const firebaseUser = await adminApp.auth().createUser({
      email: normalizedEmail,
      password,
      displayName: name,
    });
    firebaseUid = firebaseUser.uid;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create Firebase user';
    throw new AppError(`Firebase user creation error: ${msg}`, 500, 'FIREBASE_ERROR');
  }

  // Create User document in MongoDB
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    firebaseUid,
    authProvider: 'email',
    emailVerified: false,
    preferences: {
      theme: 'dark',
      defaultTab: 'ai',
      currency: 'INR',
      language: 'en',
      exchange: 'NSE',
    },
    fcmTokens: [],
    lastLoginAt: new Date(),
    isActive: true,
  });

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId, firebaseUid);
  const refreshToken = generateRefreshToken(userId);

  // Store session in Redis
  const tokenHash = hashToken(refreshToken);
  await redisService.set(`session:${userId}:${tokenHash}`, userId, SESSION_TTL);

  return {
    user: user.toObject() as unknown as IUser,
    accessToken,
    refreshToken,
  };
}

/**
 * Logs in a user with email and password.
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email and select passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    // Generic error message to prevent account enumeration
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled. Please contact support.', 403, 'ACCOUNT_DISABLED');
  }

  // Verify Argon2 password
  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save();

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId, user.firebaseUid);
  const refreshToken = generateRefreshToken(userId);

  // Store session in Redis
  const tokenHash = hashToken(refreshToken);
  await redisService.set(`session:${userId}:${tokenHash}`, userId, SESSION_TTL);

  const userObj = user.toObject();
  delete (userObj as { passwordHash?: string }).passwordHash;

  return {
    user: userObj as unknown as IUser,
    accessToken,
    refreshToken,
  };
}

/**
 * Logs in or registers a user via verified Google Firebase ID token.
 */
export async function loginWithGoogle(
  firebaseIdToken: string,
): Promise<AuthResult> {
  const { uid, email, name, picture } = await verifyFirebaseToken(firebaseIdToken);

  let user = await User.findOne({ firebaseUid: uid });

  if (user) {
    // Update existing user details
    user.name = name || user.name;
    user.avatarUrl = picture || user.avatarUrl;
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    // Create new user from Google profile
    user = await User.create({
      name: name || 'Investor',
      email: email ? email.toLowerCase().trim() : undefined,
      firebaseUid: uid,
      avatarUrl: picture,
      authProvider: 'google',
      emailVerified: true,
      preferences: {
        theme: 'dark',
        defaultTab: 'ai',
        currency: 'INR',
        language: 'en',
        exchange: 'NSE',
      },
      fcmTokens: [],
      lastLoginAt: new Date(),
      isActive: true,
    });
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId, user.firebaseUid);
  const refreshToken = generateRefreshToken(userId);

  // Store session in Redis
  const tokenHash = hashToken(refreshToken);
  await redisService.set(`session:${userId}:${tokenHash}`, userId, SESSION_TTL);

  return {
    user: user.toObject() as unknown as IUser,
    accessToken,
    refreshToken,
  };
}

/**
 * Refreshes an access token using a valid refresh token with token rotation.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenRefreshResult> {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new AppError('Server configuration error: JWT_REFRESH_SECRET missing', 500, 'CONFIG_ERROR');
  }

  let decoded: { sub: string; type: string };
  try {
    decoded = jwt.verify(refreshToken, refreshSecret) as { sub: string; type: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token has expired. Please log in again.', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (decoded.type !== 'refresh' || !decoded.sub) {
    throw new AppError('Invalid token type for refresh.', 401, 'INVALID_TOKEN_TYPE');
  }

  const userId = decoded.sub;
  const oldTokenHash = hashToken(refreshToken);
  const oldSessionKey = `session:${userId}:${oldTokenHash}`;

  // Verify that the session is still active in Redis
  const sessionUser = await redisService.get(oldSessionKey);
  if (!sessionUser) {
    throw new AppError('Session has expired or was revoked. Please log in again.', 401, 'SESSION_REVOKED');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('User not found or account is deactivated.', 401, 'USER_NOT_FOUND');
  }

  // Generate rotated tokens
  const newAccessToken = generateAccessToken(userId, user.firebaseUid);
  const newRefreshToken = generateRefreshToken(userId);
  const newTokenHash = hashToken(newRefreshToken);

  // Rotate in Redis: Delete old session and store new session
  await redisService.del(oldSessionKey);
  await redisService.set(`session:${userId}:${newTokenHash}`, userId, SESSION_TTL);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Logs out a user by invalidating the refresh token session in Redis.
 */
export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await redisService.del(`session:${userId}:${tokenHash}`);
  } else {
    // If no specific refresh token is provided, delete all active sessions for this user
    const userSessions = await redisService.keys(`session:${userId}:*`);
    if (userSessions.length > 0) {
      await redisService.del(userSessions);
    }
  }
}

/**
 * Retrieves the current authenticated user profile.
 */
export async function getMe(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return user.toObject() as unknown as IUser;
}

/**
 * Updates user profile and preferences.
 */
export async function updateMe(
  userId: string,
  updates: { name?: string; avatarUrl?: string; preferences?: Partial<UserPreferences> },
): Promise<IUser> {
  const updatePayload: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updatePayload.name = updates.name.trim();
  }
  if (updates.avatarUrl !== undefined) {
    updatePayload.avatarUrl = updates.avatarUrl;
  }
  if (updates.preferences !== undefined) {
    // Update individual preference fields without overwriting the entire object
    for (const [key, val] of Object.entries(updates.preferences)) {
      updatePayload[`preferences.${key}`] = val;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updatePayload },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  return user.toObject() as unknown as IUser;
}

/**
 * Registers an FCM push notification token with deduplication and a 5-token cap per user.
 */
export async function registerFCMToken(
  userId: string,
  data: { token: string; platform: FCMPlatform },
): Promise<{ success: boolean }> {
  const user: IUserDocument | null = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  // Deduplicate: filter out identical token string if present
  const existingTokens = user.fcmTokens ? user.fcmTokens.filter((t: { token: string }) => t.token !== data.token) : [];

  // Add new token entry
  existingTokens.push({
    token: data.token,
    platform: data.platform,
    createdAt: new Date(),
  });

  // Cap to max 5 tokens (keeping the newest 5)
  if (existingTokens.length > 5) {
    user.fcmTokens = existingTokens.slice(existingTokens.length - 5);
  } else {
    user.fcmTokens = existingTokens;
  }

  await user.save();
  return { success: true };
}
