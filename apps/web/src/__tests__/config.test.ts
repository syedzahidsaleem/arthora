import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl } from '../lib/api/config';

describe('getApiBaseUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it('returns configured NEXT_PUBLIC_API_URL without trailing slashes', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.arthora.in/api/v1/';
    expect(getApiBaseUrl()).toBe('https://api.arthora.in');
  });

  it('defaults to localhost:4000 in server-side test environment when no env is set', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:4000');
  });
});
