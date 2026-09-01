export type FavoriteAssetType = 'mutual_fund' | 'stock';

export interface IFavorite {
  _id: string;
  userId: string;
  assetType: FavoriteAssetType;
  schemeCode?: number;
  symbol?: string;
  isin?: string;
  name: string;
  addedAt: Date | string;
}
