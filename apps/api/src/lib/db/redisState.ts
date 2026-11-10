const DEFAULT_COOLDOWN_MS = 60_000;

let degradedUntil = 0;
let quotaExceeded = false;
let lastDegradedLogAt = 0;

/**
 * Returns true if a Redis error indicates an exhausted quota, permission, or memory limit.
 */
export function isHardQuotaOrAuthError(message: string): boolean {
  return /max requests limit exceeded|NOPERM|NOAUTH|WRONGPASS|OOM|READONLY/i.test(message);
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
 * Marks external Redis degraded for cooldownMs (default 60s) and rate-limits warning logs.
 */
export function markRedisCircuitDegraded(
  error?: unknown,
  cooldownMs = DEFAULT_COOLDOWN_MS,
): void {
  const msg = error instanceof Error ? error.message : String(error || 'Redis unavailable');
  if (isHardQuotaOrAuthError(msg)) {
    quotaExceeded = true;
  }
  degradedUntil = Date.now() + cooldownMs;
  if (Date.now() - lastDegradedLogAt > 30_000) {
    lastDegradedLogAt = Date.now();
    console.warn(
      `⚠️ [Redis] Entering in-memory fallback mode for ${Math.round(cooldownMs / 1000)}s (${msg}).`,
    );
  }
}

/**
 * Resets circuit breaker state when Redis recovers or between test cases.
 */
export function resetRedisCircuitState(): void {
  degradedUntil = 0;
  quotaExceeded = false;
  lastDegradedLogAt = 0;
}
