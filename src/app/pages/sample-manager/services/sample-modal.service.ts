import { Injectable, OnDestroy, inject } from '@angular/core';
import { ErrorResponse } from '@shared/infrastructure/interceptor/models/error-response.model';
import { LoggingService } from '@shared/infrastructure/logging/logging.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SampleDetailDto } from '../models/sample.dto';
import { SampleStateService } from './sample-state.service';

@Injectable()
export class SampleModalService implements OnDestroy {
  private readonly stateService = inject(SampleStateService);
  private readonly modal = inject(NzModalService);
  private readonly logger = inject(LoggingService);

  ngOnDestroy(): void {
    this.logger.debug('SampleModalService', 'Очистка ресурсов');
  }

  /**
   * Показать модальное окно для создания родителей
   */
  showCreateModal(): void {
    this.logger.debug('SampleModalService', 'Показать модальное окно создания');
    this.stateService.updateState({
      editModalVisible: true,
      editModalMode: 'add',
      editingSample: null,
      modalIsLoading: false,
      modalOperation: null,
      modalError: null,
    });
  }

  /**
   * Показать модальное окно для редактирования родителей
   */
  showEditModal(sample: SampleDetailDto): void {
    this.logger.debug('SampleModalService', 'Показать модальное окно редактирования', {
      id: sample.id,
    });
    this.stateService.updateState({
      editModalVisible: true,
      editModalMode: 'edit',
      editingSample: sample,
      modalIsLoading: false,
      modalOperation: null,
      modalError: null,
    });
  }

  /**
   * Закрыть модальное окно
   */
  closeModal(): void {
    this.logger.debug('SampleModalService', 'Закрытие модального окна');
    this.stateService.updateState({
      editModalVisible: false,
      editModalMode: 'add',
      editingSample: null,
      modalIsLoading: false,
      modalOperation: null,
      modalError: null,
    });
  }

  /**
   * Установить состояние модальной операции
   */
  setModalOperationState(
    isLoading: boolean,
    operation: 'create' | 'update' | null,
    error: ErrorResponse | null = null,
  ): void {
    this.stateService.updateState({
      modalIsLoading: isLoading,
      modalOperation: operation,
      modalError: error,
    });
  }

  /**
   * Показать модальное окно подтверждения удаления
   */
  confirm(config: {
    nzTitle: string;
    nzContent: string;
    nzOkText: string;
    nzCancelText: string;
    nzOkDanger: boolean;
    nzOnOk: () => void;
    nzOnCancel: () => void;
  }): void {
    this.logger.debug('SampleModalService', 'Показать модальное окно подтверждения', {
      title: config.nzTitle,
    });
    this.modal.confirm({
      nzTitle: config.nzTitle,
      nzContent: config.nzContent,
      nzOkText: config.nzOkText,
      nzCancelText: config.nzCancelText,
      nzOkDanger: config.nzOkDanger,
      nzOnOk: () => {
        this.logger.info('SampleModalService', 'Подтверждено действие');
        config.nzOnOk();
      },
      nzOnCancel: () => {
        this.logger.debug('SampleModalService', 'Отменено действие');
        config.nzOnCancel();
      },
    });
  }
}
