import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { Observable, Subject, finalize, takeUntil, tap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import {
  CategoryTagOfAggregatorState,
  initialCategoryTagOfAggregatorState,
  CategoryTagOfAggregatorItem,
  CategoryTagOfAggregatorDetail,
} from '../models/category-tag-of-aggregator.model';
import { CategoryTagOfAggregatorApiService } from './category-tag-of-aggregator-api.service';
import { ErrorResponse } from '@core/models/error-response.model';
import { LanguageAggregatorService } from '../../LanguageOfAggregator/services/language-aggregator.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryTagOfAggregatorStateService implements OnDestroy {
  private api = inject(CategoryTagOfAggregatorApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private modalService = inject(ModalService);
  private langService = inject(LanguageAggregatorService);
  private destroy$ = new Subject<void>();

  private state = signal<CategoryTagOfAggregatorState>(initialCategoryTagOfAggregatorState);

  // Selectors
  items = computed(() => this.state().items);
  total = computed(() => this.state().total);
  loading = computed(() => this.state().loading);
  modalLoading = computed(() => this.state().modalLoading);
  pageNumber = computed(() => this.state().pageNumber);
  pageSize = computed(() => this.state().pageSize);
  searchTerm = computed(() => this.state().searchTerm);
  selectedLanguageId = computed(() => this.state().languageId);
  showDeleted = computed(() => this.state().showDeleted);
  error = computed(() => this.state().error);
  selectedId = computed(() => this.state().selectedId);
  languages = computed(() => this.langService.availableLanguages());

  updateState(partial: Partial<CategoryTagOfAggregatorState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }

  loadItems(checkEmpty = false): void {
    // Инициализация списка языков, если они еще не загружены
    if (this.langService.availableLanguages().length === 0) {
      this.langService.loadAvailable();
    }

    const s = this.state();
    const request = {
      pageNumber: s.pageNumber,
      pageSize: s.pageSize,
      searchTerm: s.searchTerm,
      languageId: s.languageId,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      showDeleted: s.showDeleted,
    };

    this.executeWithLoading(this.api.getPaged(request)).subscribe({
      next: (response) => {
        this.updateState({
          items: response.items,
          total: response.total,
          error: null,
        });

        if (checkEmpty && response.total === 0 && !s.showDeleted) {
          this.showEmptyWarning();
        }
      },
      error: (err) => this.handleError(err, 'LoadItems'),
    });
  }

  setSearch(term: string): void {
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageId(id: number | null): void {
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  setShowDeleted(show: boolean): void {
    this.updateState({ showDeleted: show, pageNumber: 1 });
    this.loadItems();
  }

  setPageSize(size: number): void {
    this.updateState({ pageSize: size, pageNumber: 1 });
    this.loadItems();
  }

  setPageIndex(index: number): void {
    this.updateState({ pageNumber: index });
    this.loadItems();
  }

  setSort(sortBy: string, direction: string | null): void {
    const sortDirection = direction === 'ascend' ? 0 : 1;
    this.updateState({ sortBy, sortDirection, pageNumber: 1 });
    this.loadItems();
  }

  resetFilters(): void {
    this.updateState({
      searchTerm: '',
      languageId: null,
      pageNumber: 1,
      showDeleted: false,
    });
    this.loadItems();
  }

  openAddModal(callback?: () => void): void {
    if (this.langService.availableLanguages().length === 0) {
      this.message.warning(
        'Для создания категории необходимо наличие хотя бы одного активного языка в агрегаторе.',
      );
      return;
    }
    this.updateState({ selectedId: null });
    if (callback) callback();
  }

  openView(id: number): void {
    // Здесь можно открыть модалку просмотра или отдельную страницу
    this.updateState({ selectedId: id });
  }

  loadById(id: number): Observable<CategoryTagOfAggregatorDetail> {
    return this.api.getById(id);
  }

  save(dto: any): Observable<CategoryTagOfAggregatorDetail> {
    this.applyEnglishFallbacks(dto);
    const operation = dto.id ? this.api.update(dto) : this.api.create(dto);
    return this.executeWithLoading(operation, true).pipe(tap(() => this.loadItems()));
  }

  /**
   * Автоматически заполняет пустые поля локализаций данными из английской версии (en-US)
   * или из технического Slug, если английская версия тоже пуста.
   */
  private applyEnglishFallbacks(dto: any): void {
    if (!dto.localizations || dto.localizations.length === 0) return;

    // 1. Находим английский язык через сервис
    const enLang = this.langService.availableLanguages().find((l) => l.code === 'en-US');
    const enId = enLang?.id;

    // 2. Ищем английскую локализацию как основной источник
    const enLoc = enId
      ? dto.localizations.find((l: any) => l.languageOfAggregatorId === enId)
      : null;
    const masterName = enLoc?.name || dto.slug;

    // 3. Синхронизируем пустые поля
    dto.localizations.forEach((loc: any) => {
      const isEn = enId && loc.languageOfAggregatorId === enId;

      // Название
      if (!loc.name?.trim()) {
        loc.name = masterName;
      }

      // Остальные поля для не-английских локализаций
      if (!isEn && enLoc) {
        if (!loc.description?.trim() && enLoc.description) loc.description = enLoc.description;

        // SEO данные
        if (enLoc.seoData) {
          if (!loc.seoData) {
            const { id, ...seoRest } = enLoc.seoData;
            loc.seoData = {
              ...seoRest,
              noIndex: enLoc.seoData.noIndex,
              noFollow: enLoc.seoData.noFollow,
            } as any;
          } else {
            if (!loc.seoData.metaTitle?.trim()) loc.seoData.metaTitle = enLoc.seoData.metaTitle;
            if (!loc.seoData.metaDescription?.trim())
              loc.seoData.metaDescription = enLoc.seoData.metaDescription;
            if (!loc.seoData.metaKeywords?.trim())
              loc.seoData.metaKeywords = enLoc.seoData.metaKeywords;
          }
        }
      }
    });
  }

  delete(id: number, soft = true): void {
    const operation = soft ? this.api.delete(id) : this.api.hardDelete(id);
    this.executeWithLoading(operation).subscribe({
      next: () => {
        this.message.success(soft ? 'Запись перемещена в корзину' : 'Запись окончательно удалена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, soft ? 'Delete' : 'HardDelete'),
    });
  }

  hardDelete(id: number): void {
    this.delete(id, false);
  }

  restore(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Категория успешно восстановлена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Restore'),
    });
  }

  seedFromJson(): void {
    const s = this.state();
    if (s.total > 0 && !s.showDeleted) {
      this.message.warning('В БД уже есть записи. Для нового переноса очистите базу данных.');
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
      },
    });
  }

  clearDatabase(): void {
    const msgId = this.message.loading('Очистка базы данных...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.clearDatabase()).subscribe({
      next: (res) => {
        this.message.remove(msgId);
        this.message.success('База данных очищена');
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Clear');
      },
    });
  }

  private showEmptyWarning(): void {
    this.modalService.alert({
      title: 'База данных пуста!',
      message:
        "В базе данных 'DbNames' (таблица 'category_tags_of_aggregator') нет категорий. Вы можете инициализировать данные из JSON.",
      alertType: 'info',
      centered: true,
      icon: 'system/av_info',
    });
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.message.error(errorResponse.getUserMessage());
    this.updateState({ error: errorResponse });
  }

  private executeWithLoading<T>(obs: Observable<T>, isModal = false): Observable<T> {
    const key = isModal ? 'modalLoading' : 'loading';
    this.updateState({ [key]: true, error: null } as any);
    return obs.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ [key]: false } as any)),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
