import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../lib/db/redis';

const router: Router = Router();

/**
 * GET /health - Service health check monitoring
 */
router.get('/', async (_req: Request, res: Response) => {
  let mongoStatus: 'connected' | 'disconnected' = 'disconnected';
  let redisStatus: 'connected' | 'disconnected' = 'disconnected';

  if (mongoose.connection.readyState === 1) {
    mongoStatus = 'connected';
  }

  try {
    const pong = await redis.ping();
    if (pong === 'PONG') {
      redisStatus = 'connected';
    }
  } catch {
    redisStatus = 'disconnected';
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
