// src/app/shared/auth/models/auth.dto.ts

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserProfileDto {
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  isExternalAccount: boolean;
  externalProvider?: string;
  externalUserId?: string;
  externalId?: string; // Alias for template compatibility
  lastLogin?: string | null;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  department?: string;
  avatar?: string;
}

export interface UserListItemDto {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  isActive: boolean;
  createdAt: string | Date;
  lastLogin?: string | Date;
  isExternalAccount: boolean;
  externalProvider?: string;
  roles?: string[];
}

export interface UserDetailDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isExternalAccount: boolean;
  externalProvider?: string;
  roles?: string[];
}

export interface UserStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  externalAccounts: number;
  usersWithTwoFactor: number;
  usersByDepartment: Record<string, number>;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
  isActive: boolean;
}

export interface UserFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  isActive?: boolean;
  department?: string;
  isExternalAccount?: boolean;
  externalProvider?: string;
}

export interface UserSearchResultDto {
  id: string;
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
}

export type UserModalMode = 'create' | 'edit' | 'view';

export interface UserModalData {
  mode: UserModalMode;
  user?: UserDetailDto;
}

export interface LogoutDto {
  refreshToken?: string;
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
  requiresTwoFactor?: boolean;
}

export interface TokenDto {
  accessToken: string;
  expiresAt: string;
}

export interface ExternalLoginDto {
  provider: string;
  token: string;
}

export interface TwoFactorDto {
  enable: boolean;
  verificationCode?: string;
}
