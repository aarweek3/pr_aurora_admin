import { HEALTH_STATUS_COLORS, HEALTH_STATUS_ICONS } from '../constants/health.constants';

export class HealthStatusModel {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  timestamp: Date;
  duration: number;
  details: Map<string, any>;

  constructor(data: any) {
    this.status = data.status || 'Unhealthy';
    this.timestamp = new Date(data.timestamp);
    this.duration = data.duration || 0;
    this.details = new Map(Object.entries(data.details || {}));
  }

  isHealthy(): boolean {
    return this.status === 'Healthy';
  }

  getStatusColor(): string {
    return (
      HEALTH_STATUS_COLORS[this.status as keyof typeof HEALTH_STATUS_COLORS] ||
      HEALTH_STATUS_COLORS.Unknown
    );
  }

  getStatusIcon(): string {
    return (
      HEALTH_STATUS_ICONS[this.status as keyof typeof HEALTH_STATUS_ICONS] ||
      HEALTH_STATUS_ICONS.Unknown
    );
  }
}

export class ServerMetricsModel {
  cpuUsagePercentage: number;
  memoryUsageBytes: number;
  availableMemoryBytes: number;
  activeConnections: number;
  uptimeMs: number;
  customMetrics: Map<string, any>;

  constructor(data: any) {
    this.cpuUsagePercentage = data.cpuUsagePercentage || 0;
    this.memoryUsageBytes = data.memoryUsageBytes || 0;
    this.availableMemoryBytes = data.availableMemoryBytes || 0;
    this.activeConnections = data.activeConnections || 0;
    this.uptimeMs = data.uptimeMs || 0;
    this.customMetrics = new Map(Object.entries(data.customMetrics || {}));
  }

  getMemoryUsagePercentage(): number {
    const total = this.memoryUsageBytes + this.availableMemoryBytes;
    return total > 0 ? Math.round((this.memoryUsageBytes / total) * 100) : 0;
  }

  getUptimeFormatted(): string {
    const seconds = Math.floor(this.uptimeMs / 1000);
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
