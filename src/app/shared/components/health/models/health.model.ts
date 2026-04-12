/** Статус системы из бэкенда (C# HealthStatus) */
export type SystemStatus = 'Healthy' | 'Degraded' | 'Unhealthy';

/** Одиночная проверка из Backend HealthCheckItem */
export interface HealthCheckItem {
  name: string; // Название (sql_server, identity, etc)
  status: SystemStatus; // Состояние
  duration: number; // Время выполнения (ms)
  description?: string; // Детализация ошибки
  tags?: string[]; // Теги для фильтрации
}

/** Полный ответ от HealthCheckController */
export interface HealthCheckResponse {
  status: SystemStatus;
  checks: HealthCheckItem[];
}

/** Состояние здоровья для UI */
export interface HealthStatusUI {
  isOnline: boolean;
  responseTime: number;
  lastCheck: Date;
  error?: string;
  checks: HealthCheckItem[];
  overallStatus: SystemStatus;
}

/** Конфигурация мониторинга */
export interface HealthCheckConfig {
  endpoint: string;
  interval: number;
  timeout: number;
  autoStart: boolean;
}

/** Состояние для индикатора "3 кружка" */
export interface HealthCirclesState {
  api: SystemStatus;
  db: SystemStatus;
  auth: SystemStatus;
  latencyTrend: 'up' | 'down' | 'stable';
}
