// src/app/auth/services/token.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { ILoggerConsole } from '@shared/logger-console/models/logger-console.model';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface TokenStatus {
  exists: boolean;
  valid: boolean;
  expired: boolean;
  isValid: boolean; // алиас для совместимости
  userEmail: string | null;
  userId: string | null;
  userRoles: string[];
  expiresAt: Date | null;
  timeUntilExpiry: number;
  lastChecked: Date;
  claims?: { [key: string]: string };
  isExternalAccount?: boolean;
  externalProvider?: string | null;
}

export interface ServerTokenInfo {
  success: boolean;
  claims?: Array<{ type?: string; Type?: string; value?: string; Value?: string }>;
  roles: string[];
  userId: string;
  email: string;
  expiresAt?: string;
  isAuthenticated?: boolean;
  isExternalAccount?: boolean;
  externalProvider?: string | null;
}

export interface CookieInfo {
  success: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  cookieCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private _logger?: ILoggerConsole;

  private get logger(): ILoggerConsole {
    if (!this._logger) {
      this._logger = this.injector.get(LoggerConsoleService).getLogger('TokenService');
    }
    return this._logger;
  }

  private tokenStatus$ = new BehaviorSubject<TokenStatus>(this.getEmptyStatus());
  private checkInterval = 30000; // 30 секунд
  private monitoringSubscription?: Subscription;
  private isMonitoring = false;

  constructor() {
    // НЕ запускаем автоматическую проверку при инициализации
  }

  // === ОСНОВНЫЕ МЕТОДЫ ===

  /**
   * Запустить мониторинг токенов
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.logger.debug('Запуск мониторинга токенов');
    this.isMonitoring = true;

    this.checkTokenStatus().subscribe();

    this.monitoringSubscription = timer(this.checkInterval, this.checkInterval)
      .pipe(switchMap(() => this.checkTokenStatus()))
      .subscribe();
  }

  /**
   * Остановить мониторинг токенов
   */
  stopMonitoring(): void {
    if (this.monitoringSubscription) {
      this.monitoringSubscription.unsubscribe();
      this.monitoringSubscription = undefined;
    }
    this.isMonitoring = false;
    this.logger.debug('Мониторинг токенов остановлен');
  }

  /**
   * Получить текущий статус токена (Observable)
   */
  getTokenStatus(): Observable<TokenStatus> {
    return this.tokenStatus$.asObservable();
  }

  /**
   * Получить текущий статус токена (синхронно)
   */
  getCurrentStatus(): TokenStatus {
    return this.tokenStatus$.value;
  }

  /**
   * Проверить валидность токена
   */
  isTokenValid(): boolean {
    const status = this.getCurrentStatus();
    return status.valid && status.timeUntilExpiry > 0;
  }

  /**
   * Принудительно проверить статус токена на сервере
   */
  checkTokenStatus(): Observable<TokenStatus> {
    return this.http
      .get<ServerTokenInfo>(`${ApiEndpoints.AUTH.BASE}/debug-token`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => this.mapServerResponseToStatus(response)),
        tap((status) => {
          this.tokenStatus$.next(status);
          this.logger.debug('Статус токена обновлен', status);
        }),
        catchError((error) => {
          this.logger.warn('Ошибка проверки токена (401)', { error });
          const emptyStatus = this.getEmptyStatus();
          this.tokenStatus$.next(emptyStatus);
          return of(emptyStatus);
        }),
      );
  }

  // === МЕТОДЫ ДЛЯ ТЕСТИРОВАНИЯ ===

  /**
   * Проверить токен (алиас для checkTokenStatus)
   */
  checkToken(): Observable<TokenStatus> {
    return this.checkTokenStatus();
  }

  /**
   * Получить информацию с сервера о токене
   */
  checkServerToken(): Observable<ServerTokenInfo> {
    return this.http
      .get<ServerTokenInfo>(`${ApiEndpoints.AUTH.BASE}/debug-token`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          this.logger.warn('Диагностика токена не удалась (401/error)', { error });
          // Возвращаем пустой объект вместо ошибки, чтобы не триггерить глобальный редирект
          return of({
            success: false,
            roles: [],
            userId: '',
            email: '',
            isAuthenticated: false,
          } as ServerTokenInfo);
        }),
      );
  }

  /**
   * Сравнить клиентские данные с серверными (алиас для совместимости)
   */
  validateConsistency(
    clientEmail?: string,
    clientRoles?: string[],
  ): Observable<{
    isConsistent: boolean;
    differences: string[];
    serverInfo: ServerTokenInfo | null;
    clientInfo: { email?: string; roles?: string[] };
  }> {
    return this.checkServerToken().pipe(
      map((serverInfo) => {
        const differences: string[] = [];

        // Сравниваем email
        if (clientEmail && clientEmail !== serverInfo.email) {
          differences.push(
            `Email не совпадает: клиент="${clientEmail}", сервер="${serverInfo.email}"`,
          );
        }

        // Сравниваем роли
        if (clientRoles) {
          const clientRolesUnique = [...new Set(clientRoles)].sort();
          const serverRolesUnique = [...new Set(serverInfo.roles || [])].sort();

          if (JSON.stringify(clientRolesUnique) !== JSON.stringify(serverRolesUnique)) {
            differences.push(
              `Роли не совпадают: клиент=[${clientRolesUnique.join(
                ',',
              )}], сервер=[${serverRolesUnique.join(',')}]`,
            );
          }
        }

        return {
          isConsistent: differences.length === 0,
          differences,
          serverInfo,
          clientInfo: { email: clientEmail, roles: clientRoles },
        };
      }),
      catchError((error) =>
        of({
          isConsistent: false,
          differences: [`Ошибка сервера: ${error.message}`],
          serverInfo: null,
          clientInfo: { email: clientEmail, roles: clientRoles },
        }),
      ),
    );
  }

  /**
   * Получить информацию о cookies
   */
  getCookieInfo(): Observable<CookieInfo> {
    return this.http
      .get<CookieInfo>(`${ApiEndpoints.AUTH.BASE}/debug-cookies`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          this.logger.error('Cookie info check failed:', error);
          return of({
            success: false,
            hasAccessToken: false,
            hasRefreshToken: false,
            cookieCount: 0,
          });
        }),
      );
  }

  /**
   * Получить роли пользователя из токена
   */
  getUserRoles(): Observable<string[]> {
    return this.checkServerToken().pipe(
      map((response) => [...new Set(response.roles || [])]),
      catchError(() => of([])),
    );
  }

  /**
   * Очистить статус токена
   */
  clearStatus(): void {
    this.stopMonitoring();
    this.tokenStatus$.next(this.getEmptyStatus());
    this.logger.debug('TokenService: Status cleared');
  }

  /**
   * Мгновенно подменить статус (для ТЕСТОВ)
   */
  spoofStatus(partialStatus: Partial<TokenStatus>): void {
    const current = this.getCurrentStatus();
    const updated = { ...current, ...partialStatus, lastChecked: new Date() };
    this.tokenStatus$.next(updated);
    this.logger.warn('⚠️ СТАТУС ТОКЕНА БЫЛ ПОДМЕНЕН ВРУЧНУЮ (SPOOFED)', updated);
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  /**
   * Форматировать время до истечения
   */
  formatTimeUntilExpiry(ms: number): string {
    if (ms <= 0) return 'Expired';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Получить цвет статуса для UI
   */
  getStatusColor(status?: TokenStatus): string {
    const s = status || this.getCurrentStatus();
    if (!s.isValid) return 'red';
    if (s.timeUntilExpiry < 300000) return 'orange'; // < 5 minutes
    return 'green';
  }

  /**
   * Получить текст статуса для UI
   */
  getStatusText(status?: TokenStatus): string {
    const s = status || this.getCurrentStatus();
    if (!s.isValid) return 'Invalid';
    if (s.timeUntilExpiry < 300000) return 'Expiring Soon';
    return 'Valid';
  }

  private mapServerResponseToStatus(response: ServerTokenInfo): TokenStatus {
    const expiresAt = response.expiresAt ? new Date(response.expiresAt) : null;
    let timeUntilExpiry = 0;

    if (expiresAt && expiresAt > new Date()) {
      timeUntilExpiry = expiresAt.getTime() - Date.now();
    } else if (response.success && response.isAuthenticated !== false) {
      timeUntilExpiry = 60 * 60 * 1000; // 1 час
    }

    const isValid = response.success && response.isAuthenticated !== false && timeUntilExpiry > 0;

    // ✅ ИСПРАВЛЕНИЕ: Убираем дубликаты ролей
    const uniqueRoles = [...new Set(response.roles || [])];

    // Преобразуем массив клеймов в удобный объект (map)
    const claimsMap: { [key: string]: string } = {};
    if (response.claims) {
      response.claims.forEach((c) => {
        const type = c.type || c.Type;
        const value = c.value || c.Value;
        if (type && value) {
          claimsMap[type] = value;
        }
      });
    }

    return {
      exists: response.success,
      valid: isValid,
      expired: timeUntilExpiry <= 0,
      isValid,
      userEmail: response.email || null,
      userId: response.userId || null,
      userRoles: uniqueRoles,
      expiresAt,
      timeUntilExpiry,
      lastChecked: new Date(),
      claims: claimsMap,
      isExternalAccount: response.isExternalAccount,
      externalProvider: response.externalProvider,
    };
  }

  private getEmptyStatus(): TokenStatus {
    return {
      exists: false,
      valid: false,
      expired: true,
      isValid: false,
      userEmail: null,
      userId: null,
      userRoles: [],
      expiresAt: null,
      timeUntilExpiry: 0,
      lastChecked: new Date(),
    };
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
