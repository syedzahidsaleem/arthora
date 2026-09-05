import type {
  ApiResponse,
  PaginatedData,
  IFundMetadata,
  IStockMetadata,
  IPortfolio,
  AiSuggestInput,
} from '@arthora/shared';

export * from '@arthora/shared';

export interface ArthoraClientConfig {
  apiUrl?: string;
  accessToken?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface FundSearchParams {
  query?: string;
  category?: string;
  fundHouse?: string;
  page?: number;
  limit?: number;
}

export interface StockSearchParams {
  query?: string;
  sector?: string;
  marketCapType?: 'large_cap' | 'mid_cap' | 'small_cap';
  page?: number;
  limit?: number;
}

/**
 * Official client SDK for programmatic access to the Arthora financial engine.
 */
export class ArthoraClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: ArthoraClientConfig = {}) {
    const raw = config.apiUrl || 'https://arthora-api.onrender.com';
    this.baseUrl = raw.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    this.accessToken = config.accessToken;
    this.timeoutMs = config.timeoutMs || 30000;
    this.maxRetries = config.maxRetries || 3;
  }

  private async fetchWithRetry<T>(endpoint: string, options: RequestInit = {}, retries = this.maxRetries): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0) {
        await new Promise((r) => setTimeout(r, 2500));
        return this.fetchWithRetry<T>(endpoint, options, retries - 1);
      }

      const json = (await response.json()) as ApiResponse<T>;
      if (!response.ok || !json.success || json.data === undefined) {
        throw new Error(json.error?.message || `Request failed with HTTP ${response.status}`);
      }

      return json.data;
    } catch (error) {
      if (retries > 0 && (error as { name?: string }).name !== 'AbortError') {
        await new Promise((r) => setTimeout(r, 2000));
        return this.fetchWithRetry<T>(endpoint, options, retries - 1);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Health and service availability probe.
   */
  async health(): Promise<{ status: string; services: Record<string, string>; version: string }> {
    return this.fetchWithRetry('/api/v1/health');
  }

  /**
   * Mutual Fund directory and quantitative analytics.
   */
  readonly funds = {
    search: (params: FundSearchParams = {}): Promise<PaginatedData<IFundMetadata>> => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set('q', params.query);
      if (params.category) searchParams.set('category', params.category);
      if (params.fundHouse) searchParams.set('fundHouse', params.fundHouse);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return this.fetchWithRetry(`/api/v1/funds/search${qs ? `?${qs}` : ''}`);
    },

    getDetail: (schemeCode: number | string): Promise<IFundMetadata> => {
      return this.fetchWithRetry(`/api/v1/funds/${schemeCode}`);
    },

    getMetrics: (schemeCode: number | string): Promise<Record<string, unknown>> => {
      return this.fetchWithRetry(`/api/v1/funds/${schemeCode}/metrics`);
    },

    getCategories: (): Promise<string[]> => {
      return this.fetchWithRetry('/api/v1/funds/categories');
    },
  };

  /**
   * Indian Stock (NSE/BSE) analytics, quotes, and technical indicators.
   */
  readonly stocks = {
    search: (params: StockSearchParams = {}): Promise<PaginatedData<IStockMetadata>> => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set('q', params.query);
      if (params.sector) searchParams.set('sector', params.sector);
      if (params.marketCapType) searchParams.set('marketCapType', params.marketCapType);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return this.fetchWithRetry(`/api/v1/stocks/search${qs ? `?${qs}` : ''}`);
    },

    getQuote: (symbol: string): Promise<Record<string, unknown>> => {
      return this.fetchWithRetry(`/api/v1/stocks/${encodeURIComponent(symbol)}`);
    },

    getTechnicals: (symbol: string): Promise<Record<string, unknown>> => {
      return this.fetchWithRetry(`/api/v1/stocks/${encodeURIComponent(symbol)}/technicals`);
    },
  };

  /**
   * AI Portfolio Builder and goal recommendation engine.
   */
  readonly portfolios = {
    suggest: (input: AiSuggestInput): Promise<Record<string, unknown>> => {
      return this.fetchWithRetry('/api/v1/ai/suggest', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    listUserPortfolios: (): Promise<IPortfolio[]> => {
      return this.fetchWithRetry('/api/v1/portfolios');
    },
  };
}

/**
 * Factory helper for initializing an Arthora client instance.
 */
export function createArthoraClient(config?: ArthoraClientConfig): ArthoraClient {
  return new ArthoraClient(config);
}
