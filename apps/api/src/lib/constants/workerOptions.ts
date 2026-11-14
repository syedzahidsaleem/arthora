import { redis } from '../db/redis';
import {
  isRedisQuotaExceeded,
  markRedisCircuitDegraded,
  onRedisCircuitStateChange,
} from '../db/redisState';
import type { Queue, Worker } from 'bullmq';

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

/**
 * Attaches circuit breaker resilience to a BullMQ Queue instance.
 * Automatically catches Upstash plan limits and trips in-memory fallback.
 */
export function registerQueueCircuitBreaker(queue: Queue, queueName: string): void {
  queue.on('error', (err) => {
    markRedisCircuitDegraded(err);
    if (!isRedisQuotaExceeded()) {
      console.warn(`⚠️ [BullMQ:${queueName}] Queue connection warning:`, err.message);
    }
  });
}

/**
 * Attaches circuit breaker resilience to a BullMQ Worker instance.
 * Automatically pauses the worker when Redis quota is exhausted to prevent reconnect storms.
 */
export function registerWorkerCircuitBreaker(worker: Worker, workerName: string): void {
  worker.on('error', (err) => {
    markRedisCircuitDegraded(err);
    if (isRedisQuotaExceeded()) {
      console.warn(`🛑 [BullMQ:${workerName}] Worker paused due to Upstash quota/plan limit.`);
      worker.pause(true).catch(() => {});
    }
  });

  onRedisCircuitStateChange((_degraded, quota) => {
    if (quota) {
      worker.pause(true).catch(() => {});
    }
  });
}
