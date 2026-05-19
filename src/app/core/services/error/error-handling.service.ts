import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { LoggingService } from '../logging/logging.service';
import {
  errorMessages,
  errorRecommendations,
  ErrorResponse,
  errorTitles,
} from '../../models/error-response.model';

interface ErrorDisplayConfig {
  showModal: boolean;
  showMessage: boolean;
  autoRedirect: boolean;
  showTechnicalInfo: boolean;
  messageType: 'error' | 'warning' | 'info';
}

interface ModalData {
  errorResponse: ErrorResponse;
  config: ErrorDisplayConfig;
  recommendation: string | null;
}

@Component({
  selector: 'app-error-modal-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorResponse">
      <div style="margin-bottom: 16px;">
        <strong>Описание:</strong>
        {{ errorResponse.userMessage || errorResponse.detail || 'Произошла ошибка' }}
      </div>
      <div *ngIf="errorResponse.entityName" style="margin-bottom: 8px;">
        <strong>Объект:</strong> {{ errorResponse.entityName }}
      </div>
      <div *ngIf="errorResponse.conflictField" style="margin-bottom: 8px;">
        <strong>Ошибка в поле:</strong> {{ errorResponse.conflictField }}
      </div>
      <div
        *ngIf="recommendation"
        style="margin-bottom: 16px; padding: 12px; background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px;"
      >
        <strong>💡 Что делать:</strong> {{ recommendation }}
      </div>
      <div
        *ngIf="errorResponse.details && errorResponse.details.length"
        style="margin-bottom: 16px;"
      >
        <strong>Дополнительная информация:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li *ngFor="let detail of errorResponse.details">{{ detail }}</li>
        </ul>
      </div>
      <div *ngIf="config.showTechnicalInfo">
        <hr style="margin: 20px 0; border-color: #d9d9d9;" />
        <div style="font-size: 12px; color: #8c8c8c;">
          <strong>Техническая информация:</strong>
          <div *ngIf="errorResponse.correlationId">
            ID корреляции: {{ errorResponse.correlationId }}
          </div>
          <div *ngIf="errorResponse.instance">Endpoint: {{ errorResponse.instance }}</div>
          <div *ngIf="errorResponse.type">Тип ошибки: {{ errorResponse.type }}</div>
        </div>
      </div>
    </div>
    <div *ngIf="!errorResponse" style="margin-bottom: 16px;">
      <strong>Ошибка:</strong> Не удалось отобразить информацию об ошибке.
    </div>
  `,
})
export class ErrorModalContentComponent {
  readonly nzModalData = inject<ModalData>(NZ_MODAL_DATA);

  errorResponse: ErrorResponse | undefined = this.nzModalData.errorResponse;
  config: ErrorDisplayConfig = this.nzModalData.config;
  recommendation: string | null = this.nzModalData.recommendation;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly message = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggingService);
  private activeModals = new Map<string, NzModalRef>();
  private readonly context = 'ErrorHandlingService';
  private readonly errorConfigs: Record<number, ErrorDisplayConfig> = {
    400: {
      showModal: true,
      showMessage: false,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'error',
    },
    401: {
      showModal: true,
      showMessage: false,
      autoRedirect: true,
      showTechnicalInfo: false,
      messageType: 'warning',
    },
    403: {
      showModal: true,
      showMessage: false,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'error',
    },
    404: {
      showModal: true,
      showMessage: false,
      autoRedirect: true,
      showTechnicalInfo: false,
      messageType: 'error',
    },
    409: {
      showModal: true,
      showMessage: false,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'warning',
    },
    422: {
      showModal: false,
      showMessage: true,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'error',
    },
    500: {
      showModal: true,
      showMessage: false,
      autoRedirect: true,
      showTechnicalInfo: true,
      messageType: 'error',
    },
    502: {
      showModal: false,
      showMessage: true,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'error',
    },
    503: {
      showModal: false,
      showMessage: true,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'warning',
    },
    0: {
      showModal: false,
      showMessage: true,
      autoRedirect: false,
      showTechnicalInfo: false,
      messageType: 'error',
    },
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeAllModals();
  }

  handleError(errorResponse: ErrorResponse, options?: Partial<ErrorDisplayConfig>): void {
    try {
      this.validateErrorResponse(errorResponse);
      this.logError(errorResponse);
      const config = {
        ...this.getErrorConfig(errorResponse.status),
        ...options,
      };
      this.displayError(errorResponse, config);
    } catch (error) {
      this.logger.error(this.context, 'Ошибка при обработке ошибки', {
        originalError: errorResponse,
        processingError: error,
      });
      this.fallbackErrorHandling();
    }
  }

  showErrorMessage(message: string, duration = 5000): void {
    this.message.error(message, { nzDuration: duration });
  }

  closeAllModals(): void {
    this.activeModals.forEach((modal) => modal.close());
    this.activeModals.clear();
    this.modalService.closeAll();
  }

  private setupRouterCleanup(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event: RouterEvent) => event instanceof NavigationStart),
        tap(() => {
          this.closeAllModals();
        }),
      )
      .subscribe();
  }

  private validateErrorResponse(errorResponse: ErrorResponse): void {
    if (
      !errorResponse ||
      !errorResponse.title ||
      !errorResponse.detail ||
      !errorResponse.instance
    ) {
      throw new Error('Invalid ErrorResponse: missing required fields (title, detail, instance)');
    }
  }

  private logError(errorResponse: ErrorResponse): void {
    this.logger.logErrorResponse(errorResponse);
  }

  private getErrorConfig(status: number): ErrorDisplayConfig {
    return (
      this.errorConfigs[status] || {
        showModal: true,
        showMessage: false,
        autoRedirect: false,
        showTechnicalInfo: true,
        messageType: 'error',
      }
    );
  }

  private displayError(errorResponse: ErrorResponse, config: ErrorDisplayConfig): void {
    if (config.showMessage) {
      const userMessage = this.getUserFriendlyMessage(errorResponse);
      this.showErrorMessage(userMessage);
    }
    if (config.showModal) {
      this.showErrorModal(errorResponse, config);
    }
  }

  private showErrorModal(errorResponse: ErrorResponse, config: ErrorDisplayConfig): void {
    if (!errorResponse) {
      this.fallbackErrorHandling();
      return;
    }
    const modalKey = this.generateModalKey(errorResponse);
    if (this.activeModals.has(modalKey)) {
      return;
    }
    const modalTitle = this.buildModalTitle(errorResponse);
    const modalData: ModalData = {
      errorResponse,
      config,
      recommendation: this.getRecommendation(errorResponse),
    };
    const modalRef: NzModalRef = this.modalService.create({
      nzTitle: modalTitle,
      nzContent: ErrorModalContentComponent,
      nzData: modalData,
      nzClosable: true,
      nzOkText: 'Понятно',
      nzCancelText: null,
      nzWidth: 600,
      nzClassName: 'error-modal',
      nzOnOk: () => {
        this.closeModal(modalKey);
      },
      nzOnCancel: () => {
        this.closeModal(modalKey);
      },
    });
    this.activeModals.set(modalKey, modalRef);
    if (config.autoRedirect) {
      modalRef.afterClose.subscribe(() => {
        this.handleAutoRedirect(errorResponse.status);
      });
    }
  }

  private generateModalKey(errorResponse: ErrorResponse): string {
    return `${errorResponse.status}_${errorResponse.correlationId || Date.now()}`;
  }

  private closeModal(modalKey: string): void {
    const modal = this.activeModals.get(modalKey);
    if (modal) {
      modal.close();
      this.activeModals.delete(modalKey);
    }
  }

  private buildModalTitle(errorResponse: ErrorResponse): string {
    return this.getHumanReadableTitle(errorResponse);
  }

  private getHumanReadableTitle(errorResponse: ErrorResponse): string {
    return errorResponse.title && !['OK', 'error', 'Error'].includes(errorResponse.title)
      ? errorResponse.title
      : errorTitles[errorResponse.status] || 'Неожиданная ошибка';
  }

  private getUserFriendlyMessage(errorResponse: ErrorResponse): string {
    if (errorResponse.userMessage && errorResponse.userMessage.trim() !== '') {
      return errorResponse.userMessage;
    }
    if (
      errorResponse.detail &&
      !errorResponse.detail.includes('status') &&
      !errorResponse.detail.includes('error code')
    ) {
      return errorResponse.detail;
    }
    return errorMessages[errorResponse.status] || 'Произошла неопределенная ошибка.';
  }

  private getRecommendation(errorResponse: ErrorResponse): string | null {
    if (errorResponse.status === 409 && errorResponse.conflictField) {
      return `Измените значение поля "${errorResponse.conflictField}" и попробуйте снова.`;
    }
    return errorRecommendations[errorResponse.status] || null;
  }

  private handleAutoRedirect(status: number): void {
    // Не делаем редирект, если мы уже на странице авторизации
    if (this.router.url.startsWith('/auth/')) {
      return;
    }

    const redirects: Record<number, string> = {
      401: '/auth/login',
      404: '/not-found',
      500: '/',
    };
    const redirectPath = redirects[status];
    if (redirectPath) {
      this.router.navigate([redirectPath]);
    }
  }

  private fallbackErrorHandling(): void {
    this.message.error(
      'Произошла критическая ошибка в системе обработки ошибок. Обратитесь в техническую поддержку.',
    );
  }
}
