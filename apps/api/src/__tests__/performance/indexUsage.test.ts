import { describe, it, expect } from 'vitest';
import { FundMetadata } from '../../lib/models/FundMetadata';
import { FundNAVHistory } from '../../lib/models/FundNAVHistory';
import { Portfolio } from '../../lib/models/Portfolio';
import { Favorite } from '../../lib/models/Favorite';
import { SearchHistory } from '../../lib/models/SearchHistory';

describe('MongoDB Schema Index Verification', () => {
  it('FundMetadata defines indexes for schemeCode and category searches', () => {
    const indexes = FundMetadata.schema.indexes();
    const indexFields = indexes.map(([spec]) => Object.keys(spec));

    // Must have schemeCode unique index and category index
    const hasSchemeCodeIndex = indexFields.some((f) => f.includes('schemeCode'));
    const hasCategoryIndex = indexFields.some((f) => f.includes('category'));

    expect(hasSchemeCodeIndex).toBe(true);
    expect(hasCategoryIndex).toBe(true);
  });

  it('FundNAVHistory defines compound index on schemeCode and date', () => {
    const indexes = FundNAVHistory.schema.indexes();
    const hasCompoundNavIndex = indexes.some(([spec]) => {
      return spec.schemeCode !== undefined && spec.date !== undefined;
    });

    expect(hasCompoundNavIndex).toBe(true);
  });

  it('Portfolio defines compound index on userId and createdAt', () => {
    const indexes = Portfolio.schema.indexes();
    const hasUserCreatedIndex = indexes.some(([spec]) => {
      return spec.userId !== undefined && spec.createdAt !== undefined;
    });

    expect(hasUserCreatedIndex).toBe(true);
  });

  it('Favorite defines compound index on userId and assetType', () => {
    const indexes = Favorite.schema.indexes();
    const hasUserAssetIndex = indexes.some(([spec]) => {
      return spec.userId !== undefined && spec.assetType !== undefined;
    });

    expect(hasUserAssetIndex).toBe(true);
  });

  it('SearchHistory defines compound index on userId and searchedAt', () => {
    const indexes = SearchHistory.schema.indexes();
    const hasUserSearchIndex = indexes.some(([spec]) => {
      return spec.userId !== undefined && spec.searchedAt !== undefined;
    });

    expect(hasUserSearchIndex).toBe(true);
  });
});
