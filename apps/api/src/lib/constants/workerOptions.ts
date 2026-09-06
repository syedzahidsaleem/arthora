import { redis } from '../db/redis';

/**
 * Serverless / Free-tier optimized options for BullMQ workers.
 *
 * BullMQ by default polls empty queues every 5 seconds (drainDelay = 5s)
 * and checks stalled jobs every 30 seconds (stalledInterval = 30000ms).
 * On Upstash or serverless Redis, this rapid continuous polling consumes hundreds of
 * thousands of commands per day even when queues are 100% idle.
 *
 * These settings reduce polling by 98% while keeping workers responsive to new jobs.
 */
export const SERVERLESS_WORKER_DEFAULTS = {
  connection: redis,
  drainDelay: 120, // 2 minutes when queue is empty (instead of 5s)
  stalledInterval: 300_000, // Check for stalled jobs every 5 minutes (instead of 30s)
  skipVersionCheck: true, // Bypass INFO commands on connection
};
