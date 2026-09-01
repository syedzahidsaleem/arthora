import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IFundMetrics } from '@arthora/shared';

export interface IFundMetricsDocument extends Omit<IFundMetrics, '_id'>, Document {
  _id: Types.ObjectId;
  category?: string;
}

const RollingReturnPointSchema = new Schema(
  {
    date: { type: Date, required: true },
    value: { type: Number, required: true },
  },
  { _id: false },
);

const FundRatingsSchema = new Schema(
  {
    morningstar: { type: Number, min: 1, max: 5 },
    valueResearch: { type: Number, min: 1, max: 5 },
  },
  { _id: false },
);

const FundMetricsSchema = new Schema<IFundMetricsDocument>(
  {
    schemeCode: { type: Number, required: true },
    category: { type: String, trim: true },
    expenseRatio: { type: Number },
    expenseRatioDate: { type: Date },
    cagr1Y: { type: Number },
    cagr3Y: { type: Number },
    cagr5Y: { type: Number },
    cagr10Y: { type: Number },
    xirr: { type: Number },
    sharpeRatio: { type: Number },
    sortinoRatio: { type: Number },
    alpha: { type: Number },
    beta: { type: Number },
    stdDev: { type: Number },
    maxDrawdown: { type: Number },
    aum: { type: Number },
    aumDate: { type: Date },
    fundManagerName: { type: String, trim: true },
    fundManagerTenure: { type: Number },
    rollingReturn1Y: { type: [RollingReturnPointSchema], default: [] },
    rollingReturn3Y: { type: [RollingReturnPointSchema], default: [] },
    turnoverRatio: { type: Number },
    minSIP: { type: Number },
    minLumpsum: { type: Number },
    exitLoad: { type: String },
    ratings: { type: FundRatingsSchema },
    calculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
FundMetricsSchema.index({ schemeCode: 1 }, { unique: true });
FundMetricsSchema.index({ category: 1, cagr3Y: -1 });
FundMetricsSchema.index({ expenseRatio: 1 });

export const FundMetrics: Model<IFundMetricsDocument> =
  model<IFundMetricsDocument>('FundMetrics', FundMetricsSchema, 'fund_metrics');
export default FundMetrics;
