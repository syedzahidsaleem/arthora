import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IFundNAVHistory } from '@arthora/shared';

export interface IFundNAVHistoryDocument extends Omit<IFundNAVHistory, '_id'>, Document {
  _id: Types.ObjectId;
}

const FundNAVHistorySchema = new Schema<IFundNAVHistoryDocument>(
  {
    schemeCode: { type: Number, required: true },
    date: { type: Date, required: true },
    nav: { type: Number, required: true },
    source: {
      type: String,
      enum: ['amfi', 'calculated'],
      default: 'amfi',
      required: true,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound Unique & Date Indexes
FundNAVHistorySchema.index({ schemeCode: 1, date: -1 }, { unique: true });
FundNAVHistorySchema.index({ date: -1 });

export const FundNAVHistory: Model<IFundNAVHistoryDocument> =
  (models.FundNAVHistory as Model<IFundNAVHistoryDocument>) ||
  model<IFundNAVHistoryDocument>('FundNAVHistory', FundNAVHistorySchema, 'fund_nav_history');
export default FundNAVHistory;
