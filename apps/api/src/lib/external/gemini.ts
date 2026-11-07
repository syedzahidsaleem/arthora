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
import { buildFallbackSuggestion } from '../services/fallbackPortfolioEngine';

const TIMEOUT_MS = 30000;

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY environment variable is not defined', 500, 'CONFIG_ERROR');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Returns the candidate model chain starting with the configured primary model,
 * followed by configured or default fallback models.
 */
export function getCandidateModels(): string[] {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbackEnv = process.env.GEMINI_FALLBACK_MODELS;
  const fallbacks = fallbackEnv
    ? fallbackEnv.split(',').map((m) => m.trim()).filter(Boolean)
    : ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];

  return Array.from(new Set([primaryModel, ...fallbacks].filter(Boolean)));
}

/**
 * Strips code fences and cleans potential markdown formatting around JSON.
 */
export function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  // If there is surrounding text outside the JSON object, extract the root JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

/**
 * Invokes Gemini model with a hard timeout of 30 seconds, automatically cascading
 * through available fallback models if the primary model is unavailable or capacity constrained.
 */
export async function generateWithTimeout(
  prompt: string,
  systemInstruction?: string,
): Promise<{ text: string; modelName: string }> {
  const ai = getGeminiClient();
  const candidateModels = getCandidateModels();

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new AppError(
                `Gemini generation timed out after 30s on model "${modelName}"`,
                504,
                'GATEWAY_TIMEOUT',
              ),
            ),
          TIMEOUT_MS,
        ),
      );

      const apiPromise = (async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      })();

      const text = await Promise.race([apiPromise, timeoutPromise]);
      return { text, modelName };
    } catch (error) {
      const isTimeout =
        (error instanceof AppError && error.code === 'GATEWAY_TIMEOUT') ||
        (error instanceof Error && error.message.includes('timed out'));
      const status = isTimeout ? 504 : ((error as { status?: number })?.status || 500);
      const msg = error instanceof Error ? error.message : String(error);
      const stage: 'api' | 'timeout' = isTimeout ? 'timeout' : 'api';
      lastError = error instanceof Error ? error : new Error(msg);

      console.warn('⚠️ [Gemini] Model attempt failed:', {
        model: modelName,
        status,
        error: msg,
        stage,
      });
    }
  }

  const finalMsg = lastError?.message || 'Unknown AI error';
  throw new AppError(
    `Gemini generation failure across all candidate models: ${finalMsg}`,
    502,
    'AI_SERVICE_ERROR',
  );
}

/**
 * Generates an AI-optimized investment portfolio cascading through available Gemini models.
 * If all candidate models fail, timeout, or fail validation, logs structured warnings and
 * returns the deterministic rules engine fallback.
 */
export async function generatePortfolioSuggestion(
  input: PortfolioPromptInput,
): Promise<PortfolioSuggestion> {
  const prompt = buildPortfolioPrompt(input);
  const candidateModels = getCandidateModels();
  const systemInstruction =
    'You are an expert Indian financial advisor. Output only valid JSON strictly matching the provided schema with no surrounding text or markdown blocks.';

  let ai: GoogleGenerativeAI;
  try {
    ai = getGeminiClient();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('⚠️ [Gemini] Configuration error:', {
      model: 'none',
      status: 500,
      error: errorMsg,
      stage: 'api',
    });
    return buildFallbackSuggestion(input);
  }

  for (const modelName of candidateModels) {
    let rawText = '';
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new AppError(
                `Gemini generation timed out after 30s on model "${modelName}"`,
                504,
                'GATEWAY_TIMEOUT',
              ),
            ),
          TIMEOUT_MS,
        ),
      );

      const apiPromise = (async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      })();

      rawText = await Promise.race([apiPromise, timeoutPromise]);
    } catch (err: unknown) {
      const isTimeout =
        (err instanceof AppError && err.code === 'GATEWAY_TIMEOUT') ||
        (err instanceof Error && err.message.includes('timed out'));
      const status = isTimeout ? 504 : ((err as { status?: number })?.status || 500);
      const errorMsg = err instanceof Error ? err.message : String(err);
      const stage: 'api' | 'timeout' = isTimeout ? 'timeout' : 'api';

      console.warn('⚠️ [Gemini] Model attempt failed:', {
        model: modelName,
        status,
        error: errorMsg,
        stage,
      });
      continue;
    }

    const cleaned = cleanJsonText(rawText);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (parseErr) {
      const errorMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.warn('⚠️ [Gemini] Model output JSON parse failed:', {
        model: modelName,
        status: 422,
        error: errorMsg,
        stage: 'validation',
      });
      continue;
    }

    const validation = PortfolioSuggestionSchema.safeParse(parsedJson);
    if (!validation.success) {
      const errorMsg = validation.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      console.warn('⚠️ [Gemini] Portfolio validation failed:', {
        model: modelName,
        status: 422,
        error: errorMsg,
        stage: 'validation',
      });
      continue;
    }

    // Success! Stamp the actual model name that generated this portfolio
    return {
      ...validation.data,
      model: modelName,
      aiModel: modelName,
    };
  }

  // All candidate models failed, timed out, or produced invalid output
  console.warn('⚠️ [Gemini] All candidate models exhausted. Using deterministic fallback engine.', {
    model: 'all',
    status: 502,
    error: 'All candidate models failed or rejected',
    stage: 'api',
  });
  return buildFallbackSuggestion(input);
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
    const { text } = await generateWithTimeout(
      prompt,
      'You are a certified Indian financial analyst. Provide a short, balanced paragraph explaining fund suitability.',
    );
    return text;
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
    const { text } = await generateWithTimeout(
      prompt,
      'You are an investment psychologist. Categorize the risk appetite strictly into "low", "medium", or "high" in JSON format.',
    );

    const cleaned = cleanJsonText(text);
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
  if (
    lower.includes('aggressive') ||
    lower.includes('small cap') ||
    lower.includes('high risk') ||
    lower.includes('crypto') ||
    lower.includes('stocks')
  ) {
    return {
      riskLevel: 'high',
      explanation:
        'Classified as aggressive risk based on preference for high-growth equities and capital appreciation.',
    };
  }
  if (
    lower.includes('safe') ||
    lower.includes('conservative') ||
    lower.includes('debt') ||
    lower.includes('fd') ||
    lower.includes('preservation')
  ) {
    return {
      riskLevel: 'low',
      explanation:
        'Classified as conservative risk based on emphasis on capital protection and fixed income.',
    };
  }

  return {
    riskLevel: 'medium',
    explanation:
      'Classified as moderate risk with balanced allocation across Indian equity and hybrid assets.',
  };
}
