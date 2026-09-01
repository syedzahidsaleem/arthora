/**
 * Redis Cache key prefixes and formatting helper constants.
 */
export const CACHE_KEYS = {
  FUND_DETAIL: (schemeCode: number | string) => `fund:detail:${schemeCode}`,
  FUND_METRICS: (schemeCode: number | string) => `fund:metrics:${schemeCode}`,
  FUND_NAV: (schemeCode: number | string) => `fund:nav:${schemeCode}`,
  FUND_SEARCH: (query: string) => `fund:search:${query.toLowerCase().trim()}`,
  STOCK_DETAIL: (symbol: string) => `stock:detail:${symbol.toUpperCase().trim()}`,
  STOCK_METRICS: (symbol: string) => `stock:metrics:${symbol.toUpperCase().trim()}`,
  STOCK_PRICE: (symbol: string) => `stock:price:${symbol.toUpperCase().trim()}`,
  STOCK_SEARCH: (query: string) => `stock:search:${query.toLowerCase().trim()}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  RATE_LIMIT: (ipOrUserId: string, route: string) => `ratelimit:${route}:${ipOrUserId}`,
  AI_SUGGESTION: (hash: string) => `ai:suggestion:${hash}`,
} as const;

/**
 * Standard TTL values in seconds.
 */
export const CACHE_TTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  THIRTY_DAYS: 2592000,
} as const;
