// src/app/models/admin.models.ts

import { BulkOperationType } from './common.models';

export interface SimpleAdminCreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
}

export interface SimpleAdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  isActive?: boolean;
}

export interface AdminChangePasswordDto {
  newPassword: string;
}

export interface BulkOperationDto {
  userIds: string[];
  operationType: BulkOperationType;
  newRole?: string;
  reason?: string;
}

export interface SimpleStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalSessions: number;
  activeSessions: number;
  todayRegistrations: number;
  todayLogins: number;
}
