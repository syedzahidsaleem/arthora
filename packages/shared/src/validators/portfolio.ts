import { z } from 'zod';

export const goalCategorySchema = z.enum([
  'retirement',
  'education',
  'home',
  'wealth_building',
  'tax_saving',
  'emergency',
  'vacation',
  'other',
]);

export const riskLevelSchema = z.enum(['low', 'medium', 'high']);

export const assetTypeSchema = z.enum(['mutual_fund', 'stock']);

export const rebalancingSchema = z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly']);

export const aiSuggestionStatusSchema = z.enum(['pending', 'generating', 'completed', 'failed']);

export const assetAllocationSchema = z.object({
  assetType: assetTypeSchema,
  name: z.string().min(1, 'Asset name is required'),
  ticker: z.string().optional(),
  isin: z.string().optional(),
  schemeCode: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  allocationPercent: z.number().min(0).max(100),
  reason: z.string().min(1, 'Reason is required'),
  expectedReturn: z.number(),
});

export const aiSuggestionSchema = z.object({
  model: z.string(),
  allocation: z.array(assetAllocationSchema),
  projectedValue: z.number(),
  rebalancing: rebalancingSchema,
  explanation: z.string(),
  generatedAt: z.union([z.date(), z.string()]),
  aiModel: z.string(),
  disclaimer: z.string(),
  status: aiSuggestionStatusSchema.optional(),
});

export const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100),
  goal: z.string().min(1, 'Goal is required'),
  goalCategory: goalCategorySchema,
  timePeriod: z.number().min(1, 'Time period must be at least 1 year').max(30, 'Time period maximum is 30 years'),
  riskLevel: riskLevelSchema,
  monthlyInvestment: z.number().nonnegative().optional(),
  lumpSum: z.number().nonnegative().optional(),
  currentAge: z.number().int().min(18).max(100).optional(),
  riskDescription: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;

export const updatePortfolioSchema = createPortfolioSchema.partial().extend({
  isPinned: z.boolean().optional(),
});

export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;

export const aiSuggestSchema = z.object({
  goalName: z.string().optional(),
  goal: z.string().optional(),
  timePeriod: z.number().min(1).max(30),
  riskLevel: riskLevelSchema,
  monthlyInvestment: z.number().nonnegative().optional(),
  lumpSum: z.number().nonnegative().optional(),
  preferences: z
    .object({
      excludeSectors: z.array(z.string()).optional(),
      preferredCategories: z.array(z.string()).optional(),
    })
    .optional(),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
