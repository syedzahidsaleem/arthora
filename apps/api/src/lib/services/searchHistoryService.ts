import { SearchHistory } from '../models/SearchHistory';

/**
 * Asynchronously records a user's search query in SearchHistory without blocking response execution.
 */
export function recordSearchHistoryAsync(
  userId?: string,
  query?: string,
  assetType: 'mutual_fund' | 'stock' | 'all' = 'all',
  resultCount = 0,
): void {
  if (!userId || !query || query.trim().length === 0) {
    return;
  }

  // Fire-and-forget execution
  void SearchHistory.create({
    userId,
    query: query.trim(),
    assetType,
    resultCount,
    searchedAt: new Date(),
  }).catch((err) => {
    // Silently log without disrupting user
    console.error('Failed to log search history:', err);
  });
}
