// src/app/models/activity.models.ts

import { ActivityAction, DeviceType } from './common.models';

export interface ActivityLogDto {
  id: number;
  userId: string;
  userFullName: string;
  action: ActivityAction;
  entityType?: string;
  entityId?: string;
  details?: string;
  success: boolean;
  timestamp: string;
  deviceType: DeviceType;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLogFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  userId?: string;
  action?: ActivityAction;
  success?: boolean;
  deviceType?: DeviceType;
  entityType?: string;
}
