// src/app/models/auth.models.ts

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
  requiresTwoFactor: boolean;
}

export interface TokenDto {
  accessToken: string;
  expiresAt: string;
}

export interface UserProfileDto {
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  roles?: string[];
  isExternalAccount?: boolean;
  externalProvider?: string;
}

export interface ExternalLoginDto {
  provider: string;
  token: string;
}

export interface TwoFactorDto {
  enable: boolean;
  verificationCode?: string;
}
