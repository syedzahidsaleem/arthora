export interface ISession {
  _id: string;
  sessionId: string;
  userId: string;
  fcmToken?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date | string;
  expiresAt: Date | string;
}
