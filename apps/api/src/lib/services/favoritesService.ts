import { Favorite } from '../models/Favorite';
import { FundNAVHistory } from '../models/FundNAVHistory';
import { StockPriceHistory } from '../models/StockPriceHistory';
import { AppError } from '../errors/AppError';
import * as redisService from '../db/redis';
import type { IFavorite, AddFavoriteInput } from '@arthora/shared';

export interface EnrichedFavorite extends IFavorite {
  latestPrice?: number;
  latestPriceDate?: Date;
  dayChangePercent?: number;
}

/**
 * Lists all watchlist favorites with batch-enriched real-time market prices without N+1 queries.
 */
export async function listFavorites(userId: string): Promise<EnrichedFavorite[]> {
  const favorites = await Favorite.find({ userId }).sort({ addedAt: -1 }).lean();
  if (!favorites || favorites.length === 0) {
    return [];
  }

  // Extract schemeCodes and symbols for batch resolution
  const fundSchemeCodes = favorites
    .filter((f) => f.assetType === 'mutual_fund' && f.schemeCode)
    .map((f) => f.schemeCode!);

  const stockSymbols = favorites
    .filter((f) => f.assetType === 'stock' && f.symbol)
    .map((f) => f.symbol!);

  // Batch fetch from DB as fallback for missing cache entries
  const [dbFundNavs, dbStockPrices] = await Promise.all([
    fundSchemeCodes.length > 0
      ? FundNAVHistory.aggregate([
          { $match: { schemeCode: { $in: fundSchemeCodes } } },
          { $sort: { date: -1 } },
          {
            $group: {
              _id: '$schemeCode',
              latestNav: { $first: '$nav' },
              latestDate: { $first: '$date' },
            },
          },
        ])
      : [],
    stockSymbols.length > 0
      ? StockPriceHistory.aggregate([
          { $match: { symbol: { $in: stockSymbols } } },
          { $sort: { date: -1 } },
          {
            $group: {
              _id: '$symbol',
              latestClose: { $first: '$close' },
              latestDate: { $first: '$date' },
            },
          },
        ])
      : [],
  ]);

  const fundMap = new Map<number, { nav: number; date: Date }>();
  for (const item of dbFundNavs) {
    fundMap.set(item._id, { nav: item.latestNav, date: new Date(item.latestDate) });
  }

  const stockMap = new Map<string, { close: number; date: Date }>();
  for (const item of dbStockPrices) {
    stockMap.set(item._id, { close: item.latestClose, date: new Date(item.latestDate) });
  }

  // Check Redis cache for live quotes / NAVs in parallel
  const enrichedList = await Promise.all(
    favorites.map(async (fav) => {
      let latestPrice: number | undefined = undefined;
      let latestPriceDate: Date | undefined = undefined;
      let dayChangePercent: number | undefined = undefined;

      if (fav.assetType === 'mutual_fund' && fav.schemeCode) {
        const cached = await redisService.get<{ nav: number; date: string }>(`fund:${fav.schemeCode}:latest`);
        if (cached) {
          latestPrice = cached.nav;
          latestPriceDate = new Date(cached.date);
        } else {
          const dbItem = fundMap.get(fav.schemeCode);
          if (dbItem) {
            latestPrice = dbItem.nav;
            latestPriceDate = dbItem.date;
          }
        }
      } else if (fav.assetType === 'stock' && fav.symbol) {
        const cached = await redisService.get<{ currentPrice: number; dayChangePercent: number }>(
          `stock:${fav.symbol}:quote`,
        );
        if (cached) {
          latestPrice = cached.currentPrice;
          dayChangePercent = cached.dayChangePercent;
        } else {
          const dbItem = stockMap.get(fav.symbol);
          if (dbItem) {
            latestPrice = dbItem.close;
            latestPriceDate = dbItem.date;
          }
        }
      }

      return {
        ...(fav as unknown as IFavorite),
        latestPrice,
        latestPriceDate,
        dayChangePercent,
      };
    }),
  );

  return enrichedList;
}

/**
 * Adds an asset to user's favorites with duplicate verification.
 */
export async function addFavorite(
  userId: string,
  input: AddFavoriteInput,
): Promise<IFavorite> {
  // Check duplicate uniqueness
  const query: Record<string, unknown> = { userId, assetType: input.assetType };
  if (input.assetType === 'mutual_fund') {
    if (!input.schemeCode) {
      throw new AppError('schemeCode is required for mutual fund favorite', 400, 'INVALID_INPUT');
    }
    query.schemeCode = input.schemeCode;
  } else if (input.assetType === 'stock') {
    if (!input.symbol) {
      throw new AppError('symbol is required for stock favorite', 400, 'INVALID_INPUT');
    }
    query.symbol = input.symbol.toUpperCase().trim();
  }

  const existing = await Favorite.findOne(query);
  if (existing) {
    throw new AppError(
      'This asset is already present in your watchlist.',
      409,
      'ALREADY_EXISTS',
    );
  }

  const newFav = await Favorite.create({
    userId,
    assetType: input.assetType,
    schemeCode: input.schemeCode,
    symbol: input.symbol ? input.symbol.toUpperCase().trim() : undefined,
    isin: input.isin,
    name: input.name,
    addedAt: new Date(),
  });

  return newFav.toObject() as unknown as IFavorite;
}

/**
 * Removes an asset from user's favorites by ID.
 */
export async function removeFavorite(
  userId: string,
  favoriteId: string,
): Promise<void> {
  const result = await Favorite.findOneAndDelete({
    _id: favoriteId,
    userId,
  });

  if (!result) {
    throw new AppError('Favorite not found in watchlist', 404, 'NOT_FOUND');
  }
}
