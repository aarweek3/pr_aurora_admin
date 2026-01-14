import { Injectable } from '@angular/core';
import { ErrorResponse } from '../interceptor/models/error-response.model';
import { LoggingService } from './logging.service';

type LogMetadata = Record<string, any> | ErrorResponse | Error | null;

export type AuthAction =
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register_attempt'
  | 'register_success'
  | 'register_failed'
  | 'token_refresh'
  | 'token_expired'
  | 'session_expired'
  | 'password_reset_request'
  | 'password_changed'
  | 'user_blocked'
  | 'unauthorized_access'
  | 'permission_denied';

export interface AuthLogEntry {
  timestamp: string;
  sessionId: string;
  userId?: string;
  action: AuthAction;
  context: string;
  message: string;
  metadata?: LogMetadata;
  level: 'info' | 'warn' | 'error';
  userAgent?: string;
  ip?: string;
}

/**
 * Сервис для логирования событий, связанных с авторизацией.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthLoggingService {
  private authLogs: AuthLogEntry[] = [];
  private maxAuthLogs = 500;
  private currentUserId?: string;

  constructor(private loggingService: LoggingService) {}

  /**
   * Логирует событие авторизации.
   * @param action Тип действия.
   * @param userId ID пользователя (опционально).
   * @param metadata Дополнительные данные (опционально).
   */
  logAuthEvent(action: AuthAction, userId?: string, metadata: LogMetadata = null): void {
    const authEntry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.loggingService.getSessionId(),
      userId: userId || this.currentUserId,
      action,
      context: 'AuthEvent',
      message: this.getAuthActionMessage(action),
      metadata,
      level: this.getAuthActionLevel(action),
      ip: 'client', // В реальном проекте получать с сервера
    };

    this.authLogs.push(authEntry);
    this.trimAuthLogs();

    const logMessage = `[AUTH:${action}] ${authEntry.message}`;
    switch (authEntry.level) {
      case 'info':
        this.loggingService.info('AuthEvent', logMessage, metadata);
        break;
      case 'warn':
        this.loggingService.warn('AuthEvent', logMessage, metadata);
        break;
      case 'error':
        this.loggingService.error('AuthEvent', logMessage, metadata);
        break;
    }
  }

  /**
   * Логирует попытку входа в систему.
   * @param email Email пользователя.
   * @param success Успешность попытки.
   * @param reason Причина неудачи (если есть).
   */
  logLoginAttempt(email: string, success: boolean, reason?: string): void {
    const action: AuthAction = success ? 'login_success' : 'login_failed';
    const metadata = {
      email,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logAuthEvent(action, undefined, metadata);

    if (!success) {
      this.loggingService.warn('Security', `Failed login attempt for ${email}`, { reason });
    }
  }

  /**
   * Логирует попытку регистрации.
   * @param email Email пользователя.
   * @param success Успешность регистрации.
   * @param reason Причина неудачи (если есть).
   */
  logRegistrationAttempt(email: string, success: boolean, reason?: string): void {
    const action: AuthAction = success ? 'register_success' : 'register_failed';
    const metadata = {
      email,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logAuthEvent(action, undefined, metadata);
  }

  /**
   * Логирует обновление токена.
   * @param userId ID пользователя.
   * @param success Успешность обновления.
   * @param reason Причина неудачи (если есть).
   */
  logTokenRefresh(userId: string, success: boolean, reason?: string): void {
    const metadata = {
      userId,
      success,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logAuthEvent('token_refresh', userId, metadata);

    if (!success) {
      this.loggingService.warn('TokenService', `Token refresh failed for user ${userId}`, {
        reason,
      });
    }
  }

  /**
   * Устанавливает ID текущего пользователя.
   * @param userId ID пользователя.
   */
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
    this.loggingService.info('AuthLoggingService', `User ID set: ${userId}`);
  }

  /**
   * Очищает ID текущего пользователя.
   */
  clearCurrentUserId(): void {
    const previousUserId = this.currentUserId;
    this.currentUserId = undefined;
    this.loggingService.info('AuthLoggingService', `User ID cleared for: ${previousUserId}`);
  }

  /**
   * Получает все auth логи.
   */
  getAuthLogs(): AuthLogEntry[] {
    return [...this.authLogs];
  }

  /**
   * Получает auth логи по действию.
   * @param action Действие для фильтрации.
   */
  getAuthLogsByAction(action: AuthAction): AuthLogEntry[] {
    return this.authLogs.filter((log) => log.action === action);
  }

  /**
   * Получает auth логи по пользователю.
   * @param userId ID пользователя для фильтрации.
   */
  getAuthLogsByUser(userId: string): AuthLogEntry[] {
    return this.authLogs.filter((log) => log.userId === userId);
  }

  /**
   * Экспортирует auth логи для анализа.
   */
  exportAuthLogs(): string {
    return JSON.stringify(
      {
        sessionId: this.loggingService.getSessionId(),
        currentUserId: this.currentUserId,
        authLogs: this.authLogs,
        exportedAt: new Date().toISOString(),
        totalLogs: this.authLogs.length,
      },
      null,
      2,
    );
  }

  /**
   * Очищает auth логи.
   */
  clearAuthLogs(): void {
    this.authLogs = [];
    this.loggingService.info('AuthLoggingService', 'Auth logs cleared');
  }

  /**
   * Получает статистику auth событий.
   */
  getAuthStats(): Record<AuthAction, number> {
    const stats = {} as Record<AuthAction, number>;
    this.authLogs.forEach((log) => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });
    return stats;
  }

  /**
   * Логирует auth ошибку.
   * @param errorResponse Объект ошибки.
   */
  logAuthError(errorResponse: ErrorResponse): void {
    let action: AuthAction = 'unauthorized_access';

    if (errorResponse.instance?.includes('/login')) {
      action = 'login_failed';
    } else if (errorResponse.instance?.includes('/register')) {
      action = 'register_failed';
    } else if (errorResponse.status === 403) {
      action = 'permission_denied';
    }

    this.logAuthEvent(action, this.currentUserId, errorResponse.toLogObject());
  }

  /**
   * Проверяет, является ли ошибка auth-специфичной.
   * @param errorResponse Объект ошибки.
   */
  private isAuthError(errorResponse: ErrorResponse): boolean {
    const authUrls = ['/auth/', '/login', '/register', '/logout', '/refresh'];
    return authUrls.some(
      (url) => errorResponse.instance?.includes(url) || errorResponse.requestUrl?.includes(url),
    );
  }

  /**
   * Ограничивает количество auth логов в памяти.
   */
  private trimAuthLogs(): void {
    if (this.authLogs.length > this.maxAuthLogs) {
      this.authLogs = this.authLogs.slice(-this.maxAuthLogs);
    }
  }

  /**
   * Получает сообщение для auth действия.
   * @param action Тип действия.
   */
  private getAuthActionMessage(action: AuthAction): string {
    const messages: Record<AuthAction, string> = {
      login_attempt: 'Попытка входа в систему',
      login_success: 'Успешный вход в систему',
      login_failed: 'Неудачная попытка входа',
      logout: 'Выход из системы',
      register_attempt: 'Попытка регистрации',
      register_success: 'Успешная регистрация',
      register_failed: 'Неудачная регистрация',
      token_refresh: 'Обновление токена',
      token_expired: 'Истечение срока токена',
      session_expired: 'Истечение сессии',
      password_reset_request: 'Запрос сброса пароля',
      password_changed: 'Смена пароля',
      user_blocked: 'Блокировка пользователя',
      unauthorized_access: 'Неавторизованный доступ',
      permission_denied: 'Отказ в доступе',
    };
    return messages[action] || action;
  }

  /**
   * Получает уровень логирования для auth действия.
   * @param action Тип действия.
   */
  private getAuthActionLevel(action: AuthAction): 'info' | 'warn' | 'error' {
    const errorActions: AuthAction[] = [
      'login_failed',
      'register_failed',
      'unauthorized_access',
      'permission_denied',
      'user_blocked',
    ];
    const warnActions: AuthAction[] = [
      'token_expired',
      'session_expired',
      'password_reset_request',
    ];
    if (errorActions.includes(action)) return 'error';
    if (warnActions.includes(action)) return 'warn';
    return 'info';
  }
}
