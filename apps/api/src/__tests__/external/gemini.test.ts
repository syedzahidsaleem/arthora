import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gemini from '../../lib/external/gemini';

process.env.GEMINI_API_KEY = 'mock_gemini_api_key_12345';

const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

describe('Google Gemini AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePortfolioSuggestion', () => {
    const validSuggestion = {
      model: 'Arthora AI Quant v1.5',
      allocation: [
        {
          assetType: 'mutual_fund',
          name: 'UTI Nifty 50 Index Fund',
          isin: 'INF789F01XS6',
          schemeCode: 120716,
          ticker: null,
          category: 'large_cap',
          allocationPercent: 60,
          reason: 'Core index holding',
          expectedReturn: 12,
        },
        {
          assetType: 'mutual_fund',
          name: 'Parag Parikh Flexi Cap Fund',
          isin: 'INF879O01027',
          schemeCode: 122639,
          ticker: null,
          category: 'flexi_cap',
          allocationPercent: 40,
          reason: 'Active multi-cap exposure',
          expectedReturn: 14,
        },
      ],
      projectedValue: 1500000,
      rebalancing: 'quarterly',
      explanation: 'Balanced strategy with 100% allocation across core Indian equity funds.',
      disclaimer: 'Subject to market risks.',
    };

    it('parses valid raw JSON response successfully', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(validSuggestion),
        },
      });

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 50000,
      });

      expect(result.allocation.length).toBe(2);
      expect(result.projectedValue).toBe(1500000);
      expect(result.model).toBe('Arthora AI Quant v1.5');
    });

    it('strips markdown codeblock wrappers and parses JSON', async () => {
      const wrappedText = `\`\`\`json\n${JSON.stringify(validSuggestion)}\n\`\`\``;
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => wrappedText,
        },
      });

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 0,
      });

      expect(result.allocation[0]?.name).toBe('UTI Nifty 50 Index Fund');
    });

    it('throws AppError 422 if allocation percentages do not sum to 100', async () => {
      const invalidSum = {
        ...validSuggestion,
        allocation: [
          {
            ...validSuggestion.allocation[0],
            allocationPercent: 50,
          },
          {
            ...validSuggestion.allocation[1],
            allocationPercent: 30, // sums to 80%
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(invalidSum),
        },
      });

      await expect(
        gemini.generatePortfolioSuggestion({
          riskLevel: 'low',
          timePeriodYears: 3,
          monthlyInvestment: 5000,
          lumpSum: 0,
        }),
      ).rejects.toMatchObject({
        statusCode: 422,
        code: 'AI_VALIDATION_ERROR',
      });
    });

    it('throws AppError 422 if ISIN pattern is invalid', async () => {
      const invalidIsin = {
        ...validSuggestion,
        allocation: [
          {
            ...validSuggestion.allocation[0],
            isin: 'INVALID_ISIN_PATTERN',
            allocationPercent: 60,
          },
          {
            ...validSuggestion.allocation[1],
            allocationPercent: 40,
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(invalidIsin),
        },
      });

      await expect(
        gemini.generatePortfolioSuggestion({
          riskLevel: 'high',
          timePeriodYears: 10,
          monthlyInvestment: 25000,
          lumpSum: 100000,
        }),
      ).rejects.toMatchObject({
        statusCode: 422,
        code: 'AI_VALIDATION_ERROR',
      });
    });
  });

  describe('generateRiskProfile', () => {
    it('returns classified risk level and explanation', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              riskLevel: 'high',
              explanation: 'Investor expresses aggressive growth goals with 15+ years horizon.',
            }),
        },
      });

      const profile = await gemini.generateRiskProfile('I am young and want aggressive capital compounding over 20 years.');
      expect(profile.riskLevel).toBe('high');
      expect(profile.explanation).toBeDefined();
    });
  });
});
