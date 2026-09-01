import { z } from 'zod';

export const fundFilterSchema = z.object({
  category: z.string().optional(),
  fundHouse: z.string().optional(),
  minAum: z.coerce.number().optional(),
  maxExpenseRatio: z.coerce.number().optional(),
  sortBy: z.enum(['cagr1Y', 'cagr3Y', 'cagr5Y', 'aum', 'expenseRatio', 'schemeName']).default('cagr3Y'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type FundFilterInput = z.infer<typeof fundFilterSchema>;
