const DEFAULT_COOLDOWN_MS = 60_000;
const QUOTA_COOLDOWN_MS = 30 * 60_000; // 30 minutes for hard plan/quota exhaustion

let degradedUntil = 0;
let quotaExceeded = false;
let lastDegradedLogAt = 0;

type StateChangeListener = (degraded: boolean, quotaExceeded: boolean) => void;
const listeners = new Set<StateChangeListener>();

/**
 * Returns true if a Redis error indicates an exhausted quota, Upstash plan limit, permission, or memory limit.
 */
export function isHardQuotaOrAuthError(message: string): boolean {
  return /reached current.*plan limits|plan limits|limit exceeded|daily limit|monthly limit|max requests|command limit|quota|NOPERM|NOAUTH|WRONGPASS|OOM|READONLY|ERR.*limits/i.test(
    message,
  );
}

/**
 * Returns true while external Redis is tripped into in-memory fallback cooldown.
 */
export function isRedisDegraded(): boolean {
  return Date.now() < degradedUntil;
}

/**
 * Returns true if a hard quota or authentication failure has been observed on external Redis.
 */
export function isRedisQuotaExceeded(): boolean {
  return quotaExceeded;
}

/**
 * Subscribes to circuit state changes (e.g. to pause BullMQ workers during outages).
 */
export function onRedisCircuitStateChange(listener: StateChangeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  const degraded = isRedisDegraded();
  const quota = isRedisQuotaExceeded();
  for (const listener of listeners) {
    try {
      listener(degraded, quota);
    } catch (err) {
      console.warn('⚠️ [RedisState] Error in state listener:', err);
    }
  }
}

/**
 * Marks external Redis degraded and rate-limits warning logs.
 * Upstash/quota limits automatically enforce a 30-minute cooldown to prevent reconnection storms.
 */
export function markRedisCircuitDegraded(
  error?: unknown,
  cooldownMs = DEFAULT_COOLDOWN_MS,
): void {
  const msg = error instanceof Error ? error.message : String(error || 'Redis unavailable');
  const isQuota = isHardQuotaOrAuthError(msg);

  if (isQuota) {
    quotaExceeded = true;
    cooldownMs = Math.max(cooldownMs, QUOTA_COOLDOWN_MS);
  }

  degradedUntil = Math.max(degradedUntil, Date.now() + cooldownMs);

  if (Date.now() - lastDegradedLogAt > 60_000) {
    lastDegradedLogAt = Date.now();
    console.warn(
      `⚠️ [Redis] Entering in-memory fallback mode for ${Math.round(cooldownMs / 1000)}s (${msg}).`,
    );
  }

  notifyListeners();
}

/**
 * Resets circuit breaker state when Redis recovers or between test cases.
 */
export function resetRedisCircuitState(): void {
  degradedUntil = 0;
  quotaExceeded = false;
  lastDegradedLogAt = 0;
  notifyListeners();
}
