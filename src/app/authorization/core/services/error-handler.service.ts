// src/app/core/services/error-handler.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoggingService } from '@shared/infrastructure/logging/logging.service';

export interface AuthError {
  code: string;
  message: string;
  details?: any;
  action?: 'redirect' | 'retry' | 'ignore';
}

@Injectable({
  providedIn: 'root'
})
export class AuthErrorHandlerService {
  private router = inject(Router);
  private message = inject(NzMessageService);
  private logger = inject(LoggingService);

  private readonly context = 'AuthErrorHandler';

  /**
   * Обрабатывает HTTP ошибки авторизации
   */
  handleHttpError(error: HttpErrorResponse, context?: string): AuthError {
    const authError = this.mapHttpErrorToAuthError(error);
    
    this.logger.error(this.context, `HTTP Error in ${context || 'Unknown'}`, {
      status: error.status,
      message: error.message,
      url: error.url,
      authError
    });

    this.executeErrorAction(authError);
    return authError;
  }

  /**
   * Обрабатывает ошибки валидации
   */
  handleValidationError(error: any, context?: string): void {
    this.logger.warn(this.context, `Validation error in ${context || 'Unknown'}`, error);
    
    if (error.errors && typeof error.errors === 'object') {
      // Показываем первую ошибку валидации
      const firstError = Object.values(error.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        this.message.error(firstError[0] as string);
      }
    } else if (error.message) {
      this.message.error(error.message);
    } else {
      this.message.error('Ошибка валидации данных');
    }
  }

  /**
   * Обрабатывает общие ошибки
   */
  handleGenericError(error: any, context?: string): void {
    this.logger.error(this.context, `Generic error in ${context || 'Unknown'}`, error);
    this.message.error('Произошла неожиданная ошибка');
  }

  private mapHttpErrorToAuthError(error: HttpErrorResponse): AuthError {
    switch (error.status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: error.error?.message || 'Неверный запрос',
          action: 'ignore'
        };

      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Необходима авторизация',
          action: 'redirect'
        };

      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'Недостаточно прав доступа',
          action: 'ignore'
        };

      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'Ресурс не найден',
          action: 'ignore'
        };

      case 422:
        return {
          code: 'VALIDATION_ERROR',
          message: error.error?.message || 'Ошибка валидации',
          details: error.error?.errors,
          action: 'ignore'
        };

      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Слишком много запросов, попробуйте позже',
          action: 'retry'
        };

      case 500:
        return {
          code: 'INTERNAL_ERROR',
          message: 'Внутренняя ошибка сервера',
          action: 'retry'
        };

      case 0:
        return {
          code: 'NETWORK_ERROR',
          message: 'Ошибка подключения к серверу',
          action: 'retry'
        };

      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Неизвестная ошибка',
          action: 'ignore'
        };
    }
  }

  private executeErrorAction(authError: AuthError): void {
    switch (authError.action) {
      case 'redirect':
        this.message.error(authError.message);
        this.router.navigate(['/auth/login']);
        break;

      case 'retry':
        this.message.warning(authError.message);
        break;

      case 'ignore':
        if (authError.code !== 'NOT_FOUND') {
          this.message.error(authError.message);
        }
        break;
    }
  }

  /**
   * Показывает пользовательское сообщение об ошибке
   */
  showUserError(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    switch (type) {
      case 'error':
        this.message.error(message);
        break;
      case 'warning':
        this.message.warning(message);
        break;
      case 'info':
        this.message.info(message);
        break;
    }
  }

  /**
   * Проверяет, является ли ошибка критической для авторизации
   */
  isCriticalAuthError(error: HttpErrorResponse): boolean {
    return error.status === 401 && !error.url?.includes('/auth/refresh');
  }
}