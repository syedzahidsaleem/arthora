import { Schema, model, Document, Model, Types } from 'mongoose';
import type { ISearchHistory } from '@arthora/shared';

export interface ISearchHistoryDocument
  extends Omit<ISearchHistory, '_id' | 'userId'>,
    Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const SearchHistorySchema = new Schema<ISearchHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    query: { type: String, required: true, trim: true },
    assetType: {
      type: String,
      enum: ['mutual_fund', 'stock', 'all'],
      default: 'all',
      required: true,
    },
    resultCount: { type: Number, default: 0 },
    searchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });
// TTL Index: 90 days = 7776000 seconds
SearchHistorySchema.index({ searchedAt: 1 }, { expireAfterSeconds: 7776000 });

export const SearchHistory: Model<ISearchHistoryDocument> =
  model<ISearchHistoryDocument>('SearchHistory', SearchHistorySchema, 'search_history');
export default SearchHistory;
