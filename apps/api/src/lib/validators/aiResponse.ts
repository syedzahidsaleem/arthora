import { z } from 'zod';

export const AllocationItemSchema = z.object({
  assetType: z.enum(['mutual_fund', 'stock']),
  name: z.string().min(1),
  isin: z
    .string()
    .regex(/^IN[A-Z0-9]{10}$/, 'Invalid Indian ISIN format')
    .nullable(),
  schemeCode: z.number().nullable(),
  ticker: z.string().nullable(),
  category: z.string(),
  allocationPercent: z.number().min(0).max(100),
  reason: z.string(),
  expectedReturn: z.number(),
});

export type AllocationItem = z.infer<typeof AllocationItemSchema>;

export const PortfolioSuggestionSchema = z
  .object({
    model: z.string(),
    allocation: z.array(AllocationItemSchema).min(1).max(6),
    projectedValue: z.number().positive(),
    rebalancing: z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly']),
    explanation: z.string(),
    disclaimer: z.string(),
  })
  .refine(
    (data) =>
      Math.abs(data.allocation.reduce((sum, item) => sum + item.allocationPercent, 0) - 100) <= 0.5,
    { message: 'Allocation percentages must sum to 100 ± 0.5' },
  );

export type PortfolioSuggestion = z.infer<typeof PortfolioSuggestionSchema>;
