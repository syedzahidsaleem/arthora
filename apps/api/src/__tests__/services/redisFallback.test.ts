import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as redisService from '../../lib/db/redis';
import { isRedisDegraded, resetRedisCircuitState } from '../../lib/db/redisState';
import { safeEnqueueJob } from '../../lib/utils/safeQueue';

describe('Redis Degradation & In-Memory Fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetRedisCircuitState();
  });

  afterEach(() => {
    resetRedisCircuitState();
  });

  it('serves get, set, exists, incr, expire, and del from in-memory fallback when Redis is marked degraded', async () => {
    redisService.markRedisDegraded(new Error('ERR max requests limit exceeded'));
    expect(redisService.isRedisUsable()).toBe(false);

    const setRes = await redisService.set('session:u1:hash1', 'u1', 60);
    expect(setRes).toBe('OK');

    const existsBefore = await redisService.exists('session:u1:hash1');
    expect(existsBefore).toBe(true);

    const val = await redisService.get<string>('session:u1:hash1');
    expect(val).toBe('u1');

    const count1 = await redisService.incr('ratelimit:test');
    const count2 = await redisService.incr('ratelimit:test');
    expect(count1).toBe(1);
    expect(count2).toBe(2);

    const keys = await redisService.keys('session:u1:*');
    expect(keys).toContain('session:u1:hash1');

    const deleted = await redisService.del('session:u1:hash1');
    expect(deleted).toBe(1);
    expect(await redisService.get('session:u1:hash1')).toBeNull();
  });

  it('returns false quickly from pingRedisSafe when degraded without throwing', async () => {
    redisService.markRedisDegraded(new Error('Connection closed'));
    const ok = await redisService.pingRedisSafe(100);
    expect(ok).toBe(false);
  });

  it('skips BullMQ enqueue immediately in safeEnqueueJob when circuit breaker is degraded', async () => {
    redisService.markRedisDegraded(new Error('ERR max requests limit exceeded'));
    expect(isRedisDegraded()).toBe(true);

    const mockQueue = { add: vi.fn().mockResolvedValue({ id: 'job-1' }) };
    const queued = await safeEnqueueJob(mockQueue, 'test-job', { schemeCode: '118834' });

    expect(queued).toBe(false);
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('detects Upstash fixed plan limits and marks quota exceeded with extended cooldown', async () => {
    const upstashErr = new Error(
      'ERR This database has reached current Fixed plan limits. Please upgrade manually or enable auto upgrade on Upstash Console',
    );
    redisService.markRedisDegraded(upstashErr);

    expect(isRedisDegraded()).toBe(true);
    const { isRedisQuotaExceeded } = await import('../../lib/db/redisState');
    expect(isRedisQuotaExceeded()).toBe(true);
  });

  it('bypasses BullMQ enqueue immediately when USE_IN_PROCESS_QUEUE is set', async () => {
    const originalEnv = process.env.USE_IN_PROCESS_QUEUE;
    process.env.USE_IN_PROCESS_QUEUE = 'true';

    try {
      const mockQueue = { add: vi.fn().mockResolvedValue({ id: 'job-1' }) };
      const queued = await safeEnqueueJob(mockQueue, 'test-job', { schemeCode: '118834' });

      expect(queued).toBe(false);
      expect(mockQueue.add).not.toHaveBeenCalled();
    } finally {
      process.env.USE_IN_PROCESS_QUEUE = originalEnv;
    }
  });
});
