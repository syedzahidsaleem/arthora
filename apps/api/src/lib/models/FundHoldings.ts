import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IFundHoldings } from '@arthora/shared';

export interface IFundHoldingsDocument extends Omit<IFundHoldings, '_id'>, Document {
  _id: Types.ObjectId;
}

const HoldingItemSchema = new Schema(
  {
    symbol: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    marketCapType: {
      type: String,
      enum: ['large', 'mid', 'small'],
    },
    percentage: { type: Number, required: true },
    value: { type: Number },
    shares: { type: Number },
  },
  { _id: false },
);

const FundHoldingsSchema = new Schema<IFundHoldingsDocument>(
  {
    schemeCode: { type: Number, required: true },
    reportDate: { type: Date, required: true },
    holdings: { type: [HoldingItemSchema], default: [] },
    totalAUM: { type: Number },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
FundHoldingsSchema.index({ schemeCode: 1, reportDate: -1 });
FundHoldingsSchema.index({ 'holdings.sector': 1 });

export const FundHoldings: Model<IFundHoldingsDocument> =
  model<IFundHoldingsDocument>('FundHoldings', FundHoldingsSchema, 'fund_holdings');
export default FundHoldings;
