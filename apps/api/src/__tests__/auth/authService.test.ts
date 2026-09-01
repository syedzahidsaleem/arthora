import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../lib/services/authService';
import { User } from '../../lib/models/User';
import * as redisService from '../../lib/db/redis';
import * as authMiddleware from '../../lib/middleware/authMiddleware';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { AppError } from '../../lib/errors/AppError';

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_12345';

vi.mock('../../lib/models/User');
vi.mock('../../lib/db/redis');
vi.mock('argon2');
vi.mock('../../lib/middleware/authMiddleware', async (importOriginal) => {
  const actual = await importOriginal<typeof authMiddleware>();
  return {
    ...actual,
    getFirebaseAdmin: vi.fn(),
    verifyFirebaseToken: vi.fn(),
  };
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerWithEmail', () => {
    it('successfully registers a new user with email and password', () => {
      // Mock findOne to return null (no duplicate)
      vi.mocked(User.findOne).mockResolvedValue(null as never);

      // Mock argon2 hash
      vi.mocked(argon2.hash).mockResolvedValue('hashed_pw_123' as never);

      // Mock Firebase Admin createUser
      const mockCreateUser = vi.fn().mockResolvedValue({ uid: 'firebase_uid_123' });
      vi.mocked(authMiddleware.getFirebaseAdmin).mockReturnValue({
        auth: () => ({
          createUser: mockCreateUser,
        }),
      } as never);

      // Mock User.create
      const mockCreatedUser = {
        _id: { toString: () => 'user_mongo_id_123' },
        firebaseUid: 'firebase_uid_123',
        name: 'Syed Zahid',
        email: 'test@example.com',
        authProvider: 'email',
        emailVerified: false,
        preferences: { theme: 'dark' },
        fcmTokens: [],
        toObject: () => ({
          _id: 'user_mongo_id_123',
          name: 'Syed Zahid',
          email: 'test@example.com',
          firebaseUid: 'firebase_uid_123',
        }),
      };
      vi.mocked(User.create).mockResolvedValue(mockCreatedUser as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      return authService.registerWithEmail('test@example.com', 'SecurePass123!', 'Syed Zahid').then((result) => {
        expect(result.user._id).toBe('user_mongo_id_123');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(redisService.set).toHaveBeenCalled();
      });
    });

    it('throws 409 error if email already exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ _id: 'existing_id' } as never);

      await expect(
        authService.registerWithEmail('existing@example.com', 'Password123!', 'Existing User'),
      ).rejects.toThrowError(AppError);

      await expect(
        authService.registerWithEmail('existing@example.com', 'Password123!', 'Existing User'),
      ).rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' });
    });

    it('throws 500 error if Firebase user creation fails', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null as never);
      vi.mocked(argon2.hash).mockResolvedValue('hashed_pw' as never);

      const mockCreateUser = vi.fn().mockRejectedValue(new Error('Firebase network error'));
      vi.mocked(authMiddleware.getFirebaseAdmin).mockReturnValue({
        auth: () => ({
          createUser: mockCreateUser,
        }),
      } as never);

      await expect(
        authService.registerWithEmail('test@example.com', 'Password123!', 'Test User'),
      ).rejects.toMatchObject({ statusCode: 500, code: 'FIREBASE_ERROR' });
    });
  });

  describe('loginWithEmail', () => {
    it('successfully logs in with valid credentials', async () => {
      const mockUser = {
        _id: { toString: () => 'user_123' },
        firebaseUid: 'fb_123',
        email: 'user@example.com',
        passwordHash: 'hashed_pw_correct',
        isActive: true,
        lastLoginAt: new Date(),
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: 'user_123',
          email: 'user@example.com',
          firebaseUid: 'fb_123',
        }),
      };

      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as never);

      vi.mocked(argon2.verify).mockResolvedValue(true as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const result = await authService.loginWithEmail('user@example.com', 'CorrectPassword123');
      expect(result.user._id).toBe('user_123');
      expect(result.accessToken).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('throws 401 generic error when user is not found (anti-enumeration)', async () => {
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as never);

      await expect(
        authService.loginWithEmail('nonexistent@example.com', 'Password123'),
      ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
    });

    it('throws 401 when password verification fails', async () => {
      const mockUser = {
        _id: { toString: () => 'user_123' },
        passwordHash: 'hashed_pw',
        isActive: true,
      };

      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as never);

      vi.mocked(argon2.verify).mockResolvedValue(false as never);

      await expect(
        authService.loginWithEmail('user@example.com', 'WrongPassword'),
      ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
    });
  });

  describe('loginWithGoogle', () => {
    it('creates a new user when Google UID is not registered', async () => {
      vi.mocked(authMiddleware.verifyFirebaseToken).mockResolvedValue({
        uid: 'google_uid_999',
        email: 'google@gmail.com',
        name: 'Google User',
        picture: 'https://avatar.url/img.png',
      });

      vi.mocked(User.findOne).mockResolvedValue(null as never);

      const mockNewUser = {
        _id: { toString: () => 'user_google_id' },
        firebaseUid: 'google_uid_999',
        name: 'Google User',
        email: 'google@gmail.com',
        avatarUrl: 'https://avatar.url/img.png',
        authProvider: 'google',
        toObject: () => ({
          _id: 'user_google_id',
          name: 'Google User',
          email: 'google@gmail.com',
        }),
      };
      vi.mocked(User.create).mockResolvedValue(mockNewUser as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const result = await authService.loginWithGoogle('firebase_id_token_xyz');
      expect(result.user._id).toBe('user_google_id');
      expect(User.create).toHaveBeenCalled();
    });

    it('updates an existing user when Google UID is found', async () => {
      vi.mocked(authMiddleware.verifyFirebaseToken).mockResolvedValue({
        uid: 'google_uid_existing',
        email: 'existing_google@gmail.com',
        name: 'Updated Name',
        picture: 'https://avatar.url/new.png',
      });

      const existingUser = {
        _id: { toString: () => 'existing_mongo_id' },
        firebaseUid: 'google_uid_existing',
        name: 'Old Name',
        avatarUrl: 'old.png',
        emailVerified: false,
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: 'existing_mongo_id',
          name: 'Updated Name',
        }),
      };
      vi.mocked(User.findOne).mockResolvedValue(existingUser as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const result = await authService.loginWithGoogle('firebase_token_existing');
      expect(result.user._id).toBe('existing_mongo_id');
      expect(existingUser.save).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('successfully refreshes and rotates token session', async () => {
      const validRefreshToken = jwt.sign(
        { sub: 'user_777', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' },
      );

      vi.mocked(redisService.get).mockResolvedValue('user_777' as never);
      vi.mocked(User.findById).mockResolvedValue({
        _id: 'user_777',
        firebaseUid: 'fb_777',
        isActive: true,
      } as never);
      vi.mocked(redisService.del).mockResolvedValue(1 as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const result = await authService.refreshAccessToken(validRefreshToken);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(redisService.del).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
    });

    it('throws 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { sub: 'user_777', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '-1s' },
      );

      await expect(authService.refreshAccessToken(expiredToken)).rejects.toMatchObject({
        statusCode: 401,
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    });

    it('throws 401 when Redis session is revoked or missed', async () => {
      const validToken = jwt.sign(
        { sub: 'user_777', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' },
      );

      vi.mocked(redisService.get).mockResolvedValue(null as never);

      await expect(authService.refreshAccessToken(validToken)).rejects.toMatchObject({
        statusCode: 401,
        code: 'SESSION_REVOKED',
      });
    });
  });

  describe('logout', () => {
    it('deletes session from Redis', async () => {
      vi.mocked(redisService.del).mockResolvedValue(1 as never);

      await authService.logout('user_123', 'refresh_token_to_delete');
      expect(redisService.del).toHaveBeenCalledWith(expect.stringContaining('session:user_123:'));
    });
  });

  describe('registerFCMToken', () => {
    it('deduplicates tokens and caps stored tokens to 5', async () => {
      const mockUser = {
        _id: 'user_fcm',
        fcmTokens: [
          { token: 'token_1', platform: 'android', createdAt: new Date() },
          { token: 'token_2', platform: 'ios', createdAt: new Date() },
          { token: 'token_3', platform: 'web', createdAt: new Date() },
          { token: 'token_4', platform: 'android', createdAt: new Date() },
          { token: 'token_5', platform: 'ios', createdAt: new Date() },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(User.findById).mockResolvedValue(mockUser as never);

      // Register a duplicate token (token_3) -> should not grow beyond 5
      await authService.registerFCMToken('user_fcm', { token: 'token_3', platform: 'web' });
      expect(mockUser.fcmTokens.length).toBe(5);
      expect(mockUser.save).toHaveBeenCalled();

      // Register a brand new 6th token -> should trim to exactly newest 5
      await authService.registerFCMToken('user_fcm', { token: 'token_new_6', platform: 'android' });
      expect(mockUser.fcmTokens.length).toBe(5);
      expect(mockUser.fcmTokens[4]?.token).toBe('token_new_6');
    });
  });
});
