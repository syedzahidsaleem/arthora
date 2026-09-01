import type { RiskLevel } from './portfolio';

export interface IAISuggestionCache {
  _id: string;
  inputHash: string;
  goalText: string;
  riskLevel: RiskLevel | string;
  timePeriod: number;
  aiModel: string;
  response: Record<string, unknown>;
  createdAt: Date | string;
}

export interface IGoalInput {
  goal: string;
  timePeriod: number;
  riskLevel: RiskLevel;
  monthlyInvestment?: number;
  lumpSum?: number;
  currentAge?: number;
  riskDescription?: string;
}
