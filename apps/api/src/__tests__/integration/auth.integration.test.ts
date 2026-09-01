import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { User } from '../../lib/models/User';
import * as redisService from '../../lib/db/redis';
import * as authMiddleware from '../../lib/middleware/authMiddleware';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_32_characters_12345';

vi.mock('../../lib/models/User');
vi.mock('../../lib/db/redis');
vi.mock('argon2');
vi.mock('../../lib/middleware/authMiddleware', async (importOriginal) => {
  const actual = await importOriginal<typeof authMiddleware>();
  return {
    ...actual,
    getFirebaseAdmin: vi.fn().mockReturnValue({
      auth: () => ({
        createUser: vi.fn().mockResolvedValue({ uid: 'fb_test_uid_123' }),
      }),
    }),
    verifyFirebaseToken: vi.fn(),
  };
});

describe('Auth Integration Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers user and returns 201 with auth tokens', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null as never);
      vi.mocked(argon2.hash).mockResolvedValue('hashed_argon_pw' as never);

      const mockCreated = {
        _id: { toString: () => 'user_123' },
        firebaseUid: 'fb_test_uid_123',
        name: 'Amit Patel',
        email: 'amit@example.com',
        authProvider: 'email',
        emailVerified: false,
        preferences: { theme: 'dark' },
        fcmTokens: [],
        toObject: () => ({
          _id: 'user_123',
          name: 'Amit Patel',
          email: 'amit@example.com',
          firebaseUid: 'fb_test_uid_123',
        }),
      };
      vi.mocked(User.create).mockResolvedValue(mockCreated as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Amit Patel',
          email: 'amit@example.com',
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('amit@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('authenticates user and returns 200 with tokens', async () => {
      const mockUser = {
        _id: { toString: () => 'user_login_123' },
        firebaseUid: 'fb_login_123',
        email: 'investor@example.com',
        passwordHash: 'hashed_password_val',
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: 'user_login_123',
          email: 'investor@example.com',
          firebaseUid: 'fb_login_123',
        }),
      };

      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as never);
      vi.mocked(argon2.verify).mockResolvedValue(true as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'investor@example.com',
          password: 'CorrectPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 200 with user profile when valid Bearer token provided', async () => {
      const token = jwt.sign(
        { sub: 'user_me_123', firebaseUid: 'fb_me_123', email: 'me@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' },
      );

      vi.mocked(User.findById).mockResolvedValue({
        _id: 'user_me_123',
        name: 'Verified User',
        email: 'me@example.com',
        toObject: () => ({
          _id: 'user_me_123',
          name: 'Verified User',
          email: 'me@example.com',
        }),
      } as never);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Verified User');
    });

    it('returns 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 200 with refreshed tokens on valid refresh token', async () => {
      const validRefreshToken = jwt.sign(
        { sub: 'user_refresh_123', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' },
      );

      vi.mocked(redisService.get).mockResolvedValue('user_refresh_123' as never);
      vi.mocked(User.findById).mockResolvedValue({
        _id: 'user_refresh_123',
        firebaseUid: 'fb_ref_123',
        isActive: true,
      } as never);
      vi.mocked(redisService.del).mockResolvedValue(1 as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: validRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('returns 401 when refresh token is invalid or missing from session', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.jwt.token' });

      expect(res.status).toBe(401);
    });
  });
});
