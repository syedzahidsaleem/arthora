import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import mongoose from 'mongoose';
import { redis } from '../../lib/db/redis';

vi.mock('../../lib/db/redis', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
  },
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

describe('Health Check Integration Endpoint', () => {
  it('returns 200 with status ok when MongoDB and Redis are connected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
    vi.mocked(redis.ping).mockResolvedValue('PONG');

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.services.mongodb).toBe('connected');
    expect(res.body.services.redis).toBe('connected');
  });

  it('returns 503 with degraded status when MongoDB is disconnected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
    vi.mocked(redis.ping).mockResolvedValue('PONG');

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.services.mongodb).toBe('disconnected');
  });
});
