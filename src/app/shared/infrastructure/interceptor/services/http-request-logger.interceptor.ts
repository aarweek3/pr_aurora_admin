import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LogEntry } from '../../../../shared/logger-console/models/logger-console.model';
import { LoggerConsoleService } from '../../../../shared/logger-console/services/logger-console.service';

/**
 * Логгер для HTTP запросов.
 * Сохраняет все исходящие запросы и входящие ответы в LoggerConsoleService в структурированном виде.
 */
export function HttpRequestLoggerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const loggerService = inject(LoggerConsoleService);
  const startTime = Date.now();

  // Игнорируем технические запросы и ассеты
  const isExcluded =
    req.url.includes('/assets/') ||
    req.url.endsWith('.svg') ||
    req.url.includes('@vite') ||
    req.url.includes('node_modules');

  if (isExcluded) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;

          const entry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            level: 'info',
            type: 'http',
            prefix: '[HTTP]',
            message: `>>> ${req.method} ${req.url}`,
            httpDetails: {
              method: req.method,
              url: req.url,
              statusCode: event.status,
              statusText: event.statusText,
              duration: duration,
            },
            data: [
              req.body ? { 'Request Body': req.body } : null,
              event.body ? { 'Response Body': event.body } : null,
            ].filter((x): x is any => x !== null),
          };

          loggerService.addEntry(entry);
        }
      },
      error: (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;

        const entry: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          level: 'error',
          type: 'http',
          prefix: '[HTTP]',
          message: `❌ ${req.method} ${req.url}`,
          httpDetails: {
            method: req.method,
            url: req.url,
            statusCode: error.status,
            statusText: error.statusText,
            duration: duration,
          },
          data: [
            req.body ? { 'Request Body': req.body } : null,
            { Error: error.message, Details: error.error },
          ].filter((x): x is any => x !== null),
        };

        loggerService.addEntry(entry);
      },
    }),
  );
}
