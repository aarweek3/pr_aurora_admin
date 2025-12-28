import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoggerConsoleService } from '../../../../shared/logger-console/services/logger-console.service';

/**
 * Логгер для HTTP запросов.
 * Сохраняет все исходящие запросы и входящие ответы в LoggerConsole.
 */
export function HttpRequestLoggerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const logger = inject(LoggerConsoleService).getLogger('[HTTP]');
  const startTime = performance.now();

  // Логируем начало запроса
  logger.debug(`>>> ${req.method} ${req.url}`, {
    body: req.body,
    params: req.params.keys().reduce((acc, key) => ({ ...acc, [key]: req.params.get(key) }), {}),
  });

  // Игнорируем запросы к ассетам (иконки, json переводы), чтобы не спамить
  const isAsset = req.url.includes('/assets/') || req.url.endsWith('.svg');
  if (isAsset) return next(req);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Math.round(performance.now() - startTime);
          const statusIcon = event.ok ? '✅' : '⚠️';

          logger.info(`${statusIcon} ${event.status} ${req.url} (${duration}ms)`, {
            status: event.status,
            body: event.body,
            duration: `${duration}ms`,
          });
        }
      },
      error: (error) => {
        const duration = Math.round(performance.now() - startTime);
        logger.error(`❌ ${error.status || 'ERR'} ${req.url} (${duration}ms)`, {
          status: error.status,
          message: error.message,
          error: error.error,
          duration: `${duration}ms`,
        });
      },
    }),
  );
}
