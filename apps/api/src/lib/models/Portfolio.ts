import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IPortfolio } from '@arthora/shared';

export interface IPortfolioDocument extends Omit<IPortfolio, '_id' | 'userId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const AssetAllocationSchema = new Schema(
  {
    assetType: {
      type: String,
      enum: ['mutual_fund', 'stock'],
      required: true,
    },
    name: { type: String, required: true },
    ticker: { type: String },
    isin: { type: String },
    schemeCode: { type: Number },
    category: { type: String, required: true },
    allocationPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reason: { type: String, required: true },
    expectedReturn: { type: Number, required: true },
  },
  { _id: false },
);

const AISuggestionSchema = new Schema(
  {
    model: { type: String, required: true },
    allocation: { type: [AssetAllocationSchema], required: true, default: [] },
    projectedValue: { type: Number, required: true },
    rebalancing: {
      type: String,
      enum: ['monthly', 'quarterly', 'half-yearly', 'yearly'],
      required: true,
      default: 'yearly',
    },
    explanation: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    aiModel: { type: String, required: true },
    disclaimer: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { _id: false },
);

const PortfolioSchema = new Schema<IPortfolioDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    goal: { type: String, required: true, trim: true },
    goalCategory: {
      type: String,
      enum: [
        'retirement',
        'education',
        'home',
        'wealth_building',
        'tax_saving',
        'emergency',
        'vacation',
        'other',
      ],
      required: true,
    },
    timePeriod: { type: Number, required: true, min: 1, max: 30 },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    monthlyInvestment: { type: Number, min: 0 },
    lumpSum: { type: Number, min: 0 },
    currentAge: { type: Number, min: 18, max: 120 },
    riskDescription: { type: String },
    aiSuggestion: { type: AISuggestionSchema },
    history: { type: [AISuggestionSchema], default: [] },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ userId: 1, createdAt: -1 });

export const Portfolio: Model<IPortfolioDocument> =
  model<IPortfolioDocument>('Portfolio', PortfolioSchema, 'portfolios');
export default Portfolio;
