import { Schema, model, Document, Model, Types } from 'mongoose';
import type { IFundSectorAlloc } from '@arthora/shared';

export interface IFundSectorAllocDocument extends Omit<IFundSectorAlloc, '_id'>, Document {
  _id: Types.ObjectId;
}

const SectorAllocationItemSchema = new Schema(
  {
    sector: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true },
  },
  { _id: false },
);

const FundSectorAllocSchema = new Schema<IFundSectorAllocDocument>(
  {
    schemeCode: { type: Number, required: true },
    reportDate: { type: Date, required: true },
    sectorAllocations: { type: [SectorAllocationItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
FundSectorAllocSchema.index({ schemeCode: 1, reportDate: -1 });

export const FundSectorAlloc: Model<IFundSectorAllocDocument> =
  model<IFundSectorAllocDocument>('FundSectorAlloc', FundSectorAllocSchema, 'fund_sector_alloc');
export default FundSectorAlloc;
