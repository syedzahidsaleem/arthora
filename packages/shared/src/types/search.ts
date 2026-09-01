export type SearchAssetType = 'mutual_fund' | 'stock' | 'all';

export interface ISearchHistory {
  _id: string;
  userId: string;
  query: string;
  assetType: SearchAssetType;
  resultCount: number;
  searchedAt: Date | string;
}
