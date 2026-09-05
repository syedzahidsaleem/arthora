import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IStockMetrics } from '@arthora/shared';

export interface IStockMetricsDocument extends Omit<IStockMetrics, '_id'>, Document {
  _id: Types.ObjectId;
  sector?: string;
}

const StockMetricsSchema = new Schema<IStockMetricsDocument>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    sector: { type: String, trim: true },
    peRatioTTM: { type: Number },
    peRatioForward: { type: Number },
    pbRatio: { type: Number },
    dividendYield: { type: Number },
    marketCap: { type: Number },
    revenueAnnual: { type: Number },
    revenueTTM: { type: Number },
    netProfitAnnual: { type: Number },
    netProfitTTM: { type: Number },
    debtToEquity: { type: Number },
    roe: { type: Number },
    roce: { type: Number },
    roa: { type: Number },
    promoterHolding: { type: Number },
    promoterHoldingChange: { type: Number },
    fiiHolding: { type: Number },
    diiHolding: { type: Number },
    week52High: { type: Number },
    week52Low: { type: Number },
    beta: { type: Number },
    epsTTM: { type: Number },
    epsGrowthYoY: { type: Number },
    calculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
StockMetricsSchema.index({ symbol: 1 }, { unique: true });
StockMetricsSchema.index({ sector: 1, marketCap: -1 });

export const StockMetrics: Model<IStockMetricsDocument> =
  (models.StockMetrics as Model<IStockMetricsDocument>) ||
  model<IStockMetricsDocument>('StockMetrics', StockMetricsSchema, 'stock_metrics');
export default StockMetrics;
