export type StockMarketCapType = 'large' | 'mid' | 'small' | 'micro';

export interface IStockMetadata {
  _id: string;
  symbol: string;
  nseSymbol?: string;
  bseCode?: string;
  companyName: string;
  sector?: string;
  industry?: string;
  marketCapType?: StockMarketCapType;
  isin: string;
  isActive: boolean;
  lastUpdated: Date | string;
}

export interface IStockPriceHistory {
  _id: string;
  symbol: string;
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface IStockMetrics {
  _id: string;
  symbol: string;
  peRatioTTM?: number;
  peRatioForward?: number;
  pbRatio?: number;
  dividendYield?: number;
  marketCap?: number;
  revenueAnnual?: number;
  revenueTTM?: number;
  netProfitAnnual?: number;
  netProfitTTM?: number;
  debtToEquity?: number;
  roe?: number;
  roce?: number;
  roa?: number;
  promoterHolding?: number;
  promoterHoldingChange?: number;
  fiiHolding?: number;
  diiHolding?: number;
  week52High?: number;
  week52Low?: number;
  beta?: number;
  epsTTM?: number;
  epsGrowthYoY?: number;
  calculatedAt: Date | string;
}
