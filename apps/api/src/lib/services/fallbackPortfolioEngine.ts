import type {
  PortfolioSuggestion,
  AllocationItem,
} from '../validators/aiResponse';
import type { PortfolioPromptInput } from '../prompts/portfolioSuggestion';

export const TEMPLATES = {
  LOW_RISK_SHORT_TERM: [
    {
      assetType: 'mutual_fund' as const,
      name: 'Mirae Asset Cash Management Fund - Direct Plan - Growth',
      isin: 'INF769K01FI3',
      schemeCode: 119598,
      ticker: null,
      category: 'liquid',
      allocationPercent: 60,
      reason: 'High liquidity and principal capital preservation with daily liquidity.',
      expectedReturn: 6.8,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'HDFC Ultra Short Term Fund - Direct Plan - Growth',
      isin: 'INF179KB1BC6',
      schemeCode: 118825,
      ticker: null,
      category: 'ultra_short_duration',
      allocationPercent: 40,
      reason: 'Low interest rate risk with higher accrual yields over short horizons.',
      expectedReturn: 7.2,
    },
  ],
  MEDIUM_RISK_LONG_TERM: [
    {
      assetType: 'mutual_fund' as const,
      name: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
      isin: 'INF789F01XS6',
      schemeCode: 120716,
      ticker: null,
      category: 'large_cap',
      allocationPercent: 40,
      reason: 'Low-cost core allocation capturing long-term Indian GDP and market expansion.',
      expectedReturn: 12.0,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
      isin: 'INF879O01027',
      schemeCode: 122639,
      ticker: null,
      category: 'flexi_cap',
      allocationPercent: 30,
      reason: 'Value-oriented active management with proven multi-cap compounding track record.',
      expectedReturn: 14.5,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'HDFC Balanced Advantage Fund - Direct Plan - Growth',
      isin: 'INF179K01AB9',
      schemeCode: 119202,
      ticker: null,
      category: 'hybrid',
      allocationPercent: 30,
      reason: 'Dynamic equity-debt rebalancing providing volatility smoothing and downside protection.',
      expectedReturn: 11.5,
    },
  ],
  HIGH_RISK_LONG_TERM: [
    {
      assetType: 'mutual_fund' as const,
      name: 'Nippon India Small Cap Fund - Direct Plan - Growth',
      isin: 'INF204K01T05',
      schemeCode: 118778,
      ticker: null,
      category: 'small_cap',
      allocationPercent: 30,
      reason: 'High growth potential by participating in agile, high-alpha emerging small enterprises.',
      expectedReturn: 17.0,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'Quant Mid Cap Fund - Direct Plan - Growth',
      isin: 'INF966L01BS6',
      schemeCode: 120844,
      ticker: null,
      category: 'mid_cap',
      allocationPercent: 30,
      reason: 'Dynamic quantitative momentum strategy focusing on fast growing mid-sized companies.',
      expectedReturn: 16.0,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
      isin: 'INF879O01027',
      schemeCode: 122639,
      ticker: null,
      category: 'flexi_cap',
      allocationPercent: 25,
      reason: 'High-conviction equity core with international diversification.',
      expectedReturn: 14.5,
    },
    {
      assetType: 'mutual_fund' as const,
      name: 'Mirae Asset NYSE FANG+ ETF Fund of Fund - Direct - Growth',
      isin: 'INF769K01GQ6',
      schemeCode: 145552,
      ticker: null,
      category: 'international',
      allocationPercent: 15,
      reason: 'Thematic exposure to global tech innovators for geographical hedging.',
      expectedReturn: 15.0,
    },
  ],
};

/**
 * Selects an expert-curated fallback asset allocation template based on risk and horizon.
 */
export function selectTemplate(
  riskLevel: 'low' | 'medium' | 'high',
  timePeriodYears: number,
): AllocationItem[] {
  if (timePeriodYears < 3 || riskLevel === 'low') {
    return TEMPLATES.LOW_RISK_SHORT_TERM;
  }

  if (riskLevel === 'high' && timePeriodYears >= 7) {
    return TEMPLATES.HIGH_RISK_LONG_TERM;
  }

  return TEMPLATES.MEDIUM_RISK_LONG_TERM;
}

/**
 * Constructs a valid PortfolioSuggestion result using pre-calculated deterministic template data.
 */
export function buildFallbackSuggestion(
  input: PortfolioPromptInput,
  templateAllocation?: AllocationItem[],
): PortfolioSuggestion {
  const allocation = templateAllocation || selectTemplate(input.riskLevel, input.timePeriodYears);

  // Compute weighted average annual expected return
  const weightedReturn = allocation.reduce(
    (sum, item) => sum + (item.allocationPercent / 100) * (item.expectedReturn / 100),
    0,
  );

  const monthlyRate = weightedReturn / 12;
  const totalMonths = input.timePeriodYears * 12;

  // SIP Future Value formula: P * (((1 + r)^n - 1) / r) * (1 + r)
  let sipFutureValue = 0;
  if (input.monthlyInvestment > 0) {
    if (monthlyRate > 0) {
      sipFutureValue =
        input.monthlyInvestment *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
        (1 + monthlyRate);
    } else {
      sipFutureValue = input.monthlyInvestment * totalMonths;
    }
  }

  // Lump Sum Future Value: L * (1 + R)^years
  const lumpSumFutureValue = input.lumpSum * Math.pow(1 + weightedReturn, input.timePeriodYears);
  const projectedValue = Math.round(sipFutureValue + lumpSumFutureValue);

  return {
    model: 'Arthora Deterministic Rules Engine v1.0',
    allocation,
    projectedValue: projectedValue > 0 ? projectedValue : 100000,
    rebalancing: 'quarterly',
    explanation: `This model allocation is constructed by our deterministic rules engine based on your ${input.timePeriodYears}-year horizon and ${input.riskLevel} risk profile. It balances capital growth and risk mitigation using top AMFI category leaders.`,
    disclaimer:
      'Mutual fund investments are subject to market risks. This is a deterministic rule-based template allocation provided for educational research purposes.',
  };
}
