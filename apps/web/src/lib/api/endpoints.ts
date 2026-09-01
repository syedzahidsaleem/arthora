/**
 * Standardized API endpoint routes and URL builders for Arthora.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    GOOGLE: '/api/v1/auth/google',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    FCM_TOKEN: '/api/v1/auth/fcm-token',
  },
  FUNDS: {
    SEARCH: '/api/v1/funds/search',
    CATEGORIES: '/api/v1/funds/categories',
    DETAIL: (code: number | string) => `/api/v1/funds/${code}`,
    METRICS: (code: number | string) => `/api/v1/funds/${code}/metrics`,
    NAV_HISTORY: (code: number | string) => `/api/v1/funds/${code}/nav-history`,
    HOLDINGS: (code: number | string) => `/api/v1/funds/${code}/holdings`,
    SECTOR_ALLOC: (code: number | string) => `/api/v1/funds/${code}/sector-allocation`,
    PEERS: (code: number | string) => `/api/v1/funds/${code}/peers`,
  },
  STOCKS: {
    SEARCH: '/api/v1/stocks/search',
    SECTORS: '/api/v1/stocks/sectors',
    DETAIL: (symbol: string) => `/api/v1/stocks/${symbol}`,
    METRICS: (symbol: string) => `/api/v1/stocks/${symbol}/metrics`,
    HISTORY: (symbol: string) => `/api/v1/stocks/${symbol}/history`,
    TECHNICAL: (symbol: string) => `/api/v1/stocks/${symbol}/technical`,
    PEERS: (symbol: string) => `/api/v1/stocks/${symbol}/peers`,
  },
  PORTFOLIOS: {
    LIST: '/api/v1/portfolios',
    CREATE: '/api/v1/portfolios',
    DETAIL: (id: string) => `/api/v1/portfolios/${id}`,
    STATUS: (id: string) => `/api/v1/portfolios/${id}/status`,
    PIN: (id: string) => `/api/v1/portfolios/${id}/pin`,
    DELETE: (id: string) => `/api/v1/portfolios/${id}`,
  },
  AI: {
    SUGGEST: '/api/v1/ai/suggest',
    EXPLAIN: '/api/v1/ai/explain',
  },
  FAVORITES: {
    LIST: '/api/v1/favorites',
    ADD: '/api/v1/favorites',
    REMOVE: (id: string) => `/api/v1/favorites/${id}`,
  },
  SEARCH: {
    QUERY: '/api/v1/search',
    HISTORY: '/api/v1/search/history',
    CLEAR_HISTORY: '/api/v1/search/history',
  },
  CHARTS: {
    FUND_NAV: (code: number | string) => `/api/v1/charts/fund-nav/${code}`,
    STOCK_PRICE: (symbol: string) => `/api/v1/charts/stock-price/${symbol}`,
    FUND_DRAWDOWN: (code: number | string) => `/api/v1/charts/fund-drawdown/${code}`,
  },
  REPORTS: {
    LIST: '/api/v1/reports',
    FUND_ANALYSIS: '/api/v1/reports/fund-analysis',
    STOCK_ANALYSIS: '/api/v1/reports/stock-analysis',
    PORTFOLIO_SUMMARY: '/api/v1/reports/portfolio-summary',
    DETAIL: (id: string) => `/api/v1/reports/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/reports/${id}/download`,
  },
  ONBOARD: {
    RISK_PROFILE: '/api/v1/onboard/risk-profile',
  },
} as const;
