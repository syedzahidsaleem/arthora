import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const fcmTokenSchema = z.object({
  token: z.string().min(1, 'FCM token is required'),
  platform: z.enum(['ios', 'android', 'web']),
});

export type FCMTokenInput = z.infer<typeof fcmTokenSchema>;
