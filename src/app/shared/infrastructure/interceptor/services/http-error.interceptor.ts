import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerConsoleService } from '../../../../shared/logger-console/services/logger-console.service';

import {
  errorMessages,
  ErrorResponse,
  errorTitles,
  IExtendedErrorResponse,
  toErrorStatus,
} from '../models/error-response.model';
import { ErrorHandlingService } from './error-handling.service';

interface ErrorData extends IExtendedErrorResponse {
  [key: string]: any;
}

export function HttpErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const errorHandlingService = inject(ErrorHandlingService);
  const loggerConsole = inject(LoggerConsoleService).getLogger('[API_ERR]');

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const isHealthCheck = req.url.includes('HealthCheck');

      // Логируем ошибку в консоль, если это не HealthCheck (его логирует HealthService сам)
      if (!isHealthCheck) {
        loggerConsole.error(`${req.method} ${req.url}`, {
          status: httpError.status,
          statusText: httpError.statusText,
          params: req.params
            .keys()
            .reduce((acc, key) => ({ ...acc, [key]: req.params.get(key) }), {}),
          error: httpError.error,
        });
      }

      let errorResponse: ErrorResponse;
      if (httpError.status === 0) {
        errorResponse = ErrorResponse.createNetworkError(req.urlWithParams);
      } else {
        errorResponse = createEnhancedErrorResponse(httpError, req);
      }

      // Не показываем глобальное сообщение об ошибке для иконок и HealthCheck
      const isIconRequest = req.url.endsWith('.svg') || req.url.includes('assets/icons');
      if (!isIconRequest && !isHealthCheck) {
        errorHandlingService.handleError(errorResponse);
      }

      return throwError(() => errorResponse);
    }),
  );
}

function createEnhancedErrorResponse(
  httpError: HttpErrorResponse,
  req: HttpRequest<unknown>,
): ErrorResponse {
  const serverError = httpError.error;
  const url = req.urlWithParams;
  const entityName = detectEntityFromUrl(url);
  const errorData: ErrorData = {
    status: toErrorStatus(httpError.status),
    title: getContextualTitle(httpError.status, url, entityName),
    detail: getContextualDetail(httpError, serverError, url, entityName),
    instance: url,
    requestUrl: url,
    entityName,
    conflictField: serverError?.conflictField,
    correlationId: serverError?.correlationId || generateCorrelationId(),
    type: serverError?.type,
    details: serverError?.details,
    userMessage: serverError?.userMessage,
  };
  return new ErrorResponse(errorData);
}

function detectEntityFromUrl(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('/tags') || urlLower.includes('/alba')) return 'Tag';
  if (urlLower.includes('/categories') || urlLower.includes('/category')) return 'Category';
  if (urlLower.includes('/users')) return 'User';
  if (urlLower.includes('/roles')) return 'Role';
  if (urlLower.includes('/departments')) return 'Department';
  if (urlLower.includes('/projects')) return 'Project';
  return 'Entity';
}

function getContextualTitle(status: number, url: string, entityName: string): string {
  if (status === 409) {
    switch (entityName.toLowerCase()) {
      case 'tag':
        return 'Дублирование тега';
      case 'category':
        return 'Дублирование категории';
      case 'user':
        return 'Дублирование пользователя';
      case 'role':
        return 'Дублирование роли';
      case 'department':
        return 'Дублирование отдела';
      case 'project':
        return 'Дублирование проекта';
      default:
        return 'Конфликт данных';
    }
  }
  return errorTitles[toErrorStatus(status)] || 'Неизвестная ошибка';
}

function getContextualDetail(
  httpError: HttpErrorResponse,
  serverError: any,
  url: string,
  entityName: string,
): string {
  if (serverError?.detail && !serverError.detail.includes('Http failure')) {
    return serverError.detail;
  }
  if (serverError?.message && !serverError.message.includes('Http failure')) {
    return serverError.message;
  }
  if (httpError.status === 409) {
    switch (entityName.toLowerCase()) {
      case 'tag':
        return 'Тег с таким названием уже существует в базе данных';
      case 'category':
        return 'Категория с таким названием уже существует';
      case 'user':
        return 'Пользователь с таким email уже зарегистрирован';
      case 'role':
        return 'Роль с таким названием уже существует';
      case 'department':
        return 'Отдел с таким названием уже существует';
      case 'project':
        return 'Проект с таким названием уже существует';
      default:
        return 'Запись с такими данными уже существует';
    }
  }
  return errorMessages[toErrorStatus(httpError.status)] || 'Произошла неопределенная ошибка';
}

function generateCorrelationId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}
