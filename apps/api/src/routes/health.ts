import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../lib/db/redis';

const router: Router = Router();

let lastRedisCheck = 0;
let cachedRedisStatus: 'connected' | 'disconnected' = 'disconnected';
const REDIS_CACHE_TTL_MS = 60_000; // Cache for 60 seconds

/**
 * GET /health - Service health check monitoring
 */
router.get('/', async (_req: Request, res: Response) => {
  let mongoStatus: 'connected' | 'disconnected' = 'disconnected';
  let redisStatus = cachedRedisStatus;

  if (mongoose.connection.readyState === 1) {
    mongoStatus = 'connected';
  }

  const now = Date.now();
  if (now - lastRedisCheck > REDIS_CACHE_TTL_MS || redisStatus === 'disconnected') {
    try {
      const pong = await redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'connected';
        cachedRedisStatus = 'connected';
      } else {
        redisStatus = 'disconnected';
        cachedRedisStatus = 'disconnected';
      }
    } catch {
      redisStatus = 'disconnected';
      cachedRedisStatus = 'disconnected';
    }
    lastRedisCheck = now;
  }

  const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

  const healthData = {
    status: isHealthy ? 'ok' : 'degraded',
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  res.status(isHealthy ? 200 : 503).json(healthData);
});

export default router;
