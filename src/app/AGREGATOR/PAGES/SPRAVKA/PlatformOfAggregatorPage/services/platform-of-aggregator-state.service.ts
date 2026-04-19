import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { Observable, Subject } from 'rxjs';
import { finalize, shareReplay, takeUntil } from 'rxjs/operators';
import { ErrorResponse } from '../../../../../shared/infrastructure/interceptor/models/error-response.model';
import {
  INITIAL_PLATFORM_STATE,
  PlatformOfAggregatorCreateDto,
  PlatformOfAggregatorDetailDto,
  PlatformOfAggregatorItemDto,
  PlatformOfAggregatorState,
  PlatformOfAggregatorUpdateDto,
} from '../models/platform-of-aggregator.model';
import { PlatformOfAggregatorApiService } from './platform-of-aggregator-api.service';

@Injectable({
  providedIn: 'root',
})
export class PlatformOfAggregatorStateService implements OnDestroy {
  private destroy$ = new Subject<void>();

  // Single Source of Truth (Signal)
  readonly state = signal<PlatformOfAggregatorState>(INITIAL_PLATFORM_STATE);

  // ---------- SELECTORS (Computed Signals) ----------
  readonly items = computed(() => this.state().items);
  readonly total = computed(() => this.state().total);
  readonly loading = computed(() => this.state().loading);
  readonly modalVisible = computed(() => this.state().modalVisible);
  readonly modalMode = computed(() => this.state().modalMode);
  readonly editingItem = computed(() => this.state().editingItem);
  readonly modalLoading = computed(() => this.state().modalLoading);
  readonly selectedLanguageId = computed(() => this.state().languageId);
  readonly error = computed(() => this.state().error);
  readonly deletingId = computed(() => this.state().deletingId);
  readonly showDeleted = computed(() => this.state().showDeleted);
  readonly pageSize = computed(() => this.state().pageSize);
  readonly pageNumber = computed(() => this.state().pageNumber);
  readonly searchTerm = computed(() => this.state().searchTerm);

  readonly viewModalVisible = computed(() => this.state().viewModalVisible);
  readonly viewItem = computed(() => this.state().viewItem);

  // Языки из LanguageService (через toSignal для реактивности)
  readonly languages = toSignal(toObservable(this.langService.availableLanguages).pipe(shareReplay(1)), { initialValue: [] });

  constructor(
    private api: PlatformOfAggregatorApiService,
    private message: NzMessageService,
    private langService: LanguageService,
    private modal: NzModalService,
    private modalService: ModalService,
  ) {}

  private checkLanguagesAvailable(): boolean {
    const langs = this.langService.availableLanguages();
    return !!(langs && langs.length > 0);
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
    const errorResponse = ErrorResponse.fromError(err, context);
    this.updateState({ error: errorResponse });
    if (context === 'Save' || context === 'Delete') {
      this.message.error(errorResponse.getUserMessage());
    }
  }

  // ---------- ACTIONS ----------
  loadItems(checkEmpty = false): void {
    const s = this.state();
    this.executeWithLoading(
      this.api.getPaged({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        languageId: s.languageId || undefined,
        showDeleted: s.showDeleted,
      }),
    ).subscribe({
      next: (res) => {
        this.updateState({ items: res.items, total: res.total, error: null });

        if (checkEmpty && res.total === 0 && !s.showDeleted) {
          this.modalService.alert({
            title: 'База данных пуста',
            message: 'В данный момент в базе данных нет ни одной записи о платформах. Вы можете внести их вручную или воспользоваться кнопкой "Перенести из JSON".',
            alertType: 'info',
            centered: true,
            icon: 'system/av_info'
          });
        }
      },
      error: (err) => this.handleError(err, 'LoadItems'),
    });
  }

  setSearchTerm(term: string): void {
    if (this.state().searchTerm === term) return;
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setShowDeleted(value: boolean): void {
    if (this.state().showDeleted === value) return;
    this.updateState({ showDeleted: value, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageId(id: number | null): void {
    if (this.state().languageId === id) return;
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  setPageIndex(index: number): void {
    if (this.state().pageNumber === index) return;
    this.updateState({ pageNumber: index });
    this.loadItems();
  }

  setPageSize(size: number): void {
    if (this.state().pageSize === size) return;
    this.updateState({ pageSize: size, pageNumber: 1 });
    this.loadItems();
  }

  openAddModal(): void {
    if (!this.checkLanguagesAvailable()) {
      this.modal.error({
        nzTitle: 'Нет доступных языков!',
        nzContent: 'Для создания записей инициализируйте языки в меню "Управление языками".',
        nzWidth: 600,
        nzOkText: 'Понятно',
      });
      return;
    }

    this.updateState({
      modalVisible: true,
      modalMode: 'add',
      editingItem: null,
      modalLoading: false,
      error: null,
    });
  }

  loadById(id: number): void {
    this.executeWithLoading(this.api.getById(id), true).subscribe({
      next: (item) => this.updateState({ editingItem: item, modalMode: 'edit', error: null }),
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

  // ---------- VIEW ACTIONS ----------
  openViewModal(id: number): void {
    this.updateState({ viewModalVisible: true, viewItem: null, modalLoading: true });
    this.executeWithLoading(this.api.getById(id), true).subscribe({
      next: (item) => this.updateState({ viewItem: item, error: null }),
      error: (err) => this.handleError(err, 'View'),
    });
  }

  closeViewModal(): void {
    this.updateState({ viewModalVisible: false, viewItem: null });
  }

  save(data: PlatformOfAggregatorCreateDto | PlatformOfAggregatorUpdateDto): void {
    // Применяем автозаполнение пустых полей из английской локализации
    this.applyEnglishFallbacks(data);

    const s = this.state();
    const isAdd = s.modalMode === 'add';
    const request = isAdd
      ? this.api.create(data as PlatformOfAggregatorCreateDto)
      : this.api.update((data as PlatformOfAggregatorUpdateDto).id, data as PlatformOfAggregatorUpdateDto);

    this.executeWithLoading(request, true).subscribe({
      next: () => {
        this.message.success(isAdd ? 'Платформа создана' : 'Платформа обновлена');
        this.closeModal();
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Save'),
    });
  }

  delete(id: number, isHard: boolean = false): void {
    this.updateState({ deletingId: id });
    this.api
      .delete(id, isHard)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ deletingId: null })),
      )
      .subscribe({
        next: () => {
          this.message.success(isHard ? 'Платформа ПОЛНОСТЬЮ удалена' : 'Платформа перемещена в корзину (Soft Delete)');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Delete'),
      });
  }

  restore(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Платформа успешно восстановлена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Restore'),
    });
  }

  clearDatabase(): void {
    const msgId = this.message.loading('Очистка базы данных...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.clearDatabase()).subscribe({
      next: () => {
        this.message.remove(msgId);
        this.message.success('База данных успешно очищена');
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Clear');
      },
    });
  }

  async seedFromJson(): Promise<void> {
    const s = this.state();
    
    // Проверка наличия записей в БД
    if (s.total > 0) {
      await this.modalService.alert({
        title: 'Перенос невозможен',
        message: 'В БД есть записи, перенос данных из Json в БД невозможен. Для нового переноса удалите данные из БД.',
        alertType: 'warning',
        centered: true,
        icon: 'system/av_info'
      });
      return;
    }

    const msgId = this.message.loading('Импорт данных из JSON...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.seedFromJson()).subscribe({
      next: (res) => {
        this.message.remove(msgId);
        this.message.success(res.message || 'Данные успешно импортированы');
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Seed');
      },
    });
  }

  private updateState(partial: Partial<PlatformOfAggregatorState>): void {
    this.state.update(s => ({ ...s, ...partial }));
  }

  /**
   * Автоматически заполняет пустые поля локализаций данными из английской версии (en-US).
   * @param data Данные платформы для сохранения
   */
  private applyEnglishFallbacks(data: PlatformOfAggregatorCreateDto | PlatformOfAggregatorUpdateDto): void {
    if (!data.localizations || data.localizations.length === 0) return;

    // 1. Ищем английскую локализацию как основной источник данных
    const enLoc = data.localizations.find(l => l.languageCode === 'en-US');
    const masterName = data.name; // Техническое название платформы

    // 2. Проходим по всем локализациям и заполняем пустоты
    data.localizations.forEach(loc => {
      const isEn = loc.languageCode === 'en-US';

      // Если имя локализации пустое — берем из английской версии или из технического названия
      if (!loc.name?.trim()) {
        loc.name = isEn ? masterName : (enLoc?.name || masterName);
      }

      // Если это не английская локализация, заполняем остальные поля
      if (!isEn && enLoc) {
        if (!loc.description?.trim() && enLoc.description) loc.description = enLoc.description;
        if (!loc.htmlContent?.trim() && enLoc.htmlContent) loc.htmlContent = enLoc.htmlContent;
        if (!loc.urlPicture?.trim() && enLoc.urlPicture) loc.urlPicture = enLoc.urlPicture;

        // Заполнение SEO данных
        if (enLoc.seoData) {
          if (!loc.seoData) {
            // Если SEO блока вообще нет, создаем клон без ID
            const { id, ...seoRest } = enLoc.seoData;
            loc.seoData = { ...seoRest, noIndex: enLoc.seoData.noIndex, noFollow: enLoc.seoData.noFollow } as any;
          } else {
            // Если SEO блок есть, заполняем только пустые поля
            if (!loc.seoData.metaTitle?.trim()) loc.seoData.metaTitle = enLoc.seoData.metaTitle;
            if (!loc.seoData.metaDescription?.trim()) loc.seoData.metaDescription = enLoc.seoData.metaDescription;
            if (!loc.seoData.metaKeywords?.trim()) loc.seoData.metaKeywords = enLoc.seoData.metaKeywords;
            
            // Дополнительные SEO поля
            if (!loc.seoData.ogTitle?.trim()) loc.seoData.ogTitle = enLoc.seoData.ogTitle;
            if (!loc.seoData.ogDescription?.trim()) loc.seoData.ogDescription = enLoc.seoData.ogDescription;
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
