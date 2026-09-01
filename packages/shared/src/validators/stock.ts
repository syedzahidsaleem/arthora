import { z } from 'zod';

export const stockFilterSchema = z.object({
  sector: z.string().optional(),
  marketCapType: z.enum(['large', 'mid', 'small', 'micro']).optional(),
  sortBy: z.enum(['marketCap', 'peRatioTTM', 'roe', 'roce', 'dividendYield', 'symbol']).default('marketCap'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type StockFilterInput = z.infer<typeof stockFilterSchema>;
