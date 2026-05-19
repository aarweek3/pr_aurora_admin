import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AuthService } from '../services/auth.service';
import { RequestTraceService } from '../services/request-trace.service';

// Глобальные переменные для контроля refresh токенов
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const injector = inject(Injector);
  const trace = inject(RequestTraceService);
  const isDevMode = !environment.production;

  // Игнорируем запросы к локальным ассетам (SVG, JSON и т.д.)
  // Это предотвращает добавление Bearer токенов к публичным ресурсам
  // и решает проблемы с относительными путями при роутинге
  const isLocalAsset =
    req.url.startsWith('assets/') || req.url.startsWith('/assets/') || req.url.endsWith('.svg');
  if (isLocalAsset) {
    return next(req);
  }

  const isNoisy = isNoisyRequest(req.url);

  const isSimulator = req.headers.has('X-Simulator-Request');

  if (isSimulator) {
    trace.logRequest(req.method, req.url);
  }

  // Получаем токен из localStorage (приоритет) или cookies
  const token = localStorage.getItem('accessToken');

  // Клонируем запрос с установкой withCredentials: true
  // Используем .clone({ setHeaders: ... }) который в Angular корректно мерджит заголовки,
  // не затирая существующие (такие как X-Skip-Error-Handler)
  const additionalHeaders: Record<string, string> = {};

  if (!req.headers.has('Content-Type') && !(req.body instanceof FormData)) {
    additionalHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    additionalHeaders['Authorization'] = `Bearer ${token}`;
    if (isSimulator) {
      trace.addStep(
        'Прикреплен Access Token',
        'info',
        `Header: Bearer ${token.substring(0, 10)}...`,
      );
    }
  } else if (isSimulator) {
    trace.addStep('Токен не найден в локальном хранилище', 'info', 'Используются HttpOnly Cookies');
  }

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: additionalHeaders,
  });

  // Логируем только в development режиме
  if (isDevMode && !isNoisy) {
    console.log(`🌐 HTTP ${authReq.method} ${authReq.url}`, {
      withCredentials: authReq.withCredentials,
      headers: Object.fromEntries(
        authReq.headers.keys().map((key) => [key, authReq.headers.get(key)]),
      ),
    });
  }

  return next(authReq).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && isDevMode && !isNoisy) {
        console.log(`✅ HTTP ${authReq.method} ${authReq.url} - SUCCESS ${event.status}`);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Логируем ошибки только в development режиме
      if (isDevMode) {
        console.log(`❌ HTTP ${authReq.method} ${authReq.url} - ERROR ${error.status}`, error);
        console.log('🔧 Детали ошибки:', JSON.stringify(error, null, 2));
        console.log('🔧 Статус:', error.status);
        console.log('🔧 Тело ошибки:', error.error);
      }

      // Обрабатываем 401 ошибку (Unauthorized)
      if (error.status === 401) {
        if (isSimulator) {
          trace.addStep(
            'Получен статус 401 (Unauthorized)',
            'warning',
            'Запуск процесса восстановления сессии...',
          );
        }
        return handle401Error(authReq, next, router, injector, isDevMode, trace);
      }

      // Обрабатываем 403 ошибку (Forbidden)
      if (error.status === 403) {
        if (isSimulator) {
          trace.addStep(
            'Получен статус 403 (Forbidden)',
            'error',
            'Доступ к ресурсу ограничен сервером.',
          );
        }
        console.log('🚫 Доступ запрещен');
        // Возвращаем оригинальный HttpErrorResponse для тестов
        return throwError(() => error);
      }

      // Для остальных ошибок пробрасываем оригинальный HttpErrorResponse,
      // чтобы GlobalErrorHandler мог его проигнорировать, а HttpErrorInterceptor - обработать.
      return throwError(() => error);
    }),
  );
};

/**
 * Обрабатывает 401 ошибку с автоматическим refresh токена
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  router: Router,
  injector: Injector,
  isDevMode: boolean,
  trace: RequestTraceService,
): Observable<HttpEvent<unknown>> {
  // Lazily inject AuthService to avoid circular dependency
  const authService = injector.get(AuthService);

  // Если это auth endpoint, не пытаемся refresh
  if (isAuthEndpoint(request.url)) {
    redirectToLogin(router, isDevMode);
    const error = new Error('Ошибка аутентификации');
    (error as any).status = 401;
    return throwError(() => error);
  }

  // Если уже идет процесс refresh
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((result) => result !== null),
      take(1),
      switchMap((success) => {
        if (success) {
          return next(applyLatestToken(request, trace));
        }
        return throwError(() => new Error('Session expired'));
      }),
    );
  }

  // Начинаем процесс refresh
  isRefreshing = true;
  refreshTokenSubject.next(null);

  if (isDevMode) {
    console.log('🔄 Попытка обновления токена...');
  }

  return authService.refreshToken().pipe(
    switchMap((response) => {
      if (response && response.success) {
        isRefreshing = false;
        refreshTokenSubject.next(true);

        if (isDevMode) {
          console.log('✅ Токен успешно обновлен, повторяем запрос');
        }

        if (request.headers.has('X-Simulator-Request')) {
          trace.addStep(
            'Сессия успешно обновлена (Refresh)',
            'success',
            'Повторная отправка оригинального запроса...',
          );
        }

        return next(applyLatestToken(request, trace));
      } else {
        throw new Error('Не удалось обновить токен');
      }
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(false);

      if (isDevMode) {
        console.log('❌ Ошибка обновления токена или повторного запроса:', refreshError);
      }

      if (request.headers.has('X-Simulator-Request')) {
        trace.addStep(
          'Ошибка обновления сессии (Refresh Failed)',
          'error',
          refreshError.message || 'Сессия окончательно истекла',
        );
      }

      const error = new Error('Сессия истекла. Пожалуйста, войдите заново');
      (error as any).status = 401;

      // Если это запрос симулятора, не перенаправляем на логин автоматически,
      // чтобы пользователь мог видеть результат ошибки прямо в симуляторе
      if (request.headers.has('X-Simulator-Request')) {
        return throwError(() => refreshError || error);
      }

      redirectToLogin(router, isDevMode);
      return throwError(() => error);
    }),
  );
}

/**
 * Применяет актуальный токен к запросу перед повторной отправкой
 */
function applyLatestToken(
  request: HttpRequest<unknown>,
  trace: RequestTraceService,
): HttpRequest<unknown> {
  const oldToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const latestToken = localStorage.getItem('accessToken');
  const isSimulator = request.headers.has('X-Simulator-Request');

  // Если у нас появился новый токен, отличный от того, что был в упавшем запросе - используем его
  if (latestToken && latestToken !== oldToken) {
    if (isSimulator) {
      trace.addStep(
        'Повтор запроса с НОВЫМ токеном',
        'retry',
        `Token: ${latestToken.substring(0, 10)}...`,
      );
    }
    return request.clone({
      setHeaders: { Authorization: `Bearer ${latestToken}` },
    });
  }

  // Если токена нет ИЛИ он такой же как старый (значит refresh обновил только HttpOnly куки),
  if (isSimulator) {
    trace.addStep(
      'Повтор запроса через HttpOnly Cookies',
      'retry',
      'Authorization header удален для использования кук.',
    );
  }
  // принудительно удаляем заголовок Authorization, чтобы бекенд переключился на чтение кук.
  return request.clone({
    headers: request.headers.delete('Authorization'),
  });
}

/**
 * Перенаправляет пользователя на страницу логина
 */
function redirectToLogin(router: Router, isDevMode: boolean): void {
  const currentUrl = router.url;

  // Проверяем, не находимся ли уже на странице логина
  if (!currentUrl.includes('/auth/login')) {
    if (isDevMode) {
      console.log('🔐 Перенаправление на страницу входа');
    }

    // Сохраняем текущий URL для возврата после авторизации
    const returnUrl = currentUrl !== '/' ? currentUrl : undefined;

    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: returnUrl },
    });
  } else if (isDevMode) {
    console.log('🔐 Уже на странице входа, редирект не требуется');
  }
}

/**
 * Проверяет, является ли URL endpoint аутентификации
 */
function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  const fullUrl = url.toLowerCase();
  return authEndpoints.some((endpoint) => fullUrl.includes(endpoint.toLowerCase()));
}

/**
 * Проверяет, является ли запрос "шумным" (частые запросы, которые не нужно логировать при успехе)
 */
function isNoisyRequest(url: string): boolean {
  const noisyPatterns = [
    '/api/Icons/',
    '/api/HealthCheck',
    '/api/Auth/debug-token',
    '.svg',
    '.json',
    'assets/',
  ];

  const lowerUrl = url.toLowerCase();
  return noisyPatterns.some((pattern) => lowerUrl.includes(pattern.toLowerCase()));
}

/**
 * Обрабатывает HTTP ошибки и возвращает понятное сообщение
 */
function handleError(error: HttpErrorResponse): Error {
  let errorMessage = 'Произошла неизвестная ошибка';
  const serverError = error.error as {
    message?: string;
    error?: string;
    errors?: any;
    detail?: string;
    userMessage?: string;
  };

  console.log('DEBUG: auth.interceptor.ts handleError caught:', error);
  // Пытаемся получить сообщение об ошибке от сервера или из объекта ErrorResponse
  if (serverError?.detail) {
    errorMessage = serverError.detail;
  } else if (serverError?.userMessage) {
    errorMessage = serverError.userMessage;
  } else if (serverError?.message) {
    errorMessage = serverError.message;
  } else if (serverError?.error && typeof serverError.error === 'string') {
    errorMessage = serverError.error;
  } else if (serverError?.errors) {
    // Обрабатываем ошибки валидации
    const validationErrors = Object.values(serverError.errors).flat();
    if (validationErrors.length > 0) {
      errorMessage = validationErrors[0] as string;
    }
  } else {
    // Стандартные сообщения для разных HTTP статусов
    console.log('DEBUG: Switching on status:', error.status);
    switch (error.status) {
      case 0:
        errorMessage = 'Нет связи с сервером';
        break;
      case 400:
        errorMessage = 'Некорректный запрос. Проверьте введенные данные.';
        break;
      case 401:
        errorMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
        break;
      case 403:
        errorMessage = 'Доступ запрещен. Недостаточно прав для выполнения операции.';
        break;
      case 404:
        errorMessage = 'Запрашиваемый ресурс не найден.';
        break;
      case 408:
        errorMessage = 'Время ожидания запроса истекло.';
        break;
      case 409:
        errorMessage = 'Конфликт данных. Возможно, запись уже существует.';
        break;
      case 422:
        errorMessage = 'Ошибка валидации данных. Проверьте введенную информацию.';
        break;
      case 429:
        errorMessage = 'Слишком много запросов. Попробуйте позже.';
        break;
      case 500:
        errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
        break;
      case 502:
        errorMessage = 'Проблемы с соединением с сервером.';
        break;
      case 503:
        errorMessage = 'Сервер временно недоступен. Ведутся технические работы.';
        break;
      case 504:
        errorMessage = 'Время ожидания ответа от сервера истекло.';
        break;
      default:
        errorMessage = error.message || `Ошибка ${error.status}: Неизвестная ошибка`;
    }
  }

  // Логируем ошибку для отладки
  if (!environment.production) {
    console.error('🔧 Детали ошибки:', {
      status: error.status,
      message: error.message,
      url: error.url,
      serverError: error.error,
    });
  }

  const finalError = new Error(errorMessage);
  (finalError as any).status = error.status;
  return finalError;
}

/**
 * Вспомогательная функция для безопасного извлечения сообщения об ошибке
 */
function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'Неизвестная ошибка';
}
