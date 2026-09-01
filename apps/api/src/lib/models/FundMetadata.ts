import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IFundMetadata } from '@arthora/shared';

export interface IFundMetadataDocument extends Omit<IFundMetadata, '_id'>, Document {
  _id: Types.ObjectId;
}

const FundMetadataSchema = new Schema<IFundMetadataDocument>(
  {
    schemeCode: { type: Number, required: true },
    isin: { type: String, required: true, uppercase: true, trim: true },
    isinReinvest: { type: String, uppercase: true, trim: true },
    schemeName: { type: String, required: true, trim: true },
    fundHouse: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    schemeType: { type: String, trim: true },
    navStartDate: { type: Date },
    navStartValue: { type: Number },
    riskLevel: { type: String, trim: true },
    amfiCode: { type: Number },
    isActive: { type: Boolean, default: true },
    benchmark: { type: String, trim: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
FundMetadataSchema.index({ schemeCode: 1 }, { unique: true });
FundMetadataSchema.index({ isin: 1 }, { unique: true });
FundMetadataSchema.index({ fundHouse: 1 });
FundMetadataSchema.index({ category: 1 });
FundMetadataSchema.index({ schemeName: 'text' });

export const FundMetadata: Model<IFundMetadataDocument> =
  model<IFundMetadataDocument>('FundMetadata', FundMetadataSchema, 'funds_metadata');
export default FundMetadata;
