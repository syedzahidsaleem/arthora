import { describe, it, expect } from 'vitest';
import {
  selectTemplate,
  buildFallbackSuggestion,
  TEMPLATES,
} from '../../lib/services/fallbackPortfolioEngine';

describe('Fallback Portfolio Engine', () => {
  describe('selectTemplate', () => {
    it('selects LOW_RISK_SHORT_TERM template for horizon < 3 years or low risk', () => {
      expect(selectTemplate('low', 5)).toBe(TEMPLATES.LOW_RISK_SHORT_TERM);
      expect(selectTemplate('medium', 2)).toBe(TEMPLATES.LOW_RISK_SHORT_TERM);
      expect(selectTemplate('high', 1)).toBe(TEMPLATES.LOW_RISK_SHORT_TERM);
    });

    it('selects HIGH_RISK_LONG_TERM template for high risk and horizon >= 7 years', () => {
      expect(selectTemplate('high', 10)).toBe(TEMPLATES.HIGH_RISK_LONG_TERM);
      expect(selectTemplate('high', 7)).toBe(TEMPLATES.HIGH_RISK_LONG_TERM);
    });

    it('selects MEDIUM_RISK_LONG_TERM template for medium risk and standard horizons', () => {
      expect(selectTemplate('medium', 5)).toBe(TEMPLATES.MEDIUM_RISK_LONG_TERM);
    });
  });

  describe('buildFallbackSuggestion', () => {
    it('constructs a valid suggestion with exact 100% allocation sum and positive projected value', () => {
      const input = {
        riskLevel: 'medium' as const,
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 50000,
        goalName: 'Retirement Fund',
      };

      const suggestion = buildFallbackSuggestion(input);
      expect(suggestion.allocation.length).toBeGreaterThan(0);

      const totalAlloc = suggestion.allocation.reduce((s, i) => s + i.allocationPercent, 0);
      expect(totalAlloc).toBe(100);
      expect(suggestion.projectedValue).toBeGreaterThan(input.monthlyInvestment * 60 + input.lumpSum);
      expect(suggestion.disclaimer).toBeDefined();
    });
  });
});
