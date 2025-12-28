import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerConsoleService } from '../../logger-console/services/logger-console.service';
import {
  HealthCheckResponse,
  HealthCirclesState,
  HealthStatusUI,
  SystemStatus,
} from '../models/health.model';

@Injectable({
  providedIn: 'root',
})
export class HealthCheckService {
  private http = inject(HttpClient);
  private logger = inject(LoggerConsoleService).getLogger('[HEALTH]');

  /** Статус процесса обновления */
  readonly refreshing = signal(false);

  /** Интервал опроса (60 секунд по умолчанию) */
  private readonly pollInterval = signal(60000);

  /** Предыдущее время отклика для вычисления тренда */
  private lastResponseTime = 0;

  /** Базовое состояние для UI */
  private lastKnownStatus = signal<HealthStatusUI>({
    isOnline: false,
    responseTime: 0,
    lastCheck: new Date(),
    checks: [],
    overallStatus: 'Unhealthy',
  });

  /**
   * Традиционный подход через interval + Signals для более точного контроля
   */
  readonly status = this.lastKnownStatus.asReadonly();

  /** Состояние для индикатора "3 кружка" */
  readonly circles = computed<HealthCirclesState>(() => {
    const s = this.status();
    const dbCheck = s.checks.find(
      (c) => c.name.toLowerCase().includes('sql') || c.name.toLowerCase().includes('db'),
    );
    const authCheck = s.checks.find(
      (c) => c.name.toLowerCase().includes('identity') || c.name.toLowerCase().includes('auth'),
    );

    return {
      api: s.isOnline ? s.overallStatus : 'Unhealthy',
      db: (dbCheck?.status as SystemStatus) || 'Unhealthy',
      auth: (authCheck?.status as SystemStatus) || 'Unhealthy',
      latencyTrend: this.calculateTrend(s.responseTime),
    };
  });

  constructor() {
    this.startMonitoring();
  }

  /** Запуск мониторинга */
  startMonitoring(): void {
    // Обновляем каждые 30 секунд
    timer(0, 30000)
      .pipe(tap(() => this.performCheck()))
      .subscribe();
  }

  /** Ручная проверка */
  refresh(): void {
    this.performCheck();
  }

  private performCheck(): void {
    const startTime = performance.now();
    const endpoint = `${environment.api.baseUrl}/HealthCheck`;

    // Чистый запрос на основной эндпоинт
    const headers = { Accept: 'application/json' };

    this.refreshing.set(true);
    this.http
      .get<HealthCheckResponse>(endpoint, { headers, observe: 'response' })
      .pipe(
        map((response: HttpResponse<HealthCheckResponse>) => {
          const duration = Math.round(performance.now() - startTime);
          return this.handleSuccess(response.body!, duration);
        }),
        catchError((error: HttpErrorResponse) => {
          const duration = Math.round(performance.now() - startTime);

          this.logger.error(`Health connection failed [${error.status}]`, {
            url: error.url,
            message: error.message,
          });

          return of(this.handleError(error, duration));
        }),
      )
      .subscribe((newStatus) => {
        this.checkStatusChangeAndLog(this.lastKnownStatus(), newStatus);
        this.lastKnownStatus.set(newStatus);
        this.captureNetworkMetrics(endpoint);
        this.refreshing.set(false);
      });
  }

  /** Захват детальных метрик из Resource Timing API */
  private captureNetworkMetrics(url: string): void {
    // Ждем немного, чтобы браузер успел записать entry
    setTimeout(() => {
      const entries = performance.getEntriesByName(url, 'resource');
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1] as PerformanceResourceTiming;
        this.lastNetworkMetrics.set([
          {
            name: 'DNS Lookup',
            duration: Math.round(lastEntry.domainLookupEnd - lastEntry.domainLookupStart),
            status: 'Healthy',
          },
          {
            name: 'TCP Connection',
            duration: Math.round(lastEntry.connectEnd - lastEntry.connectStart),
            status: 'Healthy',
          },
          {
            name: 'SSL Handshake',
            duration: Math.round(
              lastEntry.secureConnectionStart > 0
                ? lastEntry.connectEnd - lastEntry.secureConnectionStart
                : 0,
            ),
            status: 'Healthy',
          },
          {
            name: 'Server Processing (TTFB)',
            duration: Math.round(lastEntry.responseStart - lastEntry.requestStart),
            status: 'Healthy',
          },
          {
            name: 'Data Transfer',
            duration: Math.round(lastEntry.responseEnd - lastEntry.responseStart),
            status: 'Healthy',
          },
        ]);
      }
    }, 100);
  }

  private lastNetworkMetrics = signal<any[]>([]);
  readonly networkMetrics = this.lastNetworkMetrics.asReadonly();

  private handleSuccess(data: HealthCheckResponse, responseTime: number): HealthStatusUI {
    return {
      isOnline: true,
      responseTime,
      lastCheck: new Date(),
      checks: data.checks,
      overallStatus: data.status as SystemStatus,
    };
  }

  private handleError(err: HttpErrorResponse, responseTime: number): HealthStatusUI {
    // Даже если 503, бэкенд может вернуть JSON с деталями
    const checks = err.error?.checks || [];
    const overallStatus = err.error?.status || 'Unhealthy';

    return {
      isOnline: false,
      responseTime,
      lastCheck: new Date(),
      error: err.message,
      checks: checks,
      overallStatus: overallStatus as SystemStatus,
    };
  }

  private checkStatusChangeAndLog(oldS: HealthStatusUI, newS: HealthStatusUI): void {
    if (oldS.overallStatus !== newS.overallStatus) {
      const msg = `System status changed: ${oldS.overallStatus} -> ${newS.overallStatus}`;
      if (newS.overallStatus === 'Healthy') {
        this.logger.info(msg, newS);
      } else {
        this.logger.error(msg, newS);
      }
    }
  }

  private calculateTrend(current: number): 'up' | 'down' | 'stable' {
    if (this.lastResponseTime === 0) {
      this.lastResponseTime = current;
      return 'stable';
    }
    const diff = current - this.lastResponseTime;
    this.lastResponseTime = current;

    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  }
}
