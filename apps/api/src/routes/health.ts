import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../lib/db/redis';
import { isRedisDegraded } from '../lib/db/redisState';

const router: Router = Router();

let lastRedisCheck = 0;
let cachedRedisStatus: 'connected' | 'degraded' | 'disconnected' = 'disconnected';
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
  if (isRedisDegraded()) {
    redisStatus = 'degraded';
    cachedRedisStatus = 'degraded';
  } else if (now - lastRedisCheck > REDIS_CACHE_TTL_MS || redisStatus !== 'connected') {
    const clientStatus = (redis as unknown as { status?: string } | undefined)?.status;
    if (clientStatus && clientStatus !== 'ready') {
      redisStatus = 'degraded';
      cachedRedisStatus = 'degraded';
    } else {
      let timer: NodeJS.Timeout | undefined;
      try {
        const pong = await Promise.race([
          redis.ping(),
          new Promise<string>((resolve) => {
            timer = setTimeout(() => resolve('TIMEOUT'), 1500);
          }),
        ]).finally(() => {
          if (timer) clearTimeout(timer);
        });

        if (pong === 'PONG') {
          redisStatus = 'connected';
          cachedRedisStatus = 'connected';
        } else {
          redisStatus = 'degraded';
          cachedRedisStatus = 'degraded';
        }
      } catch {
        redisStatus = 'degraded';
        cachedRedisStatus = 'degraded';
      }
    }
    lastRedisCheck = now;
  }

  const isMongoHealthy = mongoStatus === 'connected';
  const status = isMongoHealthy && redisStatus === 'connected' ? 'ok' : 'degraded';

  const healthData = {
    status,
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    version: '1.0.0',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  };

  // MongoDB is the primary backing store; Redis degrades gracefully to in-memory fallback
  res.status(isMongoHealthy ? 200 : 503).json(healthData);
});

export default router;
