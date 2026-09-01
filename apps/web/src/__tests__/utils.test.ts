import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('Web Utilities', () => {
  it('combines class names correctly', () => {
    const result = cn('bg-surface-1', 'text-white', false && 'hidden', 'px-4');
    expect(result).toBe('bg-surface-1 text-white px-4');
  });

  it('merges Tailwind conflicts', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });
});
