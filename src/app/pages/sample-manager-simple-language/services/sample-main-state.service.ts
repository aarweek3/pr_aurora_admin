import { inject, Injectable, OnDestroy } from '@angular/core';
import { ErrorHandlingService } from '@shared/infrastructure/interceptor/services/error-handling.service';
import { LoggingService } from '@shared/infrastructure/logging/logging.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, finalize, Observable, Subject, takeUntil } from 'rxjs';
import {
  INITIAL_SAMPLE_MAIN_STATE,
  SampleMainCreateRequestDto,
  SampleMainState,
  SampleMainUpdateRequestDto,
} from '../models/sample-main.model';
import { SampleMainApiService } from './sample-main-api.service';

@Injectable()
export class SampleMainStateService implements OnDestroy {
  private readonly api = inject(SampleMainApiService);
  private readonly logger = inject(LoggingService);
  private readonly errorHandling = inject(ErrorHandlingService);
  private readonly nzModal = inject(NzModalService);

  private readonly state$ = new BehaviorSubject<SampleMainState>(INITIAL_SAMPLE_MAIN_STATE);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.logger.debug('SampleMainStateService', 'Initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.state$.complete();
  }

  // --- State Access ---
  getState(): Observable<SampleMainState> {
    return this.state$.asObservable();
  }

  private updateState(partial: Partial<SampleMainState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  // --- Main Logic ---
  loadItems(): void {
    const s = this.state$.value;
    this.updateState({ loading: true });

    this.api
      .getPaged({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        languageId: s.languageId ?? undefined,
        sortBy: 'Id', // Default sort
        sortDirection: 'Desc',
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => this.updateState({ items: res.items, total: res.total }),
        error: (err) => this.errorHandling.handleError(err),
      });
  }

  search(term: string): void {
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguage(langId: number | null): void {
    this.updateState({ languageId: langId, pageNumber: 1 });
    this.loadItems();
  }

  changePage(page: number): void {
    this.updateState({ pageNumber: page });
    this.loadItems();
  }

  changePageSize(pageSize: number): void {
    this.updateState({ pageSize, pageNumber: 1 });
    this.loadItems();
  }

  // --- Modal Logic ---
  openAdd(): void {
    this.updateState({
      modalVisible: true,
      modalMode: 'add',
      editingItem: null,
      modalError: null,
    });
  }

  openEdit(id: number): void {
    this.updateState({
      modalLoading: true,
      modalVisible: true,
      modalMode: 'edit',
      modalError: null,
    });

    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ modalLoading: false })),
      )
      .subscribe({
        next: (item) => this.updateState({ editingItem: item }),
        error: (err) => {
          this.closeModal();
          this.errorHandling.handleError(err);
        },
      });
  }

  openView(id: number): void {
    this.updateState({
      modalLoading: true,
      modalVisible: true,
      modalMode: 'view',
      modalError: null,
    });

    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ modalLoading: false })),
      )
      .subscribe({
        next: (item) => this.updateState({ editingItem: item }),
        error: (err) => {
          this.closeModal();
          this.errorHandling.handleError(err);
        },
      });
  }

  closeModal(): void {
    this.updateState({ modalVisible: false, modalLoading: false, editingItem: null });
  }

  save(data: SampleMainCreateRequestDto | SampleMainUpdateRequestDto): void {
    const mode = this.state$.value.modalMode;
    this.logger.debug('SampleMainStateService', 'Saving data', { mode, data });

    this.updateState({ modalLoading: true, modalError: null });

    const obs =
      mode === 'add'
        ? this.api.create(data as SampleMainCreateRequestDto)
        : this.api.update(
            (data as SampleMainUpdateRequestDto).id,
            data as SampleMainUpdateRequestDto,
          );

    obs
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ modalLoading: false })),
      )
      .subscribe({
        next: (res) => {
          this.logger.info('SampleMainStateService', 'Save success', res);
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          this.logger.error('SampleMainStateService', 'Save error', err);

          // Проверяем различные варианты структуры ошибки от бэкенда
          const msg = err.error?.message || err.detail || err.title || 'Ошибка при сохранении';

          this.updateState({ modalError: msg });
          this.errorHandling.handleError(err);
        },
      });
  }

  delete(id: number, name: string): void {
    this.nzModal.confirm({
      nzTitle: 'Удаление',
      nzContent: `Удалить многоязычную запись "${name}"?`,
      nzOkDanger: true,
      nzOnOk: () => {
        this.api.delete(id).subscribe({
          next: () => this.loadItems(),
          error: (err) => this.errorHandling.handleError(err),
        });
      },
    });
  }
}
