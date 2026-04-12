export const HEALTH_ENDPOINTS = {
  BASE: '/api/health-enhanced',
  DETAILED: '/api/health-enhanced/detailed',
  LOGS: '/api/health-enhanced/logs',
  METRICS: '/api/health-enhanced/metrics',
  STATISTICS: '/api/health-enhanced/statistics',
  CLEANUP: '/api/health-enhanced/cleanup',
} as const;

export const HEALTH_INTERVALS = {
  HEALTH_CHECK: 30000, // 30 секунд
  LOG_REFRESH: 60000, // 1 минута
  METRICS_REFRESH: 15000, // 15 секунд
  STATISTICS_REFRESH: 300000, // 5 минут
  CLEANUP_CHECK: 3600000, // 1 час
} as const;

export const HEALTH_STATUS = {
  HEALTHY: 'Healthy',
  DEGRADED: 'Degraded',
  UNHEALTHY: 'Unhealthy',
  UNKNOWN: 'Unknown',
} as const;

export const HEALTH_STATUS_COLORS = {
  [HEALTH_STATUS.HEALTHY]: '#4caf50',
  [HEALTH_STATUS.DEGRADED]: '#ffc107',
  [HEALTH_STATUS.UNHEALTHY]: '#dc3545',
  [HEALTH_STATUS.UNKNOWN]: '#6c757d',
} as const;

export const HEALTH_STATUS_ICONS = {
  [HEALTH_STATUS.HEALTHY]: '✓',
  [HEALTH_STATUS.DEGRADED]: '⚠',
  [HEALTH_STATUS.UNHEALTHY]: '✗',
  [HEALTH_STATUS.UNKNOWN]: '?',
} as const;
