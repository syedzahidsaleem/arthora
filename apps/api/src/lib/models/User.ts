import { Schema, model, models, Document, Model, Types } from 'mongoose';
import type { IUser } from '@arthora/shared';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  passwordHash?: string;
}

const FCMTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserPreferencesSchema = new Schema(
  {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    defaultTab: { type: String, enum: ['ai', 'research'], default: 'ai' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    exchange: { type: String, enum: ['NSE', 'BSE'], default: 'NSE' },
  },
  { _id: false },
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, maxlength: 100, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, select: false },
    firebaseUid: { type: String, required: true },
    avatarUrl: { type: String },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      required: true,
      default: 'email',
    },
    emailVerified: { type: Boolean, default: false },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
    fcmTokens: {
      type: [FCMTokenSchema],
      validate: [
        (val: unknown[]) => val.length <= 5,
        'Cannot store more than 5 FCM tokens per user',
      ],
      default: [],
    },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
UserSchema.index({ firebaseUid: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const User: Model<IUserDocument> =
  (models.User as Model<IUserDocument>) ||
  model<IUserDocument>('User', UserSchema, 'users');
export default User;
