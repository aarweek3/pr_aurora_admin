import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { 
  CategoryOfAggregatorState, 
  initialCategoryOfAggregatorState,
  CategoryOfAggregatorItem,
  CategoryOfAggregatorDetail
} from '../models/category-of-aggregator.model';
import { CategoryOfAggregatorApiService } from './category-of-aggregator-api.service';
import { Observable, Subject, finalize, takeUntil, tap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { ErrorResponse } from '../../../../../shared/infrastructure/interceptor/models/error-response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryOfAggregatorStateService implements OnDestroy {
  private api = inject(CategoryOfAggregatorApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private modalService = inject(ModalService);
  private langService = inject(LanguageService);
  private destroy$ = new Subject<void>();

  private state = signal<CategoryOfAggregatorState>(initialCategoryOfAggregatorState);

  // Selectors
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
  selectedId = computed(() => this.state().selectedId);
  selectedLanguageId = computed(() => this.state().languageId);
  languages = computed(() => this.langService.availableLanguages());
  error = computed(() => this.state().error);
  viewModalVisible = computed(() => this.state().viewModalVisible);
  viewItem = computed(() => this.state().viewItem);
  itemMap = computed(() => {
    const map = new Map<number, CategoryOfAggregatorItem>();
    this.state().items.forEach(item => map.set(item.id, item));
    return map;
  });

  updateState(partial: Partial<CategoryOfAggregatorState>): void {
    this.state.update(s => ({ ...s, ...partial }));
  }

  loadItems(checkEmpty = false): void {
    const s = this.state();
    
    // Если есть поиск или мы в корзине - используем обычный пагинированный список
    if (s.searchTerm || s.showDeleted) {
      this.loadPagedItems(checkEmpty);
      return;
    }

    // В обычном режиме загружаем дерево для Tree Table
    this.executeWithLoading(this.api.getTree(s.languageId)).subscribe({
      next: (tree) => {
        const flattenedItems = this.flattenTree(tree);
        this.updateState({ 
          items: flattenedItems, 
          total: flattenedItems.length, // Для дерева тотал = общее кол-во узлов
          error: null
        });

        if (checkEmpty && flattenedItems.length === 0) {
          this.showEmptyAlert();
        }
      },
      error: (err) => this.handleError(err, 'LoadTree')
    });
  }

  private loadPagedItems(checkEmpty: boolean): void {
    const s = this.state();
    const request = {
      pageNumber: s.pageNumber,
      pageSize: s.pageSize,
      searchTerm: s.searchTerm,
      languageId: s.languageId,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      showDeleted: s.showDeleted,
      parentId: s.parentId
    };

    this.executeWithLoading(this.api.getPaged(request)).subscribe({
      next: (response) => {
        this.updateState({ 
          items: response.items, 
          total: response.total,
          error: null
        });

        if (checkEmpty && response.total === 0) {
          this.showEmptyAlert();
        }
      },
      error: (err) => this.handleError(err, 'LoadPaged')
    });
  }

  private flattenTree(items: CategoryOfAggregatorItem[], level = 0): CategoryOfAggregatorItem[] {
    const result: CategoryOfAggregatorItem[] = [];
    items.forEach(item => {
      item.level = level;
      item.expand = item.expand ?? false;
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...this.flattenTree(item.children, level + 1));
      }
    });
    return result;
  }

  private showEmptyAlert(): void {
    this.modalService.alert({
      title: 'База данных пуста!',
      message: 'В базе данных \'DbNames\' (таблица \'categories_of_aggregator\') нет категорий для отображения.',
      alertType: 'info',
      centered: true,
      icon: 'system/av_info'
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
    if (this.langService.availableLanguages().length === 0) {
      this.message.warning('Нет доступных языков!');
      return;
    }
    this.updateState({ selectedId: null, error: null });
    onModalOpen();
  }

  openEditModal(id: number, onModalOpen: () => void): void {
    this.updateState({ selectedId: id, error: null });
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

  save(dto: any): Observable<CategoryOfAggregatorDetail> {
    this.applyEnglishFallbacks(dto);
    const operation = dto.id ? this.api.update(dto) : this.api.create(dto);
    return this.executeWithLoading(operation, true).pipe(
      tap({
        next: () => {
          this.message.success(dto.id ? 'Категория обновлена' : 'Категория создана');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Save')
      })
    );
  }

  delete(id: number): void {
    this.executeWithLoading(this.api.delete(id, false)).subscribe({
      next: () => {
        this.message.success('Категория помечена как удаленная');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Delete')
    });
  }

  hardDelete(id: number): void {
    this.executeWithLoading(this.api.delete(id, true)).subscribe({
      next: () => {
        this.message.success('Категория полностью удалена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'HardDelete')
    });
  }

  restore(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Категория восстановлена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Restore')
    });
  }

  seedFromJson(): void {
    const msgId = this.message.loading('Импорт данных...', { nzDuration: 0 }).messageId;
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
    const msgId = this.message.loading('Очистка БД...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.clearDatabase()).subscribe({
      next: () => {
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

  private applyEnglishFallbacks(dto: any): void {
    if (!dto.localizations || dto.localizations.length === 0) return;
    const enLang = this.langService.availableLanguages().find(l => l.code === 'en-US');
    const enId = enLang?.id;
    const enLoc = enId ? dto.localizations.find((l: any) => l.languageOfAggregatorId === enId) : null;
    const masterName = dto.canonicalName;
    
    dto.localizations.forEach((loc: any) => {
      const isEn = enId && loc.languageOfAggregatorId === enId;
      if (!loc.name?.trim()) loc.name = isEn ? masterName : (enLoc?.name || masterName);
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
