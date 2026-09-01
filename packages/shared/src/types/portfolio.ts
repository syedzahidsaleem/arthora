export type GoalCategory =
  | 'retirement'
  | 'education'
  | 'home'
  | 'wealth_building'
  | 'tax_saving'
  | 'emergency'
  | 'vacation'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AssetType = 'mutual_fund' | 'stock';

export type RebalancingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export type AISuggestionStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface IAssetAllocation {
  assetType: AssetType;
  name: string;
  ticker?: string;
  isin?: string;
  schemeCode?: number;
  category: string;
  allocationPercent: number;
  reason: string;
  expectedReturn: number;
}

export interface IAISuggestion {
  model: string;
  allocation: IAssetAllocation[];
  projectedValue: number;
  rebalancing: RebalancingFrequency;
  explanation: string;
  generatedAt: Date | string;
  aiModel: string;
  disclaimer: string;
  status?: AISuggestionStatus;
}

export interface IPortfolio {
  _id: string;
  userId: string;
  name: string;
  goal: string;
  goalCategory: GoalCategory;
  timePeriod: number;
  riskLevel: RiskLevel;
  monthlyInvestment?: number;
  lumpSum?: number;
  currentAge?: number;
  riskDescription?: string;
  aiSuggestion?: IAISuggestion;
  history: IAISuggestion[];
  isPinned: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
