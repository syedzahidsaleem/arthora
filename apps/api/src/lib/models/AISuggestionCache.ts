import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IAISuggestionCache } from '@arthora/shared';

export interface IAISuggestionCacheDocument extends Omit<IAISuggestionCache, '_id'>, Document {
  _id: Types.ObjectId;
}

const AISuggestionCacheSchema = new Schema<IAISuggestionCacheDocument>(
  {
    inputHash: { type: String, required: true },
    goalText: { type: String, required: true },
    riskLevel: { type: String, required: true },
    timePeriod: { type: Number, required: true },
    aiModel: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
AISuggestionCacheSchema.index({ inputHash: 1 }, { unique: true });
// TTL Index: 7 days = 604800 seconds
AISuggestionCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const AISuggestionCache: Model<IAISuggestionCacheDocument> =
  (models.AISuggestionCache as Model<IAISuggestionCacheDocument>) ||
  model<IAISuggestionCacheDocument>(
    'AISuggestionCache',
    AISuggestionCacheSchema,
    'ai_suggestion_cache',
  );
export default AISuggestionCache;
