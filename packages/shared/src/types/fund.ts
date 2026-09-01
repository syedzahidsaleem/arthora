export type FundNAVSource = 'amfi' | 'calculated';

export type FundMarketCapType = 'large' | 'mid' | 'small';

export interface IFundMetadata {
  _id: string;
  schemeCode: number;
  isin: string;
  isinReinvest?: string;
  schemeName: string;
  fundHouse: string;
  category: string;
  subCategory?: string;
  schemeType?: string;
  navStartDate?: Date | string;
  navStartValue?: number;
  riskLevel?: string;
  amfiCode?: number;
  isActive: boolean;
  benchmark?: string;
  lastUpdated: Date | string;
}

export interface IFundNAVHistory {
  _id: string;
  schemeCode: number;
  date: Date | string;
  nav: number;
  source: FundNAVSource;
}

export interface IRollingReturnPoint {
  date: Date | string;
  value: number;
}

export interface IFundRatings {
  morningstar?: number;
  valueResearch?: number;
}

export interface IFundMetrics {
  _id: string;
  schemeCode: number;
  expenseRatio?: number;
  expenseRatioDate?: Date | string;
  cagr1Y?: number;
  cagr3Y?: number;
  cagr5Y?: number;
  cagr10Y?: number;
  xirr?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  alpha?: number;
  beta?: number;
  stdDev?: number;
  maxDrawdown?: number;
  aum?: number;
  aumDate?: Date | string;
  fundManagerName?: string;
  fundManagerTenure?: number;
  rollingReturn1Y?: IRollingReturnPoint[];
  rollingReturn3Y?: IRollingReturnPoint[];
  rollingReturn5Y?: IRollingReturnPoint[];
  turnoverRatio?: number;
  minSIP?: number;
  minLumpsum?: number;
  exitLoad?: string;
  ratings?: IFundRatings;
  calculatedAt: Date | string;
}

export interface IFundHoldingItem {
  symbol?: string;
  name: string;
  sector?: string;
  marketCapType?: FundMarketCapType;
  percentage: number;
  value?: number;
  shares?: number;
}

export interface IFundHoldings {
  _id: string;
  schemeCode: number;
  reportDate: Date | string;
  holdings: IFundHoldingItem[];
  totalAUM?: number;
  createdAt: Date | string;
}

export interface ISectorAllocationItem {
  sector: string;
  percentage: number;
}

export interface IFundSectorAlloc {
  _id: string;
  schemeCode: number;
  reportDate: Date | string;
  sectorAllocations: ISectorAllocationItem[];
  createdAt: Date | string;
}
