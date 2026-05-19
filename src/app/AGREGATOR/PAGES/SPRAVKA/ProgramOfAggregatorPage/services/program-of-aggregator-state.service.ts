import { Injectable, OnDestroy, inject } from '@angular/core';
import { ErrorResponse } from '@core/models/error-response.model';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { distinctUntilChanged, finalize, map, take, takeUntil } from 'rxjs/operators';
import { CategoryOfAggregatorItem } from '../../CategoryOfAggregatorPage/models/category-of-aggregator.model';
import { CategoryOfAggregatorApiService } from '../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { DeveloperOfAggregatorItem } from '../../DeveloperOfAggregatorPage/models/developer-of-aggregator.model';
import { DeveloperOfAggregatorApiService } from '../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { LanguageAggregator } from '../../LanguageOfAggregator/models/language-aggregator.model';
import { LanguageAggregatorApiService } from '../../LanguageOfAggregator/services/language-aggregator-api.service';
import { PlatformOfAggregatorItemDto } from '../../PlatformOfAggregatorPage/models/platform-of-aggregator.model';
import { PlatformOfAggregatorApiService } from '../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorApiService } from '../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';
import {
  CategoryTreeNode,
  INITIAL_PROGRAM_STATE,
  ProgramOfAggregatorCreate,
  ProgramOfAggregatorState,
  ProgramOfAggregatorUpdate,
} from '../models/program-of-aggregator.model';
import { ProgramOfAggregatorApiService } from './program-of-aggregator-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramOfAggregatorStateService implements OnDestroy {
  private api = inject(ProgramOfAggregatorApiService);
  private langApi = inject(LanguageAggregatorApiService);
  private catApi = inject(CategoryOfAggregatorApiService);
  private devApi = inject(DeveloperOfAggregatorApiService);
  private platApi = inject(PlatformOfAggregatorApiService);
  private tagApi = inject(TagOfAggregatorApiService);
  private message = inject(NzMessageService);
  private modalService = inject(ModalService);

  private destroy$ = new Subject<void>();
  private stateSubject$ = new BehaviorSubject<ProgramOfAggregatorState>(INITIAL_PROGRAM_STATE);
  readonly state$ = this.stateSubject$.asObservable();

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
  readonly pageLoading$ = this.state$.pipe(
    map((s) => s.pageLoading),
    distinctUntilChanged(),
  );
  readonly editingItem$ = this.state$.pipe(
    map((s) => s.editingItem),
    distinctUntilChanged(),
  );
  readonly viewItem$ = this.state$.pipe(
    map((s) => s.viewItem),
    distinctUntilChanged(),
  );
  readonly viewModalVisible$ = this.state$.pipe(
    map((s) => s.viewModalVisible),
    distinctUntilChanged(),
  );
  readonly viewModalMaximized$ = this.state$.pipe(
    map((s) => s.viewModalMaximized),
    distinctUntilChanged(),
  );
  readonly prerequisites$ = this.state$.pipe(
    map((s) => s.prerequisites),
    distinctUntilChanged(),
  );
  readonly languages$ = this.state$.pipe(
    map((s) => s.languages),
    distinctUntilChanged(),
  );
  readonly categories$ = this.state$.pipe(
    map((s) => s.categories),
    distinctUntilChanged(),
  );
  readonly developers$ = this.state$.pipe(
    map((s) => s.developers),
    distinctUntilChanged(),
  );
  readonly platforms$ = this.state$.pipe(
    map((s) => s.platforms),
    distinctUntilChanged(),
  );
  readonly selectedLanguageId$ = this.state$.pipe(
    map((s) => s.languageId),
    distinctUntilChanged(),
  );
  readonly selectedCategoryId$ = this.state$.pipe(
    map((s) => s.categoryId),
    distinctUntilChanged(),
  );
  readonly selectedDeveloperId$ = this.state$.pipe(
    map((s) => s.developerId),
    distinctUntilChanged(),
  );

  public updateState(partial: Partial<ProgramOfAggregatorState>): void {
    this.stateSubject$.next({ ...this.stateSubject$.value, ...partial });
  }

  checkPrerequisites(): void {
    forkJoin({
      langs: this.langApi.getAll().pipe(take(1)),
      // Загружаем по 1 элементу для подсчета в пререквизитах
      catsCount: this.catApi
        .getPaged({
          pageNumber: 1,
          pageSize: 1,
          sortBy: 'Id',
          sortDirection: 1,
          showDeleted: false,
        })
        .pipe(take(1)),
      devsCount: this.devApi
        .getPaged({
          pageNumber: 1,
          pageSize: 1,
          sortBy: 'Id',
          sortDirection: 1,
          showDeleted: false,
        })
        .pipe(take(1)),
      plats: this.platApi
        .getPaged({
          pageNumber: 1,
          pageSize: 1,
          sortBy: 'Id',
          sortDirection: 1,
          showDeleted: false,
        })
        .pipe(take(1)),
      tags: this.tagApi.getPaged({ pageNumber: 1, pageSize: 1 }).pipe(take(1)),

      // Загружаем полные списки для фильтров (категории - дерево, разработчики - список, платформы - список)
      allCats: this.catApi.getTree().pipe(take(1)),
      allDevs: this.devApi
        .getPaged({
          pageNumber: 1,
          pageSize: 100,
          sortBy: 'Name',
          sortDirection: 0,
          showDeleted: false,
        })
        .pipe(take(1)),
      allPlats: this.platApi
        .getPaged({
          pageNumber: 1,
          pageSize: 100,
          sortBy: 'Name',
          sortDirection: 0,
          showDeleted: false,
        })
        .pipe(take(1)),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: {
          langs: LanguageAggregator[];
          catsCount: { total: number };
          devsCount: { total: number };
          plats: { total: number };
          tags: { total: number };
          allCats: CategoryOfAggregatorItem[];
          allDevs: { items: DeveloperOfAggregatorItem[] };
          allPlats: { items: PlatformOfAggregatorItemDto[] };
        }) => {
          const prereq = {
            languagesCount: res.langs.length,
            categoriesCount: res.catsCount.total,
            developersCount: res.devsCount.total,
            platformsCount: res.plats.total,
            tagsCount: res.tags.total,
            isValid: res.langs.length > 0 && res.catsCount.total > 0 && res.devsCount.total > 0,
          };
          this.updateState({
            prerequisites: prereq,
            languages: res.langs,
            categories: this.mapCategoriesToTreeNodes(res.allCats),
            developers: res.allDevs.items,
            platforms: res.allPlats.items,
          });
        },
        error: (err) => console.error('Prerequisites check failed', err),
      });
  }

  private mapCategoriesToTreeNodes(items: CategoryOfAggregatorItem[]): CategoryTreeNode[] {
    return items
      .map((item) => ({
        title: item.localizedName || item.canonicalName,
        key: item.id.toString(),
        isLeaf: !item.children || item.children.length === 0,
        children: item.children ? this.mapCategoriesToTreeNodes(item.children) : [],
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  loadItems(checkEmpty = false): void {
    const s = this.stateSubject$.value;
    this.updateState({ loading: true, error: null });
    this.api
      .getPaged({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        languageId: s.languageId,
        categoryId: s.categoryId,
        platformId: s.platformId,
        developerId: s.developerId,
        status: s.status,
        showDeleted: s.showDeleted,
        sortBy: s.sortBy,
        sortDirection: s.sortDirection,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => {
          this.updateState({ items: res.items, total: res.total });
          if (checkEmpty && res.total === 0) {
            this.showEmptyAlert();
          }
        },
        error: (err) => this.handleError(err, 'LoadItems'),
      });
  }

  private showEmptyAlert(): void {
    this.modalService.alert({
      title: 'База данных пуста!',
      message:
        "В базе данных 'DbNames' (таблица 'programs_of_aggregator') нет программ для отображения.",
      alertType: 'info',
      centered: true,
      icon: 'system/av_info',
    });
  }

  setLanguageId(id: number | null): void {
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  setCategoryId(id: number | null): void {
    this.updateState({ categoryId: id, pageNumber: 1 });
    this.loadItems();
  }

  setDeveloperId(id: number | null): void {
    this.updateState({ developerId: id, pageNumber: 1 });
    this.loadItems();
  }

  openView(id: number): void {
    this.updateState({ pageLoading: true, error: null });
    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      )
      .subscribe({
        next: (item) => {
          if (item && item.localizations) {
            item.localizations.sort((a, b) => {
              if (a.languageOfAggregatorId === 1) return -1;
              if (b.languageOfAggregatorId === 1) return 1;
              if (a.languageOfAggregatorId === 2) return -1;
              if (b.languageOfAggregatorId === 2) return 1;
              return 0;
            });
          }
          this.updateState({ viewItem: item, viewModalVisible: true });
        },
        error: (err) => this.handleError(err, 'OpenView'),
      });
  }

  closeViewModal(): void {
    this.updateState({ viewModalVisible: false, viewItem: null, viewModalMaximized: false });
  }

  toggleViewModalMaximize(): void {
    this.updateState({ viewModalMaximized: !this.stateSubject$.value.viewModalMaximized });
  }

  loadById(id: number): void {
    this.updateState({ pageLoading: true, error: null });
    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      )
      .subscribe({
        next: (item) => {
          if (item && item.localizations) {
            item.localizations.sort((a, b) => {
              if (a.languageOfAggregatorId === 1) return -1;
              if (b.languageOfAggregatorId === 1) return 1;
              if (a.languageOfAggregatorId === 2) return -1;
              if (b.languageOfAggregatorId === 2) return 1;
              return 0;
            });
          }
          this.updateState({ editingItem: item });
        },
        error: (err) => this.handleError(err, 'LoadById'),
      });
  }

  save(data: ProgramOfAggregatorCreate | ProgramOfAggregatorUpdate): Observable<number> {
    const isUpdate = 'id' in data && !!data.id;
    this.updateState({ pageLoading: true });

    if (isUpdate) {
      const updateData = data as ProgramOfAggregatorUpdate;
      return this.api.update(updateData.id, updateData).pipe(
        map(() => updateData.id),
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      );
    } else {
      return this.api.create(data as ProgramOfAggregatorCreate).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      );
    }
  }

  delete(id: number): void {
    this.executeWithLoading(this.api.delete(id, false)).subscribe({
      next: () => {
        this.message.success('Программа перемещена в корзину');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'Delete'),
    });
  }

  hardDelete(id: number): void {
    this.executeWithLoading(this.api.delete(id, true)).subscribe({
      next: () => {
        this.message.success('Программа полностью удалена из базы');
        this.loadItems();
      },
      error: (err) => this.handleError(err, 'HardDelete'),
    });
  }

  restore(id: number): void {
    this.updateState({ loading: true });
    this.api
      .restore(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: () => {
          this.message.success('Программа восстановлена');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Restore'),
      });
  }

  seedFromJson(): void {
    const s = this.stateSubject$.value;
    if (s.total > 0 && !s.showDeleted) {
      this.message.warning('В БД уже есть записи. Для нового переноса очистите базу данных.');
      return;
    }

    const msgId = this.message.loading('Импорт данных из JSON...', { nzDuration: 0 }).messageId;
    this.updateState({ loading: true });
    this.api
      .seedFromJson()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => {
          this.message.remove(msgId);
          this.message.success(`Импорт завершен. Добавлено объектов: ${res.count}`);
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
    this.updateState({ loading: true });
    this.api
      .clearDatabase()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: () => {
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

  syncIcons(): void {
    const msgId = this.message.loading('Синхронизация иконок...', { nzDuration: 0 }).messageId;
    this.updateState({ loading: true });
    this.api
      .syncIcons()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => {
          this.message.remove(msgId);
          this.message.success(`Синхронизация завершена. Обновлено: ${res.count}`);
          this.loadItems();
        },
        error: (err) => {
          this.message.remove(msgId);
          this.handleError(err, 'SyncIcons');
        },
      });
  }

  syncScreenshots(): void {
    const msgId = this.message.loading('Синхронизация скриншотов...', { nzDuration: 0 }).messageId;
    this.updateState({ loading: true });
    this.api
      .syncScreenshots()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => {
          this.message.remove(msgId);
          this.message.success(`Синхронизация завершена. Изменено записей: ${res.count}`);
          this.loadItems();
        },
        error: (err) => {
          this.message.remove(msgId);
          this.handleError(err, 'SyncScreenshots');
        },
      });
  }

  private handleError(err: unknown, context: string): void {
    const errorResponse = ErrorResponse.fromError(
      err,
      `ProgramOfAggregatorStateService/${context}`,
    );
    this.updateState({ error: errorResponse });
    this.message.error(errorResponse.getUserMessage());
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
