import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../errors/AppError';
import {
  PortfolioSuggestionSchema,
  type PortfolioSuggestion,
} from '../validators/aiResponse';
import {
  buildPortfolioPrompt,
  type PortfolioPromptInput,
} from '../prompts/portfolioSuggestion';

const TIMEOUT_MS = 30000;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY environment variable is not defined', 500, 'CONFIG_ERROR');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Strips code fences and cleans potential markdown formatting around JSON.
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  return text.trim();
}

/**
 * Invokes Gemini model with a hard timeout of 30 seconds, automatically cascading
 * through available fallback models if the primary model is unavailable or capacity constrained.
 */
async function generateWithTimeout(
  prompt: string,
  systemInstruction?: string,
): Promise<string> {
  const ai = getGeminiClient();
  const configuredModel = process.env.GEMINI_MODEL;

  // Cascade through configured model and known reliable production models
  const candidateModels = Array.from(
    new Set(
      [
        configuredModel,
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
      ].filter(Boolean) as string[],
    ),
  );

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new AppError('Gemini AI generation timed out after 30s', 504, 'GATEWAY_TIMEOUT')),
          TIMEOUT_MS,
        ),
      );

      const apiPromise = (async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      })();

      return await Promise.race([apiPromise, timeoutPromise]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      lastError = error instanceof Error ? error : new Error(msg);

      if (error instanceof AppError && error.code === 'GATEWAY_TIMEOUT') {
        throw error;
      }

      console.warn(`⚠️ [Gemini] Model "${modelName}" failed: ${msg}. Attempting fallback model...`);
    }
  }

  const finalMsg = lastError?.message || 'Unknown AI error';
  throw new AppError(`Gemini generation failure across all candidate models: ${finalMsg}`, 502, 'AI_SERVICE_ERROR');
}

/**
 * Generates an AI-optimized investment portfolio using Gemini 1.5 Flash.
 */
export async function generatePortfolioSuggestion(
  input: PortfolioPromptInput,
): Promise<PortfolioSuggestion> {
  const prompt = buildPortfolioPrompt(input);
  const rawText = await generateWithTimeout(
    prompt,
    'You are an expert Indian financial advisor. Output only valid JSON strictly matching the provided schema with no surrounding text or markdown blocks.',
  );

  const cleaned = cleanJsonText(rawText);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    throw new AppError('Gemini model response could not be parsed as JSON', 422, 'AI_VALIDATION_ERROR');
  }

  const validation = PortfolioSuggestionSchema.safeParse(parsedJson);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new AppError(
      `AI portfolio validation failed: ${errorMsg}`,
      422,
      'AI_VALIDATION_ERROR',
      validation.error.errors as unknown as Record<string, unknown>,
    );
  }

  return validation.data;
}

/**
 * Generates an executive 2-3 sentence summary evaluating fund metrics for Indian retail investors.
 */
export async function generateFundExplanation(
  fundName: string,
  metrics: Record<string, unknown>,
): Promise<string> {
  const prompt = `Provide a concise 2-3 sentence analysis of why the mutual fund "${fundName}" is or is not suitable for an Indian retail investor based on these quantitative metrics:
${JSON.stringify(metrics, null, 2)}

Highlight risk-adjusted performance (Sharpe/Alpha), downside protection (Sortino/Max Drawdown), and expense ratio impact. Keep it clear, objective, and easy to read.`;

  try {
    return await generateWithTimeout(
      prompt,
      'You are a certified Indian financial analyst. Provide a short, balanced paragraph explaining fund suitability.',
    );
  } catch (err) {
    console.warn('⚠️ [Gemini] Fund explanation failed, using deterministic summary:', err);
    const sharpe = typeof metrics.sharpeRatio === 'number' ? metrics.sharpeRatio : undefined;
    const alpha = typeof metrics.alpha === 'number' ? metrics.alpha : undefined;
    const cagr3Y = typeof metrics.cagr3Y === 'number' ? metrics.cagr3Y : undefined;

    if (sharpe !== undefined && sharpe > 1.2) {
      return `${fundName} demonstrates strong risk-adjusted returns with a Sharpe ratio of ${sharpe.toFixed(2)}${alpha !== undefined ? ` and an alpha of ${alpha.toFixed(2)}% over benchmark` : ''}. It is well-suited for long-term investors seeking disciplined wealth creation.`;
    }
    return `${fundName} provides core exposure to Indian financial markets${cagr3Y !== undefined ? ` with a 3-year CAGR of ${cagr3Y.toFixed(1)}%` : ''}. Retail investors should review their asset allocation and investment horizon before investing.`;
  }
}

/**
 * Classifies an investor's risk profile from their subjective self-description.
 */
export async function generateRiskProfile(
  description: string,
): Promise<{ riskLevel: 'low' | 'medium' | 'high'; explanation: string }> {
  const prompt = `Analyze the following investor statement and classify their risk tolerance as either "low", "medium", or "high":
"${description}"

Respond in JSON format:
{
  "riskLevel": "low" | "medium" | "high",
  "explanation": "2 sentence explanation of why this classification fits their stated goals and risk temperament"
}`;

  try {
    const rawText = await generateWithTimeout(
      prompt,
      'You are an investment psychologist. Categorize the risk appetite strictly into "low", "medium", or "high" in JSON format.',
    );

    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned) as { riskLevel: 'low' | 'medium' | 'high'; explanation: string };
    if (['low', 'medium', 'high'].includes(parsed.riskLevel)) {
      return {
        riskLevel: parsed.riskLevel,
        explanation: parsed.explanation || 'Classified based on investment horizon and risk preferences.',
      };
    }
  } catch (err) {
    console.warn('⚠️ [Gemini] Risk profile generation failed, using rule-based classification:', err);
  }

  const lower = description.toLowerCase();
  if (lower.includes('aggressive') || lower.includes('small cap') || lower.includes('high risk') || lower.includes('crypto') || lower.includes('stocks')) {
    return {
      riskLevel: 'high',
      explanation: 'Classified as aggressive risk based on preference for high-growth equities and capital appreciation.',
    };
  }
  if (lower.includes('safe') || lower.includes('conservative') || lower.includes('debt') || lower.includes('fd') || lower.includes('preservation')) {
    return {
      riskLevel: 'low',
      explanation: 'Classified as conservative risk based on emphasis on capital protection and fixed income.',
    };
  }

  return {
    riskLevel: 'medium',
    explanation: 'Classified as moderate risk with balanced allocation across Indian equity and hybrid assets.',
  };
}
