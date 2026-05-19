import { Injectable, OnDestroy, inject } from '@angular/core';
import { ErrorResponse } from '@core/models/error-response.model';
import { LoggingService } from '@core/services/logging/logging.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SampleDetailDto } from '../models/sample.dto';
import { SampleStateService } from './sample-state.service';

@Injectable({
  providedIn: 'root',
})
export class SampleModalService implements OnDestroy {
  private readonly stateService = inject(SampleStateService);
  private readonly modal = inject(NzModalService);
  private readonly logger = inject(LoggingService);

  ngOnDestroy(): void {
    this.logger.debug('SampleModalService', '������� ��������');
  }

  /**
   * �������� ��������� ���� ��� �������� ���������
   */
  showCreateModal(): void {
    this.logger.debug('SampleModalService', '�������� ��������� ���� ��������');
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
   * �������� ��������� ���� ��� �������������� ���������
   */
  showEditModal(sample: SampleDetailDto): void {
    this.logger.debug('SampleModalService', '�������� ��������� ���� ��������������', {
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
   * ������� ��������� ����
   */
  closeModal(): void {
    this.logger.debug('SampleModalService', '�������� ���������� ����');
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
   * ���������� ��������� ��������� ��������
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
   * �������� ��������� ���� ������������� ��������
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
    this.logger.debug('SampleModalService', '�������� ��������� ���� �������������', {
      title: config.nzTitle,
    });
    this.modal.confirm({
      nzTitle: config.nzTitle,
      nzContent: config.nzContent,
      nzOkText: config.nzOkText,
      nzCancelText: config.nzCancelText,
      nzOkDanger: config.nzOkDanger,
      nzOnOk: () => {
        this.logger.info('SampleModalService', '������������ ��������');
        config.nzOnOk();
      },
      nzOnCancel: () => {
        this.logger.debug('SampleModalService', '�������� ��������');
        config.nzOnCancel();
      },
    });
  }
}
