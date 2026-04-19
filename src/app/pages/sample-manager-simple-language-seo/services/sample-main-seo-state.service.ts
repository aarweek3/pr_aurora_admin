import { Injectable, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, takeUntil } from 'rxjs/operators';
import { ErrorResponse } from '../../../shared/infrastructure/interceptor/models/error-response.model';
import { ErrorHandlingService } from '../../../shared/infrastructure/interceptor/services/error-handling.service';
import {
  INITIAL_SAMPLE_MAIN_SEO_STATE,
  SampleMainSeoCreateDto,
  SampleMainSeoState,
  SampleMainSeoUpdateDto,
} from '../models/sample-main-seo.model';
import { SampleMainSeoApiService } from './sample-main-seo-api.service';

@Injectable({
  providedIn: 'root',
})
export class SampleMainSeoStateService implements OnDestroy {
  private destroy$ = new Subject<void>();

  // Single Source of Truth
  private state$ = new BehaviorSubject<SampleMainSeoState>(INITIAL_SAMPLE_MAIN_SEO_STATE);

  // ---------- SELECTORS ----------
  readonly items$ = this.state$.pipe(
    map((s) => s.items),
    distinctUntilChanged(),
  );
  readonly total$ = this.state$.pipe(
    map((s) => s.total),
    distinctUntilChanged(),
  );
  readonly loading$ = this.state$.pipe(
    map((s) => s.loading),
    distinctUntilChanged(),
  );
  readonly modalVisible$ = this.state$.pipe(
    map((s) => s.modalVisible),
    distinctUntilChanged(),
  );
  readonly modalMode$ = this.state$.pipe(
    map((s) => s.modalMode),
    distinctUntilChanged(),
  );
  readonly editingItem$ = this.state$.pipe(
    map((s) => s.editingItem),
    distinctUntilChanged(),
  );
  readonly modalLoading$ = this.state$.pipe(
    map((s) => s.modalLoading),
    distinctUntilChanged(),
  );
  readonly selectedLanguageId$ = this.state$.pipe(
    map((s) => s.languageId),
    distinctUntilChanged(),
  );
  readonly error$ = this.state$.pipe(
    map((s) => s.error),
    distinctUntilChanged(),
  );
  readonly deletingId$ = this.state$.pipe(
    map((s) => s.deletingId),
    distinctUntilChanged(),
  );

  readonly languages$ = toObservable(this.langService.availableLanguages).pipe(shareReplay(1));

  constructor(
    private api: SampleMainSeoApiService,
    private message: NzMessageService,
    private langService: LanguageService,
    private errorHandling: ErrorHandlingService,
    private modal: NzModalService,
  ) {}

  private checkLanguagesAvailable(): boolean {
    const langs = this.langService.availableLanguages();
    console.log('[StateService] checkLanguagesAvailable - доступно языков:', langs?.length);
    return langs && langs.length > 0;
  }

  // ---------- HELPERS ----------

  private executeWithLoading<T>(operation: Observable<T>, isModal = false): Observable<T> {
    const loadingKey = isModal ? 'modalLoading' : 'loading';
    this.updateState({ [loadingKey]: true, error: null } as any);

    return operation.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ [loadingKey]: false } as any)),
    );
  }

  private handleError(err: any, context: string): void {
    console.error(`[SampleMainSeoStateService] Error in ${context}:`, err);
    const errorResponse = ErrorResponse.fromError(err, context);

    // Обновляем состояние ошибки
    this.updateState({ error: errorResponse });

    // Показываем тост для операций сохранения/удаления, где нет места для алерта
    if (context === 'Save' || context === 'Delete') {
      this.message.error(errorResponse.getUserMessage());
    }
  }

  // ---------- ACTIONS ----------

  loadItems(): void {
    const s = this.state$.value;
    console.groupCollapsed('[SampleMainSeo] Load Items');
    console.log('Params:', { page: s.pageNumber, size: s.pageSize, term: s.searchTerm });
    console.groupEnd();

    this.executeWithLoading(
      this.api.getPaged({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        languageId: s.languageId || undefined,
      }),
    ).subscribe({
      next: (res) => {
        this.updateState({ items: res.items, total: res.total, error: null });
      },
      error: (err) => this.handleError(err, 'LoadItems'),
    });
  }

  setSearchTerm(term: string): void {
    if (this.state$.value.searchTerm === term) return;
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageId(id: number | null): void {
    if (this.state$.value.languageId === id) return;
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  setPageIndex(index: number): void {
    if (this.state$.value.pageNumber === index) return;
    this.updateState({ pageNumber: index });
    this.loadItems();
  }

  setPageSize(size: number): void {
    if (this.state$.value.pageSize === size) return;
    this.updateState({ pageSize: size, pageNumber: 1 });
    this.loadItems();
  }

  openAddModal(): void {
    console.log('[StateService] openAddModal - открытие модалки для добавления');

    // Проверяем наличие языков
    if (!this.checkLanguagesAvailable()) {
      console.error('[StateService] Нет доступных языков! Открываем модалку с ошибкой');

      this.modal.error({
        nzTitle: 'Нет доступных языков!',
        nzContent: `
          <div style="line-height: 1.6;">
            <p style="margin-bottom: 12px;">Для создания многоязычных записей необходимо инициализировать языки системы.</p>
            <p style="margin-bottom: 12px;"><strong>Инструкция:</strong></p>
            <ol style="padding-left: 20px; margin: 0;">
              <li>Перейдите в меню <strong>"Управление языками"</strong></li>
              <li>Нажмите кнопку <strong>"Инициализировать языки"</strong></li>
              <li>После успешной инициализации обновите страницу</li>
            </ol>
          </div>
        `,
        nzWidth: 600,
        nzOkText: 'Понятно',
      });

      return; // Не открываем форму!
    }

    console.log('[StateService] Текущее состояние ПЕРЕД обновлением:', {
      modalVisible: this.state$.value.modalVisible,
      modalLoading: this.state$.value.modalLoading,
      modalMode: this.state$.value.modalMode,
    });

    this.updateState({
      modalVisible: true,
      modalMode: 'add',
      editingItem: null,
      modalLoading: false,
      error: null,
    });

    console.log('[StateService] Состояние ПОСЛЕ обновления:', {
      modalVisible: this.state$.value.modalVisible,
      modalLoading: this.state$.value.modalLoading,
      modalMode: this.state$.value.modalMode,
    });
  }

  loadById(id: number): void {
    this.executeWithLoading(this.api.getById(id), true).subscribe({
      next: (item) => {
        this.updateState({ editingItem: item, modalMode: 'edit', error: null });
      },
      error: (err) => this.handleError(err, 'LoadById'),
    });
  }

  openEditModal(id: number): void {
    this.updateState({ modalVisible: true, modalMode: 'edit' });
    this.loadById(id);
  }

  closeModal(): void {
    this.updateState({
      modalVisible: false,
      modalMode: 'add',
      editingItem: null,
      modalLoading: false,
      error: null,
    });
  }

  save(data: SampleMainSeoCreateDto | SampleMainSeoUpdateDto): void {
    const s = this.state$.value;
    const isAdd = s.modalMode === 'add';
    const request = isAdd
      ? this.api.create(data as SampleMainSeoCreateDto)
      : this.api.update((data as SampleMainSeoUpdateDto).id, data as SampleMainSeoUpdateDto);

    console.log(`[SampleMainSeo] Saving (${s.modalMode})...`, data);

    this.executeWithLoading(request, true).subscribe({
      next: () => {
        this.message.success(isAdd ? 'Запись создана' : 'Запись обновлена');
        this.closeModal();
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Save'),
    });
  }

  delete(id: number): void {
    console.log(`[SampleMainSeo] Deleting ID: ${id}`);
    this.updateState({ deletingId: id }); // Включаем спиннер

    this.api
      .delete(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ deletingId: null })), // Выключаем спиннер всегда
      )
      .subscribe({
        next: () => {
          this.message.success('Запись удалена');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Delete'),
      });
  }

  private updateState(partial: Partial<SampleMainSeoState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
