import { z } from 'zod';

export const searchAssetTypeSchema = z.enum(['mutual_fund', 'stock', 'all']);

export const searchRequestSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  type: searchAssetTypeSchema.default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
