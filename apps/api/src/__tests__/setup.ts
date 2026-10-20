import { vi } from 'vitest';

// Globally mock argon2 to prevent native C++ addon crashes (SIGSEGV / exit code 139) on Linux CI
vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('$argon2id$v=19$m=65536,t=3,p=4$dummyhash_for_tests'),
  verify: vi.fn().mockResolvedValue(true),
  argon2id: 2,
  argon2i: 1,
  argon2d: 0,
  needsRehash: vi.fn().mockReturnValue(false),
}));

// Globally mock bullmq to avoid ECONNREFUSED background connection attempts during tests
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  Job: vi.fn(),
}));

