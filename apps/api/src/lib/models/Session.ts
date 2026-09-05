import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { ISession } from '@arthora/shared';

export interface ISessionDocument extends Omit<ISession, '_id' | 'userId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    sessionId: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fcmToken: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
SessionSchema.index({ sessionId: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
// TTL Index: deletes session on expiresAt
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISessionDocument> =
  (models.Session as Model<ISessionDocument>) ||
  model<ISessionDocument>('Session', SessionSchema, 'sessions');
export default Session;
