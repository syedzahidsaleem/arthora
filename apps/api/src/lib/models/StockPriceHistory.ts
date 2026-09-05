import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IStockPriceHistory } from '@arthora/shared';

export interface IStockPriceHistoryDocument extends Omit<IStockPriceHistory, '_id'>, Document {
  _id: Types.ObjectId;
}

const StockPriceHistorySchema = new Schema<IStockPriceHistoryDocument>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    date: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
    adjustedClose: { type: Number },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound Unique Index
StockPriceHistorySchema.index({ symbol: 1, date: -1 }, { unique: true });

export const StockPriceHistory: Model<IStockPriceHistoryDocument> =
  (models.StockPriceHistory as Model<IStockPriceHistoryDocument>) ||
  model<IStockPriceHistoryDocument>(
    'StockPriceHistory',
    StockPriceHistorySchema,
    'stock_price_history',
  );
export default StockPriceHistory;
