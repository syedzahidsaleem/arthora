import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IStockMetadata } from '@arthora/shared';

export interface IStockMetadataDocument extends Omit<IStockMetadata, '_id'>, Document {
  _id: Types.ObjectId;
}

const StockMetadataSchema = new Schema<IStockMetadataDocument>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    nseSymbol: { type: String, uppercase: true, trim: true },
    bseCode: { type: String, trim: true },
    companyName: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    industry: { type: String, trim: true },
    marketCapType: {
      type: String,
      enum: ['large', 'mid', 'small', 'micro'],
    },
    isin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
StockMetadataSchema.index({ symbol: 1 }, { unique: true });
StockMetadataSchema.index({ isin: 1 }, { unique: true });
StockMetadataSchema.index({ sector: 1 });
StockMetadataSchema.index({ companyName: 'text' });

export const StockMetadata: Model<IStockMetadataDocument> =
  (models.StockMetadata as Model<IStockMetadataDocument>) ||
  model<IStockMetadataDocument>('StockMetadata', StockMetadataSchema, 'stocks_metadata');
export default StockMetadata;
