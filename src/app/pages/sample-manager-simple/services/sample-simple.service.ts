import { inject, Injectable, OnDestroy } from '@angular/core';
import { ErrorHandlingService } from '@core/services/error/error-handling.service';
import { LoggingService } from '@core/services/logging/logging.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, finalize, Observable, Subject, takeUntil } from 'rxjs';
import {
  INITIAL_SIMPLE_STATE,
  SampleSimpleCreateDto,
  SampleSimpleDto,
  SampleSimpleState,
  SampleSimpleUpdateDto,
} from '../models/sample-simple.model';
import { SampleSimpleApiService } from './sample-simple-api.service';

@Injectable()
export class SampleSimpleService implements OnDestroy {
  private readonly api = inject(SampleSimpleApiService);
  private readonly logger = inject(LoggingService);
  private readonly errorHandling = inject(ErrorHandlingService);
  private readonly nzModal = inject(NzModalService);

  private readonly state$ = new BehaviorSubject<SampleSimpleState>(INITIAL_SIMPLE_STATE);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.logger.debug('SampleSimpleService', 'Initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.state$.complete();
  }

  // --- State Access ---
  getState(): Observable<SampleSimpleState> {
    return this.state$.asObservable();
  }

  private updateState(partial: Partial<SampleSimpleState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  // --- Main Logic ---
  loadItems(): void {
    const s = this.state$.value;
    this.updateState({ loading: true });

    this.api
      .getSamples({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        sortBy: 'name',
        sortDirection: 'ASC',
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
    this.updateState({ modalVisible: true, modalMode: 'add', editingItem: null, modalError: null });
  }

  openEdit(item: SampleSimpleDto): void {
    this.updateState({
      modalVisible: true,
      modalMode: 'edit',
      editingItem: item,
      modalError: null,
    });
  }

  openView(item: SampleSimpleDto): void {
    this.updateState({
      modalVisible: true,
      modalMode: 'view',
      editingItem: item,
      modalError: null,
    });
  }

  closeModal(): void {
    this.updateState({ modalVisible: false, modalLoading: false });
  }

  save(data: SampleSimpleCreateDto | SampleSimpleUpdateDto): void {
    this.updateState({ modalLoading: true, modalError: null });
    const mode = this.state$.value.modalMode;

    const obs =
      mode === 'add'
        ? this.api.create(data as SampleSimpleCreateDto)
        : this.api.update((data as SampleSimpleUpdateDto).id, data as SampleSimpleUpdateDto);

    obs
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ modalLoading: false })),
      )
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          const msg = err.detail || err.title || 'Ошибка при сохранении';
          this.updateState({ modalError: msg });
          this.errorHandling.handleError(err);
        },
      });
  }

  delete(id: number, name: string): void {
    this.nzModal.confirm({
      nzTitle: 'Удаление',
      nzContent: `Удалить "${name}"?`,
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
