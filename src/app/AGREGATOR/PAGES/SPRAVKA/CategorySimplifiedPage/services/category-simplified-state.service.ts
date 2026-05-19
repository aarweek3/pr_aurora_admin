import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { ErrorResponse } from '@core/models/error-response.model';
import { LanguageService } from '@language-app/services/language.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Subject, finalize, takeUntil, tap } from 'rxjs';
import {
  CategoryDetailDto,
  CategoryIconDto,
  CategorySimplifiedState,
  SubcategoryDetailDto,
  initialCategorySimplifiedState,
} from '../models/category-simplified.model';
import { CategorySimplifiedApiService } from './category-simplified-api.service';

@Injectable({
  providedIn: 'root',
})
export class CategorySimplifiedStateService implements OnDestroy {
  private api = inject(CategorySimplifiedApiService);
  private message = inject(NzMessageService);
  private langService = inject(LanguageService);
  private destroy$ = new Subject<void>();
  public refreshSubcategories$ = new Subject<number>();

  private state = signal<CategorySimplifiedState>(initialCategorySimplifiedState);

  // Selectors
  items = computed(() => this.state().items);
  total = computed(() => this.state().total);
  loading = computed(() => this.state().loading);
  pageNumber = computed(() => this.state().pageNumber);
  pageSize = computed(() => this.state().pageSize);
  searchTerm = computed(() => this.state().searchTerm);
  showDeleted = computed(() => this.state().showDeleted);
  selectedLanguageId = computed(() => this.state().languageId);

  // Modal & Selection state
  selectedCategoryId = computed(() => this.state().selectedCategoryId);
  selectedSubcategoryId = computed(() => this.state().selectedSubcategoryId);
  isReadOnly = computed(() => this.state().isReadOnly);
  viewModalVisible = computed(() => this.state().viewModalVisible);

  languages = computed(() => this.langService.availableLanguages());
  error = computed(() => this.state().error);
  customIcons = computed(() => this.state().customIcons);
  iconsMap = computed(() => {
    const map = new Map<string, string>();
    this.state().customIcons.forEach((icon) => map.set(icon.name, icon.svgCodIcon));
    return map;
  });

  updateState(partial: Partial<CategorySimplifiedState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }

  loadItems(): void {
    const s = this.state();
    const request = {
      pageNumber: s.pageNumber,
      pageSize: s.pageSize,
      searchTerm: s.searchTerm,
      languageId: s.languageId,
      showDeleted: s.showDeleted,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
    };

    if (this.state().customIcons.length === 0) {
      this.loadIcons();
    }

    this.executeWithLoading(this.api.getPaged(request)).subscribe({
      next: (response) => {
        this.updateState({
          items: response.items,
          total: response.total,
          error: null,
        });
      },
      error: (err) => this.handleError(err, 'LoadItems'),
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

  loadIcons(): void {
    this.api.getIcons().subscribe({
      next: (icons) => this.updateState({ customIcons: icons }),
      error: (err) => console.error('[CategoryState] Failed to load custom icons:', err),
    });
  }

  addIcon(icon: CategoryIconDto): void {
    const current = this.state().customIcons;
    if (current.find((i) => i.name === icon.name)) {
      this.message.error('Иконка с таким именем уже существует');
      return;
    }
    const updated = [...current, icon];
    this.api.saveIcons(updated).subscribe(() => {
      this.message.success('Иконка добавлена');
      this.updateState({ customIcons: updated });
    });
  }

  deleteIcon(name: string): void {
    const updated = this.state().customIcons.filter((i) => i.name !== name);
    this.api.saveIcons(updated).subscribe(() => {
      this.message.success('Иконка удалена');
      this.updateState({ customIcons: updated });
    });
  }

  // Modal control methods
  openAddCategory(): void {
    this.updateState({ selectedCategoryId: null, isReadOnly: false, error: null });
  }

  openEditCategory(id: number): void {
    this.updateState({ selectedCategoryId: id, isReadOnly: false, error: null });
  }

  openViewCategory(id: number): void {
    this.updateState({ selectedCategoryId: id, isReadOnly: true, error: null });
  }

  openAddSubcategory(): void {
    this.updateState({ selectedSubcategoryId: null, isReadOnly: false, error: null });
  }

  openEditSubcategory(id: number): void {
    this.updateState({ selectedSubcategoryId: id, isReadOnly: false, error: null });
  }

  openViewSubcategory(id: number): void {
    this.updateState({ selectedSubcategoryId: id, isReadOnly: true, error: null });
  }

  // Saving logic
  saveCategory(dto: any): Observable<CategoryDetailDto> {
    console.log('[CategoryState] Saving Category. DTO before fallbacks:', dto);
    this.applyEnglishFallbacks(dto);
    console.log('[CategoryState] DTO after fallbacks:', dto);

    const operation = dto.id ? this.api.update(dto) : this.api.create(dto);

    return this.executeWithLoading(operation).pipe(
      tap({
        next: (res) => {
          console.log('[CategoryState] Save success:', res);
          this.message.success(dto.id ? 'Категория обновлена' : 'Категория создана');
          this.loadItems();
        },
        error: (err) => {
          console.error('[CategoryState] Save error:', err);
          this.handleError(err, 'SaveCategory');
        },
      }),
    );
  }

  saveSubcategory(dto: any): Observable<SubcategoryDetailDto> {
    this.applyEnglishFallbacks(dto);
    const operation = dto.id ? this.api.updateSubcategory(dto) : this.api.createSubcategory(dto);

    return this.executeWithLoading(operation).pipe(
      tap({
        next: (res) => {
          this.message.success(dto.id ? 'Подкатегория обновлена' : 'Подкатегория создана');
          this.loadItems();
          if (res.categoryId) {
            this.refreshSubcategories$.next(res.categoryId);
          }
        },
        error: (err) => this.handleError(err, 'SaveSubcategory'),
      }),
    );
  }

  // Maintenance methods
  seedFromJson(): void {
    this.executeWithLoading(this.api.seedFromJson()).subscribe({
      next: (res) => {
        this.message.success(res.message || 'Данные успешно загружены');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'SeedFromJson'),
    });
  }

  clearDatabase(): void {
    this.executeWithLoading(this.api.clearDatabase()).subscribe({
      next: (res) => {
        this.message.success(res.message || 'База данных очищена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'ClearDatabase'),
    });
  }

  // Deletion logic
  deleteCategory(id: number, isHard = false): void {
    this.executeWithLoading(this.api.delete(id, isHard)).subscribe({
      next: () => {
        this.message.success(
          isHard ? 'Категория удалена полностью' : 'Категория перемещена в корзину',
        );
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'DeleteCategory'),
    });
  }

  deleteSubcategory(id: number, isHard = false): void {
    this.executeWithLoading(this.api.deleteSubcategory(id, isHard)).subscribe({
      next: (res) => {
        this.message.success(
          isHard ? 'Подкатегория удалена полностью' : 'Подкатегория перемещена в корзину',
        );
        this.loadItems();
        // Мы не знаем categoryId здесь напрямую, но мы можем сигнализировать об обновлении всех открытых списков
        // или дождаться пока API вернет ID. В данном API скорее всего ID не возвращается.
        // Передадим 0 как сигнал "обновить всё" или просто подождем.
        this.refreshSubcategories$.next(0); 
      },
      error: (err) => this.handleError(err, 'DeleteSubcategory'),
    });
  }

  restoreCategory(id: number): void {
    this.executeWithLoading(this.api.restore(id)).subscribe({
      next: () => {
        this.message.success('Категория успешно восстановлена');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'RestoreCategory'),
    });
  }

  restoreSubcategory(id: number): void {
    this.executeWithLoading(this.api.restoreSubcategory(id)).subscribe({
      next: () => {
        this.message.success('Подкатегория успешно восстановлена');
        this.loadItems();
        this.refreshSubcategories$.next(0);
      },
      error: (err) => this.handleError(err, 'RestoreSubcategory'),
    });
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.message.error(errorResponse.getUserMessage());
    this.updateState({ error: errorResponse } as any);
  }

  private applyEnglishFallbacks(dto: any): void {
    if (!dto.localizations || dto.localizations.length === 0) return;

    const enLang = this.langService.availableLanguages().find((l) => l.code === 'en-US');
    const enId = enLang?.id;
    const enLoc = enId
      ? dto.localizations.find(
          (l: any) => l.languageId === enId || l.languageOfAggregatorId === enId,
        )
      : null;

    dto.localizations.forEach((loc: any) => {
      const currentLangId = loc.languageId || loc.languageOfAggregatorId;
      const isEn = enId && currentLangId === enId;
      if (!loc.name?.trim()) {
        loc.name = isEn
          ? dto.canonicalName || dto.slug
          : enLoc?.name || dto.canonicalName || dto.slug;
      }
    });
  }

  private executeWithLoading<T>(obs: Observable<T>): Observable<T> {
    this.updateState({ loading: true, error: null });
    return obs.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ loading: false })),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
