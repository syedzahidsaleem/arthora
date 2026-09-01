import { describe, it, expect } from 'vitest';
import { formatINR } from '../formatters/inr.js';
import { formatPercent } from '../formatters/percent.js';
import { formatLargeNumberINR } from '../formatters/largeNumber.js';
import { formatDate, isMarketOpen, daysUntil } from '../utils/date.js';

describe('Formatters', () => {
  describe('formatINR', () => {
    it('formats numbers with Indian commas and Rupee symbol', () => {
      expect(formatINR(1234567)).toBe('₹12,34,567');
      expect(formatINR(100)).toBe('₹100');
      expect(formatINR(0)).toBe('₹0');
      expect(formatINR(-50000)).toBe('-₹50,000');
    });

    it('handles decimal precision and symbol suppression', () => {
      expect(formatINR(1234.56, { decimals: 2 })).toBe('₹1,234.56');
      expect(formatINR(1234567, { showSymbol: false })).toBe('12,34,567');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage with default 2 decimal places', () => {
      expect(formatPercent(12.3456)).toBe('12.35%');
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(-5.2)).toBe('-5.20%');
    });

    it('supports sign option and custom decimals', () => {
      expect(formatPercent(12.3456, 1, true)).toBe('+12.3%');
      expect(formatPercent(-8.5, 2, true)).toBe('-8.50%');
    });
  });

  describe('formatLargeNumberINR', () => {
    it('formats values in Crores, Lakhs, and Thousands', () => {
      expect(formatLargeNumberINR(12300000)).toBe('₹1.23 Cr');
      expect(formatLargeNumberINR(4550000)).toBe('₹45.50 L');
      expect(formatLargeNumberINR(50000)).toBe('₹50.00 k');
      expect(formatLargeNumberINR(500)).toBe('₹500');
    });
  });
});

describe('Date Utilities', () => {
  it('formats date as DD MMM YYYY', () => {
    const d = new Date('2026-09-01T00:00:00Z');
    expect(formatDate(d)).toContain('2026');
  });

  it('calculates days until a future date', () => {
    const from = new Date('2026-09-01T00:00:00Z');
    const to = new Date('2026-09-10T00:00:00Z');
    expect(daysUntil(to, from)).toBe(9);
  });

  it('correctly handles isMarketOpen structure', () => {
    // Weekend date
    const sunday = new Date('2026-08-30T10:00:00Z');
    expect(isMarketOpen(sunday)).toBe(false);
  });
});
