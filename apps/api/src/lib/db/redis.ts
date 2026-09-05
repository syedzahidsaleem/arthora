import 'dotenv/config';
import Redis, { RedisOptions } from 'ioredis';

class InMemoryRedisMock {
  private storage = new Map<string, string>();
  public status = 'ready';

  on(_event: string, _callback: (...args: unknown[]) => void) { return this; }
  once(_event: string, _callback: (...args: unknown[]) => void) { return this; }
  off(_event: string, _callback: (...args: unknown[]) => void) { return this; }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get(key: string): Promise<string | null> {
    return this.storage.has(key) ? this.storage.get(key)! : null;
  }

  async set(key: string, value: string, ..._args: unknown[]): Promise<'OK'> {
    this.storage.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const k of keys) {
      if (this.storage.delete(k)) count++;
    }
    return count;
  }

  async exists(key: string): Promise<number> {
    return this.storage.has(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.storage.get(key) || '0', 10);
    const next = current + 1;
    this.storage.set(key, String(next));
    return next;
  }

  async expire(_key: string, _ttl: number): Promise<number> {
    return 1;
  }

  async ttl(_key: string): Promise<number> {
    return 3600;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.storage.keys()).filter((k) => regex.test(k));
  }

  pipeline() {
    let count = 1;
    return {
      incr: (k: string) => {
        const val = parseInt(this.storage.get(k) || '0', 10) + 1;
        this.storage.set(k, String(val));
        count = val;
        return this;
      },
      ttl: (_k: string) => this,
      exec: async () => [[null, count], [null, 60]],
    };
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }

  disconnect(): void {}
}

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis | null = null;
  private isShutdownRegistered: boolean = false;

  private constructor() {
    this.initClient();
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
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
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 200, 3000);
        console.warn(`🔁 [Redis] Reconnecting attempt #${times} in ${delay}ms...`);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Reconnect when a slave becomes a master
          return true;
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
        console.log('🚀 [Redis] Client ready to process commands.');
      });

      this.client.on('error', (err: Error) => {
        // Non-fatal error logging: do not crash process
        console.error('❌ [Redis] Error encountered:', err.message);
      });

      this.client.on('close', () => {
        console.warn('⚠️ [Redis] Connection closed.');
      });

      if (!this.isShutdownRegistered) {
        this.registerGracefulShutdown();
        this.isShutdownRegistered = true;
      }
    } catch (err) {
      console.error('❌ [Redis] Initialization failed:', err);
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

/**
 * Retrieves a parsed JSON or string value from Redis.
 *
 * @param key - The cache key
 * @returns Parsed value or null if not found
 */
export async function get<T = unknown>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch (error) {
    console.error(`❌ [Redis.get] Failed for key "${key}":`, error);
    return null;
  }
}

/**
 * Sets a value in Redis with optional TTL in seconds.
 *
 * @param key - The cache key
 * @param value - Value to serialize and store
 * @param ttlSeconds - Optional time to live in seconds
 */
export async function set(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<'OK' | null> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      return await redis.set(key, stringValue, 'EX', ttlSeconds);
    }
    return await redis.set(key, stringValue);
  } catch (error) {
    console.error(`❌ [Redis.set] Failed for key "${key}":`, error);
    return null;
  }
}

/**
 * Deletes a key or list of keys from Redis.
 *
 * @param key - Single key or array of keys to remove
 */
export async function del(key: string | string[]): Promise<number> {
  try {
    if (Array.isArray(key)) {
      if (key.length === 0) return 0;
      return await redis.del(...key);
    }
    return await redis.del(key);
  } catch (error) {
    console.error(`❌ [Redis.del] Failed for key "${key}":`, error);
    return 0;
  }
}

/**
 * Checks if a key exists in Redis.
 *
 * @param key - The cache key to check
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const count = await redis.exists(key);
    return count > 0;
  } catch (error) {
    console.error(`❌ [Redis.exists] Failed for key "${key}":`, error);
    return false;
  }
}

/**
 * Increments the integer value of a key by 1.
 *
 * @param key - The counter key
 */
export async function incr(key: string): Promise<number> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error(`❌ [Redis.incr] Failed for key "${key}":`, error);
    throw error;
  }
}

/**
 * Sets an expiration timeout on a key in seconds.
 *
 * @param key - The cache key
 * @param ttlSeconds - TTL in seconds
 */
export async function expire(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const res = await redis.expire(key, ttlSeconds);
    return res === 1;
  } catch (error) {
    console.error(`❌ [Redis.expire] Failed for key "${key}":`, error);
    return false;
  }
}

/**
 * Finds all keys matching the given glob pattern.
 *
 * @param pattern - Pattern to search (e.g., 'fund:detail:*')
 */
export async function keys(pattern: string): Promise<string[]> {
  try {
    return await redis.keys(pattern);
  } catch (error) {
    console.error(`❌ [Redis.keys] Failed for pattern "${pattern}":`, error);
    return [];
  }
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
