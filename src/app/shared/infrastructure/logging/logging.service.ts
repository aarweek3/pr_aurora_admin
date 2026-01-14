import { inject, Injectable, isDevMode } from '@angular/core';
import { environment } from '@environments/environment';
import { EnvironmentService } from '../environment/environment.service';
import { ErrorResponse } from '../interceptor/models/error-response.model';

type LogMetadata = Record<string, any> | ErrorResponse | Error | null;

/**
 * Сервис для общего логирования сообщений и ошибок.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private env = inject(EnvironmentService);
  private sessionId: string;
  private readonly sessionUserAgent: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionUserAgent = this.env.userAgent;
  }

  /**
   * Логирует информационное сообщение (уровень INFO).
   * @param context Контекст логирования (например, 'AuthService').
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  info(context: string, message: string, metadata: LogMetadata = null): void {
    if (isDevMode() || environment.logging.enableConsole) {
      console.info(`[${context}] ${message}`, metadata);
    }
  }

  /**
   * Логирует отладочное сообщение (уровень DEBUG).
   * @param context Контекст логирования.
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  debug(context: string, message: string, metadata: LogMetadata = null): void {
    if (isDevMode() && environment.features.enableDebugMode) {
      console.debug(`[${context}] ${message}`, metadata);
    }
  }

  /**
   * Логирует предупреждение (уровень WARN).
   * @param context Контекст логирования.
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  warn(context: string, message: string, metadata: LogMetadata = null): void {
    if (isDevMode() || environment.logging.enableConsole) {
      console.warn(`[${context}] ${message}`, metadata);
    }
  }

  /**
   * Логирует ошибку (уровень ERROR).
   * Доступно в продакшене для отправки в сервис мониторинга.
   * @param context Контекст логирования.
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  error(context: string, message: string, metadata: LogMetadata = null): void {
    console.error(`[${context}] ${message}`, metadata);

    if (environment.production && metadata) {
      this.sendToMonitoringService(context, message, metadata);
    }
  }

  /**
   * Логирует объект ErrorResponse для структурированных ошибок.
   * @param errorResponse Объект ошибки.
   */
  logErrorResponse(errorResponse: ErrorResponse): void {
    const logData = errorResponse.toLogObject();
    this.error('ErrorResponse', errorResponse.detail || errorResponse.title, logData);
  }

  /**
   * Логирует действия пользователя для аудита.
   * @param action Описание действия.
   * @param userId ID пользователя.
   * @param details Детали действия (опционально).
   */
  logUserAction(action: string, userId: string, details?: Record<string, any>): void {
    const metadata = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      userAgent: this.sessionUserAgent,
    };

    this.info('UserAction', `User ${userId} performed: ${action}`, metadata);
  }

  /**
   * Логирует события безопасности.
   * @param event Тип события.
   * @param metadata Дополнительные данные (опционально).
   */
  logSecurityEvent(event: string, metadata?: Record<string, any>): void {
    const securityMetadata = {
      event,
      ...metadata,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: this.sessionUserAgent,
      url: this.env.getCurrentUrl(),
    };

    this.warn('Security', `Security event: ${event}`, securityMetadata);
  }

  /**
   * Получает ID текущей сессии.
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Генерирует уникальный ID сессии.
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Отправляет критические ошибки в сервис мониторинга.
   * @param context Контекст логирования.
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные.
   */
  private sendToMonitoringService(context: string, message: string, metadata: LogMetadata): void {
    if (environment.logging.enableRemote) {
      console.warn('Would send to monitoring service:', { context, message, metadata });
    }
  }
}
