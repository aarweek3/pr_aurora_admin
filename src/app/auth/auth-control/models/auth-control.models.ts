// src/app/auth/auth-control/models/auth-control.models.ts

export type AuthControlTab = 'Session' | 'Tokens' | 'Roles' | 'Simulator' | 'Playground';

export interface SessionInfo {
  startTime: Date;
  duration: number; // seconds
  lastActivity: Date;
  isActive: boolean;
}

export interface SessionEvent {
  timestamp: Date;
  type: 'login' | 'logout' | 'token_refresh' | 'profile_update' | 'error';
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export interface TokenInfo {
  valid: boolean;
  expiresAt: Date | null;
  timeUntilExpiry: number; // milliseconds
  lastChecked: Date;
  claims?: Record<string, any>;
}

export interface RoleAccessInfo {
  route: string;
  hasAccess: boolean;
  requiredRoles: string[];
  userRoles: string[];
}

export interface ExportData {
  exportDate: string;
  exportType: 'session' | 'tokens' | 'roles' | 'playground';
  data: any;
}
