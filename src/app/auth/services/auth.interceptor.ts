import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Глобальные переменные для контроля refresh токенов
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isDevMode = !environment.production;

  // Получаем токен из localStorage (приоритет) или cookies
  const token = localStorage.getItem('accessToken');

  // Клонируем запрос с установкой withCredentials: true и Authorization header
  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('Content-Type') || 'application/json',
  };

  // Добавляем Authorization header если токен есть
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: headers,
  });

  // Логируем только в development режиме
  if (isDevMode) {
    console.log(`🌐 HTTP ${authReq.method} ${authReq.url}`, {
      withCredentials: authReq.withCredentials,
      headers: Object.fromEntries(
        authReq.headers.keys().map((key) => [key, authReq.headers.get(key)]),
      ),
    });
  }

  return next(authReq).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && isDevMode) {
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
        return handle401Error(authReq, next, router, authService, isDevMode);
      }

      // Обрабатываем 403 ошибку (Forbidden)
      if (error.status === 403) {
        console.log('🚫 Доступ запрещен');
        // Возвращаем оригинальный HttpErrorResponse для тестов
        return throwError(() => error);
      }

      // Для остальных ошибок используем handleError
      return throwError(() => handleError(error));
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
  authService: AuthService,
  isDevMode: boolean,
): Observable<HttpEvent<unknown>> {
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
          return next(applyLatestToken(request));
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

        return next(applyLatestToken(request));
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
function applyLatestToken(request: HttpRequest<unknown>): HttpRequest<unknown> {
  const oldToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const latestToken = localStorage.getItem('accessToken');

  // Если у нас появился новый токен, отличный от того, что был в упавшем запросе - используем его
  if (latestToken && latestToken !== oldToken) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${latestToken}` },
    });
  }

  // Если токена нет ИЛИ он такой же как старый (значит refresh обновил только HttpOnly куки),
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
 * Обрабатывает HTTP ошибки и возвращает понятное сообщение
 */
function handleError(error: HttpErrorResponse): Error {
  let errorMessage = 'Произошла неизвестная ошибка';
  const serverError = error.error as { message?: string; error?: string; errors?: any };

  // Пытаемся получить сообщение об ошибке от сервера
  if (serverError?.message) {
    errorMessage = serverError.message;
  } else if (serverError?.error) {
    errorMessage = serverError.error;
  } else if (serverError?.errors) {
    // Обрабатываем ошибки валидации
    const validationErrors = Object.values(serverError.errors).flat();
    if (validationErrors.length > 0) {
      errorMessage = validationErrors[0] as string;
    }
  } else {
    // Стандартные сообщения для разных HTTP статусов
    switch (error.status) {
      case 0:
        errorMessage = 'Не удается подключиться к серверу. Проверьте интернет-соединение.';
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
