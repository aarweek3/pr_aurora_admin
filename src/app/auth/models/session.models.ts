// src/app/models/session.models.ts

export interface UserSessionDto {
  id: number;
  refreshToken: string;
  expiresAt: string;
  isRevoked: boolean;
  revokedAt?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UpdateSessionDto {
  refreshToken?: string;
  expiresAt?: string;
  isRevoked?: boolean;
  revokedAt?: string;
  deviceInfo?: string;
}
