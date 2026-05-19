import { Injectable, isDevMode } from '@angular/core';
import { environment } from '@environments/environment';
import { ErrorResponse } from '@infrastructure/interceptor/models/error-response.model';

type LogMetadata = Record<string, any> | ErrorResponse | Error | null;

/**
 * Сервис логирования для записи сообщений и ошибок (упрощенная версия с двумя параметрами).
 */
@Injectable({
  providedIn: 'root',
})
export class Logging2Service {
  /**
   * Логирует информационное сообщение (уровень INFO).
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  info(message: string, metadata: LogMetadata = null): void {
    if (isDevMode()) {
      console.info(`[INFO] ${message}`, metadata);
    }
  }

  /**
   * Логирует отладочное сообщение (уровень DEBUG).
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  debug(message: string, metadata: LogMetadata = null): void {
    if (isDevMode()) {
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }

  /**
   * Логирует предупреждение (уровень WARN).
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  warn(message: string, metadata: LogMetadata = null): void {
    if (isDevMode()) {
      console.warn(`[WARN] ${message}`, metadata);
    }
  }

  /**
   * Логирует ошибку (уровень ERROR).
   * Доступно в продакшене для отправки в внешний сервис мониторинга.
   * @param message Сообщение для логирования.
   * @param metadata Дополнительные данные (опционально).
   */
  error(message: string, metadata: LogMetadata = null): void {
    console.error(`[ERROR] ${message}`, metadata);
    // В продакшене отправляем ошибки в Sentry (или другой сервис мониторинга)
    if (environment.production && metadata) {
      // Пример интеграции с Sentry
      // Sentry.captureException(metadata instanceof ErrorResponse ? metadata.toLogObject() : metadata);
    }
  }

  /**
   * Логирует объект ErrorResponse для структурированных ошибок.
   * @param errorResponse Объект ошибки.
   */
  logErrorResponse(errorResponse: ErrorResponse): void {
    this.error(errorResponse.detail || errorResponse.title, errorResponse.toLogObject());
  }
}
