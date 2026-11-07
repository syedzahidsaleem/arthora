import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gemini from '../../lib/external/gemini';

process.env.GEMINI_API_KEY = 'mock_gemini_api_key_12345';
process.env.GEMINI_MODEL = 'gemini-3.6-flash';
process.env.GEMINI_FALLBACK_MODELS = 'gemini-3.7-flash,gemini-flash-latest';

const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn();

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: (args: { model: string; systemInstruction?: string }) => {
        mockGetGenerativeModel(args);
        return {
          generateContent: mockGenerateContent,
        };
      },
    })),
  };
});

describe('Google Gemini AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_MODEL = 'gemini-3.6-flash';
    process.env.GEMINI_FALLBACK_MODELS = 'gemini-3.7-flash,gemini-flash-latest';
  });

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

  describe('generatePortfolioSuggestion', () => {
    it('parses valid raw JSON response successfully and stamps active model', async () => {
      mockGenerateContent.mockResolvedValueOnce({
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
      expect(result.model).toBe('gemini-3.6-flash');
      expect(result.aiModel).toBe('gemini-3.6-flash');
    });

    it('strips markdown codeblock wrappers and parses JSON', async () => {
      const wrappedText = `\`\`\`json\n${JSON.stringify(validSuggestion)}\n\`\`\``;
      mockGenerateContent.mockResolvedValueOnce({
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
      expect(result.aiModel).toBe('gemini-3.6-flash');
    });

    it('fallback chain: first model fails and second succeeds, stamping the second model name', async () => {
      // First model (gemini-3.6-flash) rejects with 404
      mockGenerateContent.mockRejectedValueOnce(new Error('models/gemini-3.6-flash is not found'));

      // Second model (gemini-3.7-flash) succeeds
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(validSuggestion),
        },
      });

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 0,
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(result.model).toBe('gemini-3.7-flash');
      expect(result.aiModel).toBe('gemini-3.7-flash');
    });

    it('all models fail: falls back to deterministic rules engine and stamps its name', async () => {
      // All candidate models fail
      mockGenerateContent.mockRejectedValue(new Error('Google API Error: Service Unavailable'));

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'low',
        timePeriodYears: 2,
        monthlyInvestment: 5000,
        lumpSum: 0,
      });

      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');
      expect(result.aiModel).toBe('Arthora Deterministic Rules Engine v1.0');
      expect(result.allocation.length).toBeGreaterThan(0);
      warnSpy.mockRestore();
    });

    it('response fails validation: logs stage=validation and falls back to deterministic engine', async () => {
      const invalidAllocationSum = {
        ...validSuggestion,
        allocation: [
          {
            ...validSuggestion.allocation[0],
            allocationPercent: 50,
          },
          {
            ...validSuggestion.allocation[1],
            allocationPercent: 30, // 80% total -> fails validation
          },
        ],
      };

      // Model returns invalid allocation sum
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(invalidAllocationSum),
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'high',
        timePeriodYears: 10,
        monthlyInvestment: 25000,
        lumpSum: 100000,
      });

      // Verify validation failure warning was logged with stage: 'validation'
      const validationCalls = warnSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'object' && arg !== null && (arg as { stage?: string }).stage === 'validation'),
      );
      expect(validationCalls.length).toBeGreaterThan(0);

      // Verify deterministic fallback is returned
      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');
      expect(result.aiModel).toBe('Arthora Deterministic Rules Engine v1.0');
      warnSpy.mockRestore();
    });
  });

  describe('generateRiskProfile', () => {
    it('returns classified risk level and explanation', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              riskLevel: 'high',
              explanation: 'Investor expresses aggressive growth goals with 15+ years horizon.',
            }),
        },
      });

      const profile = await gemini.generateRiskProfile(
        'I am young and want aggressive capital compounding over 20 years.',
      );
      expect(profile.riskLevel).toBe('high');
      expect(profile.explanation).toBeDefined();
    });
  });

  describe('getCandidateModels', () => {
    it('returns primary model followed by configured fallbacks', () => {
      process.env.GEMINI_MODEL = 'gemini-custom-primary';
      process.env.GEMINI_FALLBACK_MODELS = 'gemini-fb-1,gemini-fb-2';

      const models = gemini.getCandidateModels();
      expect(models).toEqual(['gemini-custom-primary', 'gemini-fb-1', 'gemini-fb-2']);
    });
  });
});
