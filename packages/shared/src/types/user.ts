export type AuthProvider = 'email' | 'google';

export type UserTheme = 'dark' | 'light';

export type UserDefaultTab = 'ai' | 'research';

export type ExchangeType = 'NSE' | 'BSE';

export type FCMPlatform = 'ios' | 'android' | 'web';

export interface FCMToken {
  token: string;
  platform: FCMPlatform;
  createdAt: Date | string;
}

export interface UserPreferences {
  theme: UserTheme;
  defaultTab: UserDefaultTab;
  currency: string;
  language: string;
  exchange: ExchangeType;
}

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  firebaseUid: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
  preferences: UserPreferences;
  fcmTokens: FCMToken[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string;
  isActive: boolean;
}
