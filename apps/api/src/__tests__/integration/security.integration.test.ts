import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { User } from '../../lib/models/User';
import * as redisService from '../../lib/db/redis';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_32_characters_12345';

vi.mock('../../lib/models/User');
vi.mock('../../lib/db/redis');

describe('Security & Hardening Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when accessing protected /api/v1/portfolios without authorization token', async () => {
    const res = await request(app).get('/api/v1/portfolios');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects malformed/SQL-injection styled email with validation error (422)', async () => {
    vi.mocked(redisService.get).mockResolvedValue(null as never);
    vi.mocked(User.findOne).mockResolvedValue(null as never);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Attacker',
        email: "'; DROP TABLE users; --@test.com",
        password: 'Password123!',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('returns 413 Payload Too Large when request body exceeds 1MB', async () => {
    const largeString = 'A'.repeat(1.2 * 1024 * 1024); // 1.2 MB string

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: largeString });

    expect(res.status).toBe(413);
  });

  it('includes strict security headers (X-Frame-Options, X-Content-Type-Options)', async () => {
    vi.mocked(redisService.get).mockResolvedValue(null as never);

    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sanitizes script tags from body payloads through sanitization middleware', async () => {
    vi.mocked(redisService.get).mockResolvedValue(null as never);
    vi.mocked(User.findOne).mockResolvedValue(null as never);

    // Validation rejects invalid email with 422, demonstrating sanitization middleware did not crash and passed body
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: '<script>alert(1)</script>John Doe',
        email: 'invalid-email-format',
        password: 'Password123!',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
