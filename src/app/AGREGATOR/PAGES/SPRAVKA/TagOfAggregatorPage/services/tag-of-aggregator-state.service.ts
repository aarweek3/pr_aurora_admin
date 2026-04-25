import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { Observable, Subject, finalize, takeUntil, tap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { 
  TagOfAggregatorState, 
  initialTagOfAggregatorState,
  TagOfAggregatorItem,
  TagOfAggregatorDetail
} from '../models/tag-of-aggregator.model';
import { TagOfAggregatorApiService } from './tag-of-aggregator-api.service';
import { CategoryTagOfAggregatorApiService } from '../../CategoryTagOfAggregatorPage/services/category-tag-of-aggregator-api.service';
import { ErrorResponse } from '../../../../../shared/infrastructure/interceptor/models/error-response.model';
import { LanguageAggregatorService } from '../../LanguageOfAggregator/services/language-aggregator.service';

@Injectable({
  providedIn: 'root'
})
export class TagOfAggregatorStateService implements OnDestroy {
  private api = inject(TagOfAggregatorApiService);
  private categoryApi = inject(CategoryTagOfAggregatorApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private modalService = inject(ModalService);
  private langService = inject(LanguageAggregatorService);
  private destroy$ = new Subject<void>();

  private state = signal<TagOfAggregatorState>(initialTagOfAggregatorState);

  // Selectors
  items = computed(() => this.state().items);
  total = computed(() => this.state().total);
  loading = computed(() => this.state().loading);
  modalLoading = computed(() => this.state().modalLoading);
  sortBy = computed(() => this.state().sortBy);
  sortDirection = computed(() => this.state().sortDirection);
  searchTerm = computed(() => this.state().searchTerm);
  categoryTagId = computed(() => this.state().categoryTagId);
  showDeleted = computed(() => this.state().showDeleted);
  error = computed(() => this.state().error);
  languages = computed(() => this.langService.availableLanguages());
  categories = computed(() => this.state().categories);
  languageId = computed(() => this.state().languageId);
  selectedLanguageId = computed(() => this.state().languageId);
  viewItem = computed(() => this.state().viewItem);
  viewModalVisible = computed(() => this.state().viewModalVisible);
  editModalVisible = computed(() => this.state().editModalVisible);
  selectedId = computed(() => this.state().selectedId);
  pageNumber = computed(() => this.state().pageNumber);
  pageSize = computed(() => this.state().pageSize);

  updateState(partial: Partial<TagOfAggregatorState>): void {
    this.state.update(s => ({ ...s, ...partial }));
  }

  loadItems(checkEmpty = false): void {
    if (this.state().categories.length === 0) {
      this.loadCategories();
    }
    const s = this.state();
    const request = {
      pageNumber: s.pageNumber,
      pageSize: s.pageSize,
      searchTerm: s.searchTerm,
      categoryTagId: s.categoryTagId,
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

        if (checkEmpty && response.total === 0 && !s.showDeleted) {
          this.showEmptyWarning();
        }
      },
      error: (err) => this.handleError(err, 'LoadItems')
    });
  }

  loadById(id: number): Observable<TagOfAggregatorDetail> {
    return this.api.getById(id);
  }

  loadCategories(): void {
    this.categoryApi.getPaged({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res) => this.updateState({ categories: res.items }),
      error: (err) => this.handleError(err, 'LoadCategories')
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

  setCategoryFilter(id: number | null): void {
    if (this.state().categoryTagId === id) return;
    this.updateState({ categoryTagId: id ?? undefined, pageNumber: 1 });
    this.loadItems();
  }

  setSearch(term: string): void {
    if (this.state().searchTerm === term) return;
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageFilter(id: number | null): void {
    if (this.state().languageId === id) return;
    this.updateState({ languageId: id ?? undefined, pageNumber: 1 });
    this.loadItems();
  }

  setShowDeleted(show: boolean): void {
    if (this.state().showDeleted === show) return;
    this.updateState({ showDeleted: show, pageNumber: 1 });
    this.loadItems();
  }

  resetFilters(): void {
    this.updateState({ 
      categoryTagId: undefined, 
      languageId: undefined,
      searchTerm: '', 
      pageNumber: 1,
      showDeleted: false
    });
    this.loadItems();
  }

  save(dto: any): Observable<TagOfAggregatorDetail> {
    this.applyEnglishFallbacks(dto);

    const operation = dto.id ? this.api.update(dto) : this.api.create(dto);
    return this.executeWithLoading(operation, true).pipe(
      tap({
        next: () => {
          this.message.success(dto.id ? 'Тег обновлен' : 'Тег создан');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Save')
      })
    );
  }

  delete(id: number, hard = false): void {
    this.executeWithLoading(this.api.delete(id, hard)).subscribe({
      next: () => {
        this.message.success(hard ? 'Тег полностью удален' : 'Тег помещен в корзину');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Delete')
    });
  }

  hardDelete(id: number): void {
    this.delete(id, true);
  }

  restore(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Тег успешно восстановлен');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Restore')
    });
  }

  openView(id: number): void {
    this.executeWithLoading(this.api.getById(id)).subscribe({
      next: (item) => {
        if (!item.categoryName) {
          const cat = this.state().categories.find(c => c.id === item.categoryTagId);
          item.categoryName = cat?.localizedName || cat?.name;
        }
        this.updateState({ viewItem: item, viewModalVisible: true });
      },
      error: (err) => this.handleError(err, 'OpenView')
    });
  }

  closeViewModal(): void {
    this.updateState({ viewModalVisible: false, viewItem: null });
  }

  openEditModal(id: number | null = null): void {
    if (id) {
      this.executeWithLoading(this.api.getById(id)).subscribe({
        next: (item) => {
          this.updateState({ selectedId: id, editModalVisible: true });
        },
        error: (err) => this.handleError(err, 'OpenEditModal')
      });
    } else {
      this.updateState({ selectedId: null, editModalVisible: true });
    }
  }

  closeEditModal(): void {
    this.updateState({ editModalVisible: false, selectedId: null });
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
      }
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
        this.handleError(err, 'Clear')
      }
    });
  }

  private showEmptyWarning(): void {
    this.modalService.alert({
      title: 'База данных пуста!',
      message: 'В базе данных \'DbNames\' (таблица \'tags_of_aggregator\') нет тегов. Вы можете инициализировать данные из JSON.',
      alertType: 'info',
      centered: true,
      icon: 'system/av_info'
    });
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.message.error(errorResponse.getUserMessage());
    this.updateState({ error: errorResponse });
  }

  private applyEnglishFallbacks(dto: any): void {
    if (!dto.localizations || dto.localizations.length === 0) return;
    
    // Using availableLanguages() signal from LanguageAggregatorService
    const enLang = this.langService.availableLanguages().find(l => l.code === 'en-US');
    const enId = enLang?.id;
    const enLoc = enId ? dto.localizations.find((l: any) => l.languageOfAggregatorId === enId) : null;
    
    dto.localizations.forEach((loc: any) => {
      const isEn = enId && loc.languageOfAggregatorId === enId;
      if (!loc.name?.trim()) {
        loc.name = isEn ? dto.slug : (enLoc?.name || dto.slug);
      }
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
