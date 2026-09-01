import { describe, it, expect } from 'vitest';
import { AppError } from '../lib/errors/AppError';
import { CACHE_KEYS } from '../lib/constants/cacheKeys';
import * as models from '../lib/models';

describe('AppError', () => {
  it('creates operational error with status code and error code', () => {
    const error = new AppError('Resource not found', 404, 'NOT_FOUND', { id: '123' });
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual({ id: '123' });
  });
});

describe('Cache Keys Generator', () => {
  it('formats cache keys correctly', () => {
    expect(CACHE_KEYS.FUND_DETAIL(120503)).toBe('fund:detail:120503');
    expect(CACHE_KEYS.STOCK_DETAIL('reliance')).toBe('stock:detail:RELIANCE');
    expect(CACHE_KEYS.SESSION('sess-abc')).toBe('session:sess-abc');
  });
});

describe('Mongoose Models Registration', () => {
  it('exports all 15 Mongoose models', () => {
    const expectedModels = [
      'User',
      'Portfolio',
      'FundMetadata',
      'FundNAVHistory',
      'FundMetrics',
      'FundHoldings',
      'FundSectorAlloc',
      'StockMetadata',
      'StockPriceHistory',
      'StockMetrics',
      'Favorite',
      'SearchHistory',
      'AISuggestionCache',
      'Report',
      'Session',
    ];

    for (const modelName of expectedModels) {
      expect((models as Record<string, unknown>)[modelName]).toBeDefined();
    }
    expect(Object.keys(models).length).toBeGreaterThanOrEqual(15);
  });
});
