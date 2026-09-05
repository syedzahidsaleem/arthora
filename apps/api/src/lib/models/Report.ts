import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IReport } from '@arthora/shared';

export interface IReportDocument extends Omit<IReport, '_id' | 'userId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['fund_analysis', 'stock_analysis', 'portfolio_summary'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    schemeCode: { type: Number },
    symbol: { type: String, uppercase: true, trim: true },
    downloadUrl: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
ReportSchema.index({ userId: 1, createdAt: -1 });
// TTL Index: deletes document once expiresAt date passes
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Report: Model<IReportDocument> =
  (models.Report as Model<IReportDocument>) ||
  model<IReportDocument>('Report', ReportSchema, 'reports');
export default Report;
