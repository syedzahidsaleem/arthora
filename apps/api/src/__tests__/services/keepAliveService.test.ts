import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getKeepAliveConfig, startKeepAliveBot, stopKeepAliveBot } from '../../lib/services/keepAliveService';

describe('keepAliveService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    stopKeepAliveBot();
  });

  afterEach(() => {
    process.env = originalEnv;
    stopKeepAliveBot();
    vi.restoreAllMocks();
  });

  it('returns null in development when no explicit ping URL is set', () => {
    delete process.env.SELF_PING_URL;
    delete process.env.KEEP_ALIVE_URL;
    delete process.env.RENDER_EXTERNAL_URL;
    process.env.NODE_ENV = 'development';

    const config = getKeepAliveConfig();
    expect(config).toBeNull();
  });

  it('resolves production default URL when NODE_ENV is production', () => {
    delete process.env.SELF_PING_URL;
    delete process.env.KEEP_ALIVE_URL;
    delete process.env.RENDER_EXTERNAL_URL;
    process.env.NODE_ENV = 'production';

    const config = getKeepAliveConfig();
    expect(config).not.toBeNull();
    expect(config?.targetUrl).toBe('https://arthora-api.onrender.com');
    expect(config?.intervalMs).toBe(600000);
  });

  it('respects custom SELF_PING_URL and KEEP_ALIVE_INTERVAL_MS', () => {
    process.env.SELF_PING_URL = 'https://custom-api.domain.com/';
    process.env.KEEP_ALIVE_INTERVAL_MS = '300000';

    const config = getKeepAliveConfig();
    expect(config).not.toBeNull();
    expect(config?.targetUrl).toBe('https://custom-api.domain.com');
    expect(config?.intervalMs).toBe(300000);
  });

  it('starts and stops keep alive timer cleanly', () => {
    process.env.SELF_PING_URL = 'https://arthora-api.onrender.com';
    const timer = startKeepAliveBot();
    expect(timer).not.toBeNull();

    stopKeepAliveBot();
    // Subsequent stop should be idempotent
    expect(() => stopKeepAliveBot()).not.toThrow();
  });
});
