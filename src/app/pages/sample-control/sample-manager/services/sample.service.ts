import { Injectable, OnDestroy, inject } from '@angular/core';
import { ErrorResponse } from '@core/models/error-response.model';
import { ErrorHandlingService } from '@core/services/error/error-handling.service';
import { LoggingService } from '@core/services/logging/logging.service';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, takeUntil, timeout } from 'rxjs/operators';
import { SampleState } from '../models/sample-state.model';
import {
  SampleCreateRequestDto,
  SampleDetailDto,
  SamplePageRequestDto,
  SamplePagedResponseDto,
  SampleUpdateRequestDto,
} from '../models/sample.dto';
import { SampleApiService } from './sample-api.service';
import { SampleModalService } from './sample-modal.service';
import { SampleStateService } from './sample-state.service';

// ������� ��������� �������� ��� ���������
interface Sample {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class SampleService implements OnDestroy {
  private readonly apiService = inject(SampleApiService);
  private readonly stateService = inject(SampleStateService);
  private readonly sampleModalService = inject(SampleModalService);
  private readonly errorHandlingService = inject(ErrorHandlingService);
  private readonly logger = inject(LoggingService);
  private destroy$ = new Subject<void>();

  constructor() {
    this.logger.debug('SampleService', '������������� �������');
  }

  ngOnDestroy(): void {
    this.logger.debug('SampleService', '������� ��������');
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.resetState();
  }

  /**
   * ��������� ������������� ���������
   */
  sampleExists(id: number): Observable<boolean> {
    this.logger.debug('SampleService', '�������� ������������� ���������', {
      id,
    });
    return this.apiService.getSampleById(id).pipe(
      map(() => true),
      catchError((error: ErrorResponse) => {
        if (error.status === 404) {
          this.logger.debug('SampleService', '�������� �� �������', { id });
          return of(false);
        }
        this.logger.error('SampleService', '������ ��� �������� ������������� ���������', error);
        this.errorHandlingService.handleError(error);
        return of(false);
      }),
      takeUntil(this.destroy$),
    );
  }

  /**
   * �������� ��� ��������� ��� ��������� (� ���������� �������)
   */
  getAllSamplesForSelector(): Observable<Sample[]> {
    this.logger.debug('SampleService', '��������� ���� ��������� ��� ���������');
    return this.apiService.getAllSamples().pipe(
      map((samples: SampleDetailDto[]) =>
        samples.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      ),
      catchError((error: ErrorResponse) => {
        this.logger.error('SampleService', '������ ��� ��������� ���� ���������', error);
        this.errorHandlingService.handleError(error);
        return of([]);
      }),
      takeUntil(this.destroy$),
    );
  }

  getState(): Observable<SampleState> {
    return this.stateService.getState();
  }

  loadSamples(): void {
    this.logger.debug('SampleService', '������ �������� ���������');
    this.stateService.updateState({ loading: true });

    const state = this.stateService.getCurrentState();
    const request: SamplePageRequestDto = {
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      searchTerm: state.searchTerm,
      sortBy: state.sortBy,
      sortDirection: state.ascending,
    };

    this.logger.debug('SampleService', '�������� HTTP �������', request);

    this.apiService
      .getSamples(request)
      .pipe(timeout(10000), takeUntil(this.destroy$))
      .subscribe({
        next: (response: SamplePagedResponseDto) => {
          this.logger.debug('SampleService', 'HTTP ������ �������', {
            total: response.total,
            pageNumber: response.pageNumber,
            pageSize: response.pageSize,
            itemsCount: response.items.length,
          });

          this.stateService.updateState({
            items: response.items,
            total: response.total,
            loading: false,
            error: null,
          });
        },
        error: (error: any) => {
          let errorResponse: ErrorResponse;

          if (error.name === 'TimeoutError') {
            errorResponse = ErrorResponse.createNetworkError(
              `${this.apiService['baseUrl']}?pageNumber=${request.pageNumber}&pageSize=${request.pageSize}`,
              '������ �������� ������� ����� �������. ��������� �����������.',
            );
          } else {
            errorResponse =
              error instanceof ErrorResponse
                ? error
                : ErrorResponse.fromError(error, this.apiService['baseUrl']);
          }

          this.logger.error('SampleService', 'HTTP ������ ���������� �������', errorResponse);

          this.stateService.updateState({
            loading: false,
            error: errorResponse,
            items: [],
            total: 0,
          });

          this.errorHandlingService.handleError(errorResponse);
        },
      });
  }

  refreshSamples(): void {
    this.logger.debug('SampleService', '���������� ���������');
    this.loadSamples();
  }

  searchSamples(searchTerm: string): void {
    this.logger.debug('SampleService', '����� ���������', { searchTerm });
    this.stateService.updateState({ searchTerm });
    this.loadSamples();
  }

  changePage(pageNumber: number): void {
    this.logger.debug('SampleService', '��������� ��������', { pageNumber });
    this.stateService.updateState({ pageNumber });
    this.loadSamples();
  }

  changePageSize(pageSize: number): void {
    this.logger.debug('SampleService', '��������� ������� ��������', {
      pageSize,
    });
    this.stateService.updateState({ pageSize, pageNumber: 1 });
    this.loadSamples();
  }

  viewSample(id: number): void {
    this.logger.debug('SampleService', '�������� ���������', { id });
    const state = this.stateService.getCurrentState();
    const sample = state.items.find((item) => item.id === id);

    if (sample) {
      this.stateService.updateState({
        selectedSample: sample,
        viewModalVisible: true,
      });
    } else {
      this.logger.warn('SampleService', '�������� �� ������� ��� ���������', {
        id,
      });
    }
  }

  createSample(request: SampleCreateRequestDto): void {
    this.logger.debug('SampleService', '�������� ���������', request);
    this.sampleModalService.setModalOperationState(true, 'create');

    this.apiService
      .createSample(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SampleDetailDto) => {
          this.logger.info('SampleService', '�������� ������� �������', {
            id: response.id,
            name: response.name,
          });
          this.sampleModalService.setModalOperationState(false, null);
          this.sampleModalService.closeModal();
          this.loadSamples();
        },
        error: (error: ErrorResponse) => {
          this.logger.error('SampleService', '������ ��� �������� ���������', error);
          this.sampleModalService.setModalOperationState(false, null, error);
          this.errorHandlingService.handleError(error);
        },
      });
  }

  updateSample(id: number, request: SampleUpdateRequestDto): void {
    this.logger.debug('SampleService', '���������� ���������', {
      id,
      request,
    });
    this.sampleModalService.setModalOperationState(true, 'update');

    this.apiService
      .updateSample(id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SampleDetailDto) => {
          this.logger.info('SampleService', '�������� ������� ���������', {
            id: response.id,
            name: response.name,
          });
          this.sampleModalService.setModalOperationState(false, null);
          this.sampleModalService.closeModal();
          this.loadSamples();
        },
        error: (error: ErrorResponse) => {
          this.logger.error('SampleService', '������ ��� ���������� ���������', error);
          this.sampleModalService.setModalOperationState(false, null, error);
          this.errorHandlingService.handleError(error);
        },
      });
  }

  deleteSample(id: number): void {
    const state = this.stateService.getCurrentState();
    const sample = state.items.find((item) => item.id === id);

    if (!sample) {
      this.logger.error('SampleService', '�������� �� ������� ��� ��������', {
        id,
      });
      return;
    }

    const sampleName = sample.name || '����������� ��������';
    this.logger.debug('SampleService', '������ ������������� ��������', {
      id,
      sampleName,
    });

    this.sampleModalService.confirm({
      nzTitle: '������������� ��������',
      nzContent: `�� �������, ��� ������ ������� �������� "<strong>${sampleName}</strong>"?`,
      nzOkText: '��',
      nzCancelText: '������',
      nzOkDanger: true,
      nzOnOk: () => {
        this.logger.info('SampleService', '������������ �������� ��������', {
          id,
          sampleName,
        });

        this.apiService
          .deleteSample(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.logger.info('SampleService', '�������� ������� ������', {
                id,
                sampleName,
              });
              this.loadSamples();
            },
            error: (error: ErrorResponse) => {
              this.logger.error('SampleService', '������ ��� �������� ��������', error);
              this.errorHandlingService.handleError(error);
            },
          });
      },
      nzOnCancel: () => {
        this.logger.debug('SampleService', '�������� �������� ��������', {
          id,
          sampleName,
        });
      },
    });
  }

  closeViewModal(): void {
    this.logger.debug('SampleService', '�������� ���������� ���� ���������');
    this.stateService.updateState({
      viewModalVisible: false,
      selectedSample: null,
    });
  }

  // ����� ��� ������ ������� ������� (����� ���������� �������)
  destroy(): void {
    this.ngOnDestroy();
  }

  /**
   * �������������� ����� ��� �������� ���������� ���� ��������
   */
  showCreateModalForSelector(): void {
    this.sampleModalService.showCreateModal();
  }
}
