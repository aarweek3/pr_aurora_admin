import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, interval, of, switchMap, tap } from 'rxjs';
import { HEALTH_ENDPOINTS, HEALTH_INTERVALS } from '../constants/health.constants';
import {
  DetailedHealthResponse,
  HealthAlert,
  HealthLogEntry,
  HealthStatistics,
  ServerMetrics,
  ServerStatusInfo,
} from '../interfaces/health.interfaces';
import { ServerMetricsModel } from '../models/health.models';

@Injectable({
  providedIn: 'root',
})
export class HealthCheckService {
  private http = inject(HttpClient);

  // Signals для реактивного UI
  private serverStatus = signal<ServerStatusInfo>({
    isOnline: false,
    lastCheck: new Date().toISOString(),
    status: 'Unhealthy',
    responseTime: 0,
    tokensValid: false,
  });

  private healthLogs = signal<HealthLogEntry[]>([]);
  private serverMetrics = signal<ServerMetricsModel | null>(null);
  private healthStatistics = signal<HealthStatistics | null>(null);
  private alerts = signal<HealthAlert[]>([]);
  private isLoading = signal<boolean>(false);

  // Computed values
  readonly status = computed(() => this.serverStatus());
  readonly isServerHealthy = computed(() => this.serverStatus().status === 'Healthy');
  readonly logs = computed(() => this.healthLogs());
  readonly metrics = computed(() => this.serverMetrics());
  readonly statistics = computed(() => this.healthStatistics());
  readonly currentAlerts = computed(() => this.alerts());
  readonly loading = computed(() => this.isLoading());

  private monitoringActive = false;
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor() {
    // Автостарт мониторинга при создании сервиса
    this.startMonitoring();
  }

  startMonitoring(): void {
    if (this.monitoringActive) return;
    this.monitoringActive = true;

    // Основной health check цикл
    interval(HEALTH_INTERVALS.HEALTH_CHECK)
      .pipe(
        switchMap(() => this.performHealthCheck()),
        takeUntilDestroyed(),
      )
      .subscribe();

    // Цикл обновления метрик
    interval(HEALTH_INTERVALS.METRICS_REFRESH)
      .pipe(
        switchMap(() => this.refreshMetrics()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  stopMonitoring(): void {
    this.monitoringActive = false;
  }

  /**
   * Выполняет полную проверку здоровья системы
   */
  private performHealthCheck(): Observable<DetailedHealthResponse | null> {
    const startTime = performance.now();
    const headers = this.getAuthHeaders();

    return this.http.get<DetailedHealthResponse>(HEALTH_ENDPOINTS.DETAILED, { headers }).pipe(
      tap((response) => {
        const responseTime = Math.round(performance.now() - startTime);
        this.processHealthCheckResponse(response, responseTime);
      }),
      catchError((error) => {
        const responseTime = Math.round(performance.now() - startTime);

        // Проверка: если получили HTML вместо JSON (обычно при 404 на dev-сервере)
        if (error.message?.includes('Unexpected token') || error.status === 404) {
          console.warn('[HealthCheckService] Backend not found, using MOCK data');
          this.processHealthCheckResponse(this.getMockData(), responseTime);
          return of(null);
        }

        this.handleHealthCheckError(error, responseTime);
        return of(null);
      }),
    );
  }

  private processHealthCheckResponse(response: DetailedHealthResponse, responseTime: number): void {
    this.retryCount = 0;

    const newStatus: ServerStatusInfo = {
      isOnline: true,
      lastCheck: new Date().toISOString(),
      status: response.health.status,
      responseTime: responseTime,
      tokensValid: response.tokens.isAccessTokenValid,
      environment: response.environment,
      version: response.version,
    };

    this.serverStatus.set(newStatus);

    if (response.serverMetrics) {
      this.serverMetrics.set(new ServerMetricsModel(response.serverMetrics));
    }

    this.checkForAlerts(response);
  }

  private handleHealthCheckError(error: any, responseTime: number): void {
    this.retryCount++;

    const newStatus: ServerStatusInfo = {
      isOnline: false,
      lastCheck: new Date().toISOString(),
      status: 'Unhealthy',
      responseTime: responseTime,
      tokensValid: false,
    };

    this.serverStatus.set(newStatus);

    if (this.retryCount >= this.maxRetries) {
      this.addAlert({
        id: `offline-${Date.now()}`,
        type: 'error',
        message: 'Сервер недоступен после нескольких попыток',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'critical',
      });
    }
  }

  async forceRefresh(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.performHealthCheck().toPromise(),
        this.refreshMetrics().toPromise(),
        this.getHealthLogs(100),
      ]);
    } catch (error) {
      console.error('Failed to force refresh:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private refreshMetrics(): Observable<ServerMetrics | null> {
    return this.http.get<ServerMetrics>(HEALTH_ENDPOINTS.METRICS).pipe(
      tap((metrics) => {
        if (metrics) {
          this.serverMetrics.set(new ServerMetricsModel(metrics));
        }
      }),
      catchError(() => of(null)),
    );
  }

  async getHealthLogs(count: number = 50, from?: Date, to?: Date): Promise<void> {
    try {
      let params = new HttpParams().set('count', count.toString());
      if (from) params = params.set('from', from.toISOString());
      if (to) params = params.set('to', to.toISOString());

      const logs = await this.http
        .get<HealthLogEntry[]>(HEALTH_ENDPOINTS.LOGS, { params })
        .toPromise();
      if (logs) {
        this.healthLogs.set(logs);
      }
    } catch (error: any) {
      console.error('Failed to fetch health logs:', error);
      // Если бэкенд недоступен, подставляем моки для логов
      if (error.message?.includes('Unexpected token') || error.status === 404) {
        this.healthLogs.set(this.getMockLogs());
      }
    }
  }

  private getMockData(): DetailedHealthResponse {
    return {
      health: {
        status: 'Healthy',
        timestamp: new Date().toISOString(),
        duration: 120,
        details: { database: 'Connected', storage: '80% free' },
      },
      tokens: {
        isAccessTokenValid: true,
        isRefreshTokenValid: true,
        userId: 'admin-mock',
        roles: ['SuperAdmin'],
        accessTokenExpiry: new Date(Date.now() + 3600000).toISOString(),
      },
      serverMetrics: {
        cpuUsagePercentage: 15.5,
        memoryUsageBytes: 512 * 1024 * 1024,
        availableMemoryBytes: 2048 * 1024 * 1024,
        activeConnections: 42,
        uptimeMs: 86400000 * 2,
        customMetrics: {},
      },
      timestamp: new Date().toISOString(),
      environment: 'Development (Mock Mode)',
      version: '1.0.0-mock',
    };
  }

  private getMockLogs(): HealthLogEntry[] {
    return [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        endpoint: '/api/auth/login',
        status: 'Healthy',
        durationMs: 45,
        hasAccessToken: true,
        hasRefreshToken: true,
        clientIp: '127.0.0.1',
        additionalData: {},
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        endpoint: '/api/data/users',
        status: 'Degraded',
        durationMs: 1200,
        hasAccessToken: true,
        hasRefreshToken: true,
        tokenFingerprint: 'ab45...f12',
        clientIp: '192.168.1.5',
        additionalData: {},
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        endpoint: '/api/system/config',
        status: 'Unhealthy',
        durationMs: 5000,
        hasAccessToken: false,
        hasRefreshToken: false,
        clientIp: '8.8.8.8',
        additionalData: {},
      },
    ];
  }

  private checkForAlerts(response: DetailedHealthResponse): void {
    const newAlerts: HealthAlert[] = [];

    if (!response.tokens.isAccessTokenValid) {
      newAlerts.push({
        id: `token-error-${Date.now()}`,
        type: 'warning',
        message: 'Истек или невалиден access token',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'high',
      });
    }

    if (response.health.status === 'Unhealthy') {
      newAlerts.push({
        id: `health-critical-${Date.now()}`,
        type: 'error',
        message: 'Критическое состояние систем сервера',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'critical',
      });
    }

    if (newAlerts.length > 0) {
      this.alerts.update((current) => [...current, ...newAlerts]);
    }
  }

  private addAlert(alert: HealthAlert): void {
    this.alerts.update((current) => [...current, alert]);
  }

  acknowledgeAlert(alertId: string): void {
    this.alerts.update((current) =>
      current.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    );
  }

  clearAlerts(): void {
    this.alerts.set([]);
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
