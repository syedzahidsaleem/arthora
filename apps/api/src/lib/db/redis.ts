import 'dotenv/config';
import Redis, { RedisOptions } from 'ioredis';
import {
  isHardQuotaOrAuthError,
  isRedisDegraded,
  isRedisQuotaExceeded,
  markRedisCircuitDegraded,
  resetRedisCircuitState,
} from './redisState';

const REDIS_COMMAND_TIMEOUT_MS = 1500;
const REDIS_DEGRADED_COOLDOWN_MS = 60_000;
const FALLBACK_MAX_KEYS = 5000;

interface FallbackEntry {
  value: string;
  expiresAt: number | null;
}

/**
 * In-memory TTL key-value fallback used when external Redis is unavailable or quota-limited.
 */
class FallbackMemoryStore {
  private entries = new Map<string, FallbackEntry>();

  private pruneIfExpired(key: string): FallbackEntry | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }
    return entry;
  }

  private evictIfNeeded(): void {
    if (this.entries.size < FALLBACK_MAX_KEYS) return;
    const now = Date.now();
    for (const [k, v] of this.entries) {
      if (v.expiresAt !== null && now > v.expiresAt) {
        this.entries.delete(k);
      }
    }
    if (this.entries.size >= FALLBACK_MAX_KEYS) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
  }

  get(key: string): string | null {
    return this.pruneIfExpired(key)?.value ?? null;
  }

  set(key: string, value: string, ttlSeconds?: number): 'OK' {
    this.evictIfNeeded();
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.entries.set(key, { value, expiresAt });
    return 'OK';
  }

  del(keys: string | string[]): number {
    const list = Array.isArray(keys) ? keys : [keys];
    let removed = 0;
    for (const key of list) {
      if (this.entries.delete(key)) removed++;
    }
    return removed;
  }

  exists(key: string): boolean {
    return this.pruneIfExpired(key) !== null;
  }

  incr(key: string): number {
    const existing = this.pruneIfExpired(key);
    const current = existing ? parseInt(existing.value, 10) || 0 : 0;
    const next = current + 1;
    this.entries.set(key, {
      value: String(next),
      expiresAt: existing?.expiresAt ?? null,
    });
    return next;
  }

  expire(key: string, ttlSeconds: number): boolean {
    const existing = this.pruneIfExpired(key);
    if (!existing) return false;
    existing.expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    return true;
  }

  keys(pattern: string): string[] {
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    const matched: string[] = [];
    for (const key of this.entries.keys()) {
      if (this.pruneIfExpired(key) && regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }
}

class InMemoryRedisMock {
  private store = new FallbackMemoryStore();
  public status = 'ready';

  on(_event: string, _callback: (...args: unknown[]) => void) { return this; }
  once(_event: string, _callback: (...args: unknown[]) => void) { return this; }
  off(_event: string, _callback: (...args: unknown[]) => void) { return this; }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key);
  }

  async set(key: string, value: string, mode?: string, ttl?: number): Promise<'OK'> {
    const ttlSeconds = mode === 'EX' && typeof ttl === 'number' ? ttl : undefined;
    return this.store.set(key, value, ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    return this.store.del(keys);
  }

  async exists(key: string): Promise<number> {
    return this.store.exists(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    return this.store.incr(key);
  }

  async expire(key: string, ttl: number): Promise<number> {
    return this.store.expire(key, ttl) ? 1 : 0;
  }

  async ttl(_key: string): Promise<number> {
    return 3600;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.store.keys(pattern);
  }

  pipeline() {
    const ops: Array<() => number> = [];
    const store = this.store;
    return {
      incr(k: string) {
        ops.push(() => store.incr(k));
        return this;
      },
      ttl(_k: string) {
        ops.push(() => 60);
        return this;
      },
      async exec() {
        return ops.map((fn) => [null, fn()]);
      },
    };
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }

  disconnect(): void {}
}

function withCommandTimeout<T>(promise: Promise<T>, timeoutMs = REDIS_COMMAND_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Redis command timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis | null = null;
  private isShutdownRegistered = false;
  public readonly fallbackStore = new FallbackMemoryStore();

  private constructor() {
    this.initClient();
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public isUsable(): boolean {
    if (!this.client) return false;
    if (isRedisDegraded()) return false;
    return this.client.status === 'ready';
  }

  public markDegraded(error?: unknown): void {
    markRedisCircuitDegraded(error, REDIS_DEGRADED_COOLDOWN_MS);
  }

  private initClient(): void {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      this.client = new InMemoryRedisMock() as unknown as Redis;
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const options: RedisOptions = {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 5000,
      retryStrategy: (times: number) => {
        if (isRedisQuotaExceeded()) {
          return REDIS_DEGRADED_COOLDOWN_MS;
        }
        const delay = Math.min(times * 500, 15_000);
        if (times <= 3) {
          console.warn(`🔁 [Redis] Reconnecting attempt #${times} in ${delay}ms...`);
        }
        return delay;
      },
      reconnectOnError: (err) => {
        if (isHardQuotaOrAuthError(err.message)) {
          this.markDegraded(err);
          return false;
        }
        return false;
      },
    };

    try {
      this.client = new Redis(redisUrl, options);

      this.client.on('connect', () => {
        console.log('✅ [Redis] Connection established.');
      });

      this.client.on('ready', () => {
        resetRedisCircuitState();
        console.log('🚀 [Redis] Client ready to process commands.');
      });

      this.client.on('error', (err: Error) => {
        this.markDegraded(err);
      });

      this.client.on('close', () => {
        if (!isRedisQuotaExceeded()) {
          console.warn('⚠️ [Redis] Connection closed.');
        }
      });

      if (!this.isShutdownRegistered) {
        this.registerGracefulShutdown();
        this.isShutdownRegistered = true;
      }
    } catch (err) {
      this.markDegraded(err);
      this.client = null;
    }
  }

  private registerGracefulShutdown(): void {
    const handleShutdown = async (signal: string) => {
      console.log(`\n🛑 [Redis] Received ${signal}. Disconnecting Redis gracefully...`);
      if (this.client) {
        try {
          await this.client.quit();
          console.log('🔒 [Redis] Disconnected successfully.');
        } catch (err) {
          console.error('❌ [Redis] Error disconnecting:', err);
        }
      }
    };

    process.once('SIGINT', () => handleShutdown('SIGINT'));
    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
  }

  public getClient(): Redis {
    if (!this.client) {
      this.initClient();
    }
    return this.client!;
  }
}

export const redisConnection = RedisConnection.getInstance();
export const redis = redisConnection.getClient();

export function isRedisUsable(): boolean {
  return redisConnection.isUsable();
}

export function markRedisDegraded(error?: unknown): void {
  redisConnection.markDegraded(error);
}

/**
 * Safely pings Redis with a short timeout so /health never hangs when Redis is unreachable.
 */
export async function pingRedisSafe(timeoutMs = REDIS_COMMAND_TIMEOUT_MS): Promise<boolean> {
  if (!redisConnection.isUsable()) {
    return false;
  }
  try {
    const pong = await withCommandTimeout(redis.ping(), timeoutMs);
    return pong === 'PONG';
  } catch (error) {
    redisConnection.markDegraded(error);
    return false;
  }
}

/**
 * Retrieves a parsed JSON or string value from Redis, falling back to in-memory cache if degraded.
 */
export async function get<T = unknown>(key: string): Promise<T | null> {
  const parseRaw = (raw: string | null): T | null => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  };

  if (redisConnection.isUsable()) {
    try {
      const raw = await withCommandTimeout(redis.get(key));
      return parseRaw(raw);
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return parseRaw(redisConnection.fallbackStore.get(key));
}

/**
 * Sets a value in Redis (with optional TTL) or in-memory fallback when Redis is degraded.
 */
export async function set(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<'OK' | null> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  redisConnection.fallbackStore.set(key, stringValue, ttlSeconds);

  if (redisConnection.isUsable()) {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        return await withCommandTimeout(redis.set(key, stringValue, 'EX', ttlSeconds));
      }
      return await withCommandTimeout(redis.set(key, stringValue));
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return 'OK';
}

/**
 * Deletes a key or list of keys from Redis and in-memory fallback.
 */
export async function del(key: string | string[]): Promise<number> {
  const fallbackCount = redisConnection.fallbackStore.del(key);

  if (redisConnection.isUsable()) {
    try {
      if (Array.isArray(key)) {
        if (key.length === 0) return 0;
        return await withCommandTimeout(redis.del(...key));
      }
      return await withCommandTimeout(redis.del(key));
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return fallbackCount;
}

/**
 * Checks if a key exists in Redis or in-memory fallback.
 */
export async function exists(key: string): Promise<boolean> {
  if (redisConnection.isUsable()) {
    try {
      const count = await withCommandTimeout(redis.exists(key));
      return count > 0;
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return redisConnection.fallbackStore.exists(key);
}

/**
 * Increments the integer value of a key by 1.
 */
export async function incr(key: string): Promise<number> {
  if (redisConnection.isUsable()) {
    try {
      return await withCommandTimeout(redis.incr(key));
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return redisConnection.fallbackStore.incr(key);
}

/**
 * Sets an expiration timeout on a key in seconds.
 */
export async function expire(key: string, ttlSeconds: number): Promise<boolean> {
  redisConnection.fallbackStore.expire(key, ttlSeconds);

  if (redisConnection.isUsable()) {
    try {
      const res = await withCommandTimeout(redis.expire(key, ttlSeconds));
      return res === 1;
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return true;
}

/**
 * Finds all keys matching the given glob pattern.
 */
export async function keys(pattern: string): Promise<string[]> {
  if (redisConnection.isUsable()) {
    try {
      return await withCommandTimeout(redis.keys(pattern));
    } catch (error) {
      redisConnection.markDegraded(error);
    }
  }

  return redisConnection.fallbackStore.keys(pattern);
}

export default {
  client: redis,
  get,
  set,
  del,
  exists,
  incr,
  expire,
  keys,
};
