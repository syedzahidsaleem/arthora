import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  defaultTab: z.enum(['ai', 'research']).optional(),
  currency: z.string().min(1).max(10).optional(),
  language: z.string().min(2).max(10).optional(),
  exchange: z.enum(['NSE', 'BSE']).optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const updateMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  preferences: updatePreferencesSchema.optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export const updateUserProfileSchema = updateMeSchema;
export type UpdateUserProfileInput = UpdateMeInput;
