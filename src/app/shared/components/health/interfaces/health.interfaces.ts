export interface HealthStatus {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  timestamp: string;
  duration: number;
  details: Record<string, any>;
}

export interface TokenValidation {
  isAccessTokenValid: boolean;
  isRefreshTokenValid: boolean;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  userId: string;
  tokenIssuer?: string;
  roles: string[];
}

export interface ServerMetrics {
  cpuUsagePercentage: number;
  memoryUsageBytes: number;
  availableMemoryBytes: number;
  activeConnections: number;
  uptimeMs: number;
  customMetrics: Record<string, any>;
}

export interface DetailedHealthResponse {
  health: HealthStatus;
  tokens: TokenValidation;
  serverMetrics: ServerMetrics;
  timestamp: string;
  environment: string;
  version: string;
}

export interface HealthLogEntry {
  timestamp: string;
  endpoint: string;
  status: string;
  durationMs: number;
  clientIp?: string;
  userId?: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  tokenFingerprint?: string;
  additionalData: Record<string, any>;
}

export interface HealthStatistics {
  total: number;
  healthy: number;
  unhealthy: number;
  degraded: number;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
}

export interface ServerStatusInfo {
  isOnline: boolean;
  lastCheck: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  responseTime: number;
  tokensValid: boolean;
  environment?: string;
  version?: string;
}

export interface HealthAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
