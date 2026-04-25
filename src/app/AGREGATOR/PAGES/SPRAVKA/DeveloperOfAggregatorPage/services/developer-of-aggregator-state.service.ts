import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { 
  DeveloperOfAggregatorState, 
  initialDeveloperOfAggregatorState,
  DeveloperOfAggregatorItem,
  DeveloperOfAggregatorDetail
} from '../models/developer-of-aggregator.model';
import { DeveloperOfAggregatorApiService } from './developer-of-aggregator-api.service';
import { Observable, Subject, finalize, takeUntil, tap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { ErrorResponse } from '../../../../../shared/infrastructure/interceptor/models/error-response.model';

@Injectable({
  providedIn: 'root'
})
export class DeveloperOfAggregatorStateService implements OnDestroy {
  private api = inject(DeveloperOfAggregatorApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private modalService = inject(ModalService);
  private langService = inject(LanguageService);
  private destroy$ = new Subject<void>();

  private state = signal<DeveloperOfAggregatorState>(initialDeveloperOfAggregatorState);

  // Selectors (Read-only signals)
  items = computed(() => this.state().items);
  total = computed(() => this.state().total);
  loading = computed(() => this.state().loading);
  modalLoading = computed(() => this.state().modalLoading);
  pageNumber = computed(() => this.state().pageNumber);
  pageSize = computed(() => this.state().pageSize);
  sortBy = computed(() => this.state().sortBy);
  sortDirection = computed(() => this.state().sortDirection);
  searchTerm = computed(() => this.state().searchTerm);
  showDeleted = computed(() => this.state().showDeleted);
  viewMode = computed(() => this.state().viewMode);
  selectedId = computed(() => this.state().selectedId);
  selectedLanguageId = computed(() => this.state().languageId);
  languages = computed(() => this.langService.availableLanguages());
  error = computed(() => this.state().error);
  viewModalVisible = computed(() => this.state().viewModalVisible);
  viewItem = computed(() => this.state().viewItem);

  updateState(partial: Partial<DeveloperOfAggregatorState>): void {
    this.state.update(s => ({ ...s, ...partial }));
  }

  private checkLanguagesAvailable(): boolean {
    const langs = this.langService.availableLanguages();
    return !!(langs && langs.length > 0);
  }

  loadItems(checkEmpty = false): void {
    const s = this.state();
    const request = {
      pageNumber: s.pageNumber,
      pageSize: s.pageSize,
      searchTerm: s.searchTerm,
      languageId: s.languageId,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      showDeleted: s.showDeleted
    };

    this.executeWithLoading(this.api.getPaged(request)).subscribe({
      next: (response) => {
        this.updateState({ 
          items: response.items, 
          total: response.total,
          error: null
        });

        if (checkEmpty && !s.showDeleted) {
          if (response.total === 0) {
            this.modalService.alert({
              title: 'База данных пуста!',
              message: 'В базе данных \'DbNames\' (таблица \'developers_of_aggregator\') нет записей для отображения. Вы можете инициализировать данные из JSON файла.',
              alertType: 'info',
              centered: true,
              icon: 'system/av_info'
            });
          } else {
            this.modalService.alert({
              title: 'Обновление завершено',
              message: `Данные из БД считаны. Всего загружено записей: ${response.total}`,
              alertType: 'success',
              centered: true,
              icon: 'general/av_check-circle'
            });
          }
        }
      },
      error: (err) => this.handleError(err, 'LoadItems')
    });
  }

  setPageIndex(page: number): void {
    if (this.state().pageNumber === page) return;
    this.updateState({ pageNumber: page });
    this.loadItems();
  }

  setPageSize(size: number): void {
    if (this.state().pageSize === size) return;
    this.updateState({ pageSize: size, pageNumber: 1 });
    this.loadItems();
  }

  setSort(column: string, direction: string | null): void {
    const dirNum = direction === 'descend' ? 1 : 0;
    if (this.state().sortBy === column && this.state().sortDirection === dirNum) return;
    this.updateState({ sortBy: column, sortDirection: dirNum, pageNumber: 1 });
    this.loadItems();
  }

  setSearch(term: string): void {
    if (this.state().searchTerm === term) return;
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageId(id: number | null): void {
    if (this.state().languageId === id) return;
    this.updateState({ languageId: id ?? undefined, pageNumber: 1 });
    this.loadItems();
  }

  setShowDeleted(show: boolean): void {
    if (this.state().showDeleted === show) return;
    this.updateState({ showDeleted: show, pageNumber: 1 });
    this.loadItems();
  }

  openAddModal(onModalOpen: () => void): void {
    if (!this.checkLanguagesAvailable()) {
      this.modal.error({
        nzTitle: 'Нет доступных языков!',
        nzContent: 'Для создания записей инициализируйте языки в меню "Управление языками".',
        nzWidth: 600,
        nzOkText: 'Понятно',
      });
      return;
    }

    this.updateState({ selectedId: null, error: null });
    onModalOpen();
  }

  openView(id: number): void {
    this.executeWithLoading(this.api.getById(id)).subscribe({
      next: (item) => {
        this.updateState({ viewItem: item, viewModalVisible: true });
      },
      error: (err) => this.handleError(err, 'OpenView')
    });
  }

  closeViewModal(): void {
    this.updateState({ viewModalVisible: false, viewItem: null });
  }

  save(dto: any): Observable<DeveloperOfAggregatorDetail> {
    this.applyEnglishFallbacks(dto);

    const operation = dto.id ? this.api.update(dto) : this.api.create(dto);
    return this.executeWithLoading(operation, true).pipe(
      tap({
        next: () => {
          this.message.success(dto.id ? 'Разработчик обновлен' : 'Разработчик создан');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Save')
      })
    );
  }

  delete(id: number): void {
    this.executeWithLoading(this.api.delete(id, false)).subscribe({
      next: () => {
        this.message.success('Разработчик помечен как удаленный');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Delete')
    });
  }

  hardDelete(id: number): void {
    this.executeWithLoading(this.api.delete(id, true)).subscribe({
      next: () => {
        this.message.success('Разработчик полностью удален из базы');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'HardDelete')
    });
  }

  restore(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Разработчик успешно восстановлен');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Restore')
    });
  }

  seedFromJson(): void {
    const s = this.state();
    if (s.total > 0 && !s.showDeleted) {
       this.modalService.alert({
        title: 'Перенос невозможен',
        message: 'В БД уже есть записи. Для нового переноса очистите базу данных.',
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
        this.message.success(res.message || 'Импорт завершен');
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Seed');
      }
    });
  }

  clearDatabase(): void {
    const msgId = this.message.loading('Очистка базы данных...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.clearDatabase()).subscribe({
      next: (res) => {
        this.message.remove(msgId);
        this.message.success(`База данных очищена`);
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Clear')
      }
    });
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.message.error(errorResponse.getUserMessage());
    this.updateState({ error: errorResponse } as any);
  }

  /**
   * Автоматически заполняет пустые поля локализаций данными из английской версии (en-US).
   * По аналогии с PlatformOfAggregatorPage.
   */
  private applyEnglishFallbacks(dto: any): void {
    if (!dto.localizations || dto.localizations.length === 0) return;
    
    // 1. Находим английский язык динамически через сервис
    const enLang = this.langService.availableLanguages().find(l => l.code === 'en-US');
    const enId = enLang?.id;
    
    // 2. Ищем английскую локализацию как основной источник
    const enLoc = enId ? dto.localizations.find((l: any) => l.languageOfAggregatorId === enId) : null;
    const masterName = dto.name; // Техническое название
    
    // 3. Синхронизируем пустые поля
    dto.localizations.forEach((loc: any) => {
      const isEn = enId && loc.languageOfAggregatorId === enId;

      // Название
      if (!loc.name?.trim()) {
        loc.name = isEn ? masterName : (enLoc?.name || masterName);
      }
      
      // Остальные поля для не-английских локализаций
      if (!isEn && enLoc) {
        if (!loc.description?.trim() && enLoc.description) loc.description = enLoc.description;
        if (!loc.metaTitle?.trim() && enLoc.metaTitle) loc.metaTitle = enLoc.metaTitle;
        if (!loc.metaDescription?.trim() && enLoc.metaDescription) loc.metaDescription = enLoc.metaDescription;
      }
    });
  }

  private executeWithLoading<T>(obs: Observable<T>, isModal = false): Observable<T> {
    const key = isModal ? 'modalLoading' : 'loading';
    this.updateState({ [key]: true, error: null } as any);
    return obs.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ [key]: false } as any))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


