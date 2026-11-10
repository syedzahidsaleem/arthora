import { redis } from '../db/redis';
import { isRedisDegraded, markRedisCircuitDegraded } from '../db/redisState';

/**
 * Safely attempts to enqueue a BullMQ job with a short timeout.
 * Returns false immediately when Redis is degraded/not ready or if enqueueing times out/errors,
 * allowing callers to execute an in-process asynchronous fallback.
 */
export async function safeEnqueueJob<TData>(
  queue: { add: (name: string, data: TData, opts?: Record<string, unknown>) => Promise<unknown> },
  jobName: string,
  data: TData,
  opts?: Record<string, unknown>,
  timeoutMs = 2000,
): Promise<boolean> {
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
