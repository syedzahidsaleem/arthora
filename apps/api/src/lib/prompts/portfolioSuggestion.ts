export interface PortfolioPromptInput {
  riskLevel: 'low' | 'medium' | 'high';
  timePeriodYears: number;
  monthlyInvestment: number;
  lumpSum: number;
  targetCorpus?: number;
  goalName?: string;
  preferences?: {
    excludeSectors?: string[];
    preferredCategories?: string[];
  };
}

/**
 * Builds the structured system & user prompt for Gemini 1.5 Flash portfolio suggestions.
 */
export function buildPortfolioPrompt(input: PortfolioPromptInput): string {
  return `You are Arthora's SEBI-aware Quant Portfolio Engine. Construct an optimized investment portfolio tailored for an Indian retail investor.

Investor Profile:
- Goal: ${input.goalName || 'Wealth Creation'}
- Risk Appetite: ${input.riskLevel.toUpperCase()}
- Horizon: ${input.timePeriodYears} Years
- Monthly SIP: ₹${input.monthlyInvestment.toLocaleString('en-IN')}
- Lump Sum: ₹${input.lumpSum.toLocaleString('en-IN')}
${input.targetCorpus ? `- Target Corpus: ₹${input.targetCorpus.toLocaleString('en-IN')}` : ''}

Strict Constraints:
1. Include between 2 to 6 assets (mix of AMFI mutual funds and top NSE stocks).
2. For Mutual Funds:
   - Must use real AMFI-registered funds with a valid 12-character Indian ISIN matching regex /^IN[A-Z0-9]{10}$/ (e.g., INF789F01XS6, INF879O01027, INF179K01AB9).
   - Set schemeCode to numeric code if known, ticker to null.
3. For Stocks:
   - Must use prominent NSE ticker symbols (e.g. RELIANCE, TCS, HDFCBANK, INFOSYS, ICICIBANK).
   - Set schemeCode to null, isin to null, and ticker to the NSE symbol string.
4. Asset Allocation Rules:
   - If time horizon is < 3 years: NO pure equity funds or small caps allowed. Only Liquid, Ultra Short Duration, or Low Duration Debt funds.
   - If Low Risk: Minimum 70% in Debt / Arbitrage / Balanced Advantage funds.
   - If Medium Risk: Blend of Large Cap / Index / Flexi Cap and Hybrid funds.
   - If High Risk: Can allocate up to 60% across Mid Cap, Small Cap, and Global / Tech FoFs.
5. Exact Sum: The sum of all 'allocationPercent' values across assets MUST EQUAL EXACTLY 100.
6. Projected Value: Calculate realistic expected corpus in INR based on historical CAGR for this asset mix over ${input.timePeriodYears} years.

Response Format:
You MUST respond with RAW JSON ONLY (no markdown formatting, no \`\`\`json code blocks, no trailing comments).
The JSON MUST conform strictly to this structure:
{
  "model": "Arthora AI Quant v1.5",
  "allocation": [
    {
      "assetType": "mutual_fund",
      "name": "Fund Full Name",
      "isin": "INF789F01XS6",
      "schemeCode": 120716,
      "ticker": null,
      "category": "large_cap",
      "allocationPercent": 40,
      "reason": "Clear explanation for retail investor",
      "expectedReturn": 12.5
    }
  ],
  "projectedValue": 1500000,
  "rebalancing": "quarterly",
  "explanation": "Detailed rationale explaining how this portfolio matches the horizon and risk appetite.",
  "disclaimer": "Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. Educational research only."
}`;
}
