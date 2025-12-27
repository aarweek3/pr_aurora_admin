import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LoggerConsoleService } from '../../../../shared/logger-console/services/logger-console.service';
import { LoggingService } from '../../logging/logging.service';
import { ErrorResponse } from '../models/error-response.model';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private readonly message = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggingService);
  private readonly loggerConsole = inject(LoggerConsoleService).getLogger('[GLOBAL_ERR]');
  private readonly ngZone = inject(NgZone);
  private readonly context = 'GlobalErrorHandler';
  private handledErrors = new Set<string>();

  handleError(error: any, options: { type?: 'toast' | 'modal'; redirectUrl?: string } = {}): void {
    // Генерируем уникальный ключ для ошибки
    const errorKey = error instanceof Error ? error.message : JSON.stringify(error);
    if (this.handledErrors.has(errorKey)) {
      return;
    }
    this.handledErrors.add(errorKey);

    try {
      if (this.isAlreadyProcessedError(error)) {
        return;
      }
      if (error instanceof Error) {
        this.loggerConsole.error(error.message, { stack: error.stack, name: error.name });
        this.logger.error(this.context, 'JavaScript Error', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        this.ngZone.run(() => {
          this.message.error('Произошла ошибка в приложении. Попробуйте обновить страницу.', {
            nzDuration: 5000,
          });
        });
      } else {
        this.loggerConsole.error('Неизвестная ошибка', { error });
        this.logger.error(this.context, 'Неизвестная ошибка', {
          error: JSON.stringify(error),
        });
        this.ngZone.run(() => {
          this.message.error('Произошла неизвестная ошибка. Попробуйте позже.', {
            nzDuration: 5000,
          });
        });
      }
    } catch (handleError) {
      this.logger.error(this.context, 'Ошибка в обработке ошибки', {
        originalError: error,
        processingError: handleError,
      });
    } finally {
      // Очищаем handledErrors через некоторое время, чтобы избежать накопления
      setTimeout(() => this.handledErrors.delete(errorKey), 10000);
    }
  }

  private isAlreadyProcessedError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return true;
    }
    if (error instanceof ErrorResponse) {
      return true;
    }
    if (error && typeof error === 'object' && error.correlationId) {
      return true;
    }
    return false;
  }
}
