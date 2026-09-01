import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IFavorite } from '@arthora/shared';

export interface IFavoriteDocument extends Omit<IFavorite, '_id' | 'userId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetType: {
      type: String,
      enum: ['mutual_fund', 'stock'],
      required: true,
    },
    schemeCode: { type: Number },
    symbol: { type: String, uppercase: true, trim: true },
    isin: { type: String, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
FavoriteSchema.index({ userId: 1 });
FavoriteSchema.index({ userId: 1, assetType: 1 });
FavoriteSchema.index({ userId: 1, schemeCode: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ userId: 1, symbol: 1 }, { unique: true, sparse: true });

export const Favorite: Model<IFavoriteDocument> =
  model<IFavoriteDocument>('Favorite', FavoriteSchema, 'favorites');
export default Favorite;
