import { z } from 'zod';

export const favoriteAssetTypeSchema = z.enum(['mutual_fund', 'stock']);

export const addFavoriteSchema = z.object({
  assetType: favoriteAssetTypeSchema,
  schemeCode: z.number().int().positive().optional(),
  symbol: z.string().min(1).optional(),
  isin: z.string().optional(),
  name: z.string().min(1, 'Asset name is required'),
}).refine(
  (data) => {
    if (data.assetType === 'mutual_fund') {
      return typeof data.schemeCode === 'number';
    }
    if (data.assetType === 'stock') {
      return typeof data.symbol === 'string' && data.symbol.length > 0;
    }
    return false;
  },
  {
    message: 'schemeCode is required for mutual_fund, and symbol is required for stock',
    path: ['assetType'],
  },
);

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
