import { redis } from '../db/redis';
import { isRedisDegraded, markRedisCircuitDegraded } from '../db/redisState';

/**
 * Returns true if background BullMQ queues are explicitly bypassed in favor of direct in-process execution.
 * This is recommended for free-tier deployments (e.g. Render + Upstash) to eliminate 100% of queue polling commands.
 */
export function isQueueBypassed(): boolean {
  return process.env.USE_IN_PROCESS_QUEUE === 'true' || process.env.RUN_WORKER_IN_PROCESS === 'false';
}

/**
 * Safely attempts to enqueue a BullMQ job with a short timeout.
 * Returns false immediately when queues are bypassed, when Redis is degraded/not ready,
 * or if enqueueing times out/errors, allowing callers to execute an in-process asynchronous fallback.
 */
export async function safeEnqueueJob<TData>(
  queue: { add: (name: string, data: TData, opts?: Record<string, unknown>) => Promise<unknown> },
  jobName: string,
  data: TData,
  opts?: Record<string, unknown>,
  timeoutMs = 2000,
): Promise<boolean> {
  if (isQueueBypassed()) {
    return false;
  }

  const clientStatus = (redis as unknown as { status?: string } | undefined)?.status;
  if (isRedisDegraded() || (clientStatus && clientStatus !== 'ready')) {
    return false;
  }

  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      queue.add(jobName, data, opts),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Queue "${jobName}" enqueue timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
    return true;
  } catch (err) {
    markRedisCircuitDegraded(err);
    console.warn(
      `⚠️ [Queue] Failed to enqueue "${jobName}", triggering in-process fallback:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
