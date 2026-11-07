import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gemini from '../../lib/external/gemini';
import { FundMetadata } from '../../lib/models/FundMetadata';
import * as mfapi from '../../lib/external/mfapi';
import * as yfinance from '../../lib/external/yfinance';

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

vi.mock('../../lib/models/FundMetadata', () => ({
  FundMetadata: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../lib/models/StockMetadata', () => ({
  StockMetadata: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../lib/external/mfapi', () => ({
  fetchSchemeDetail: vi.fn(),
}));

vi.mock('../../lib/external/yfinance', () => ({
  fetchStockQuote: vi.fn(),
}));

describe('Google Gemini AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_TOTAL_TIMEOUT_MS;
    process.env.GEMINI_MODEL = 'gemini-3.6-flash';
    process.env.GEMINI_FALLBACK_MODELS = 'gemini-3.7-flash,gemini-flash-latest';

    // Default FundMetadata mock for valid suggestion
    vi.mocked(FundMetadata.findOne).mockImplementation(({ schemeCode }: { schemeCode?: number } = {}) => {
      if (schemeCode === 120716) {
        return {
          lean: vi.fn().mockResolvedValue({
            schemeCode: 120716,
            isin: 'INF789F01XS6',
            schemeName: 'UTI Nifty 50 Index Fund',
          }),
        } as never;
      }
      if (schemeCode === 122639) {
        return {
          lean: vi.fn().mockResolvedValue({
            schemeCode: 122639,
            isin: 'INF879O01027',
            schemeName: 'Parag Parikh Flexi Cap Fund',
          }),
        } as never;
      }
      return { lean: vi.fn().mockResolvedValue(null) } as never;
    });

    vi.mocked(mfapi.fetchSchemeDetail).mockRejectedValue(new Error('Not found'));
    vi.mocked(yfinance.fetchStockQuote).mockRejectedValue(new Error('Not found'));
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
      const wrappedText = "```json\n" + JSON.stringify(validSuggestion) + "\n```";
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
      mockGenerateContent.mockRejectedValueOnce(new Error('models/gemini-3.6-flash is not found'));

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

      const validationCalls = warnSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'object' && arg !== null && (arg as { stage?: string }).stage === 'validation'),
      );
      expect(validationCalls.length).toBeGreaterThan(0);

      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');
      expect(result.aiModel).toBe('Arthora Deterministic Rules Engine v1.0');
      warnSpy.mockRestore();
    });

    it('total time budget exhausted: stops trying models, logs stage=timeout with elapsedMs, and returns fallback', async () => {
      process.env.GEMINI_TOTAL_TIMEOUT_MS = '60';

      // Mock slow model that exceeds the 60ms total chain budget
      mockGenerateContent.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ response: { text: () => JSON.stringify(validSuggestion) } }), 90)),
      );

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 0,
      });

      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');

      const timeoutCalls = warnSpy.mock.calls.filter((call) =>
        call.some(
          (arg) =>
            typeof arg === 'object' &&
            arg !== null &&
            (arg as { stage?: string }).stage === 'timeout' &&
            typeof (arg as { elapsedMs?: number }).elapsedMs === 'number',
        ),
      );
      expect(timeoutCalls.length).toBeGreaterThan(0);
      warnSpy.mockRestore();
    });

    it('hallucinated mutual fund schemeCode logs stage=validation with offending code and falls back', async () => {
      const hallucinatedSuggestion = {
        ...validSuggestion,
        allocation: [
          {
            ...validSuggestion.allocation[0],
            schemeCode: 999999, // Hallucinated code
          },
          validSuggestion.allocation[1],
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(hallucinatedSuggestion),
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 0,
      });

      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');

      const validationCalls = warnSpy.mock.calls.filter((call) =>
        call.some(
          (arg) =>
            typeof arg === 'object' &&
            arg !== null &&
            (arg as { stage?: string }).stage === 'validation' &&
            (arg as { offendingCode?: number }).offendingCode === 999999,
        ),
      );
      expect(validationCalls.length).toBeGreaterThan(0);
      warnSpy.mockRestore();
    });

    it('conflicting ISIN logs stage=validation with offending code and falls back', async () => {
      const conflictingSuggestion = {
        ...validSuggestion,
        allocation: [
          {
            ...validSuggestion.allocation[0],
            isin: 'INF999K01999', // Conflicting ISIN
          },
          validSuggestion.allocation[1],
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(conflictingSuggestion),
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await gemini.generatePortfolioSuggestion({
        riskLevel: 'medium',
        timePeriodYears: 5,
        monthlyInvestment: 10000,
        lumpSum: 0,
      });

      expect(result.model).toBe('Arthora Deterministic Rules Engine v1.0');

      const validationCalls = warnSpy.mock.calls.filter((call) =>
        call.some(
          (arg) =>
            typeof arg === 'object' &&
            arg !== null &&
            (arg as { stage?: string }).stage === 'validation' &&
            (arg as { offendingCode?: number }).offendingCode === 120716,
        ),
      );
      expect(validationCalls.length).toBeGreaterThan(0);
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

  describe('getTotalTimeoutMs', () => {
    it('returns default 45000ms when not set', () => {
      delete process.env.GEMINI_TOTAL_TIMEOUT_MS;
      expect(gemini.getTotalTimeoutMs()).toBe(45000);
    });

    it('returns configured timeout from environment variable', () => {
      process.env.GEMINI_TOTAL_TIMEOUT_MS = '60000';
      expect(gemini.getTotalTimeoutMs()).toBe(60000);
    });
  });
});
