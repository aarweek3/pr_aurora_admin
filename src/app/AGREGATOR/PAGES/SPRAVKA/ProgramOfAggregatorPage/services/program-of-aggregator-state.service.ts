import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { distinctUntilChanged, finalize, map, takeUntil, take } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { 
  ProgramOfAggregatorState, 
  INITIAL_PROGRAM_STATE, 
  ProgramOfAggregatorDetail,
  ProgramOfAggregatorCreate,
  ProgramOfAggregatorUpdate
} from '../models/program-of-aggregator.model';
import { ProgramOfAggregatorApiService } from './program-of-aggregator-api.service';
import { LanguageAggregatorApiService } from '../../LanguageOfAggregator/services/language-aggregator-api.service';
import { CategoryOfAggregatorApiService } from '../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { DeveloperOfAggregatorApiService } from '../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorApiService } from '../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorApiService } from '../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramOfAggregatorStateService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private stateSubject$ = new BehaviorSubject<ProgramOfAggregatorState>(INITIAL_PROGRAM_STATE);
  readonly state$ = this.stateSubject$.asObservable();

  readonly items$ = this.state$.pipe(map((s) => s.items), distinctUntilChanged());
  readonly total$ = this.state$.pipe(map((s) => s.total), distinctUntilChanged());
  readonly loading$ = this.state$.pipe(map((s) => s.loading), distinctUntilChanged());
  readonly pageLoading$ = this.state$.pipe(map((s) => s.pageLoading), distinctUntilChanged());
  readonly editingItem$ = this.state$.pipe(map((s) => s.editingItem), distinctUntilChanged());
  readonly viewItem$ = this.state$.pipe(map((s) => s.viewItem), distinctUntilChanged());
  readonly prerequisites$ = this.state$.pipe(map((s) => s.prerequisites), distinctUntilChanged());
  readonly languages$ = this.state$.pipe(map((s) => s.languages), distinctUntilChanged());
  readonly selectedLanguageId$ = this.state$.pipe(map((s) => s.languageId), distinctUntilChanged());

  constructor(
    private api: ProgramOfAggregatorApiService,
    private langApi: LanguageAggregatorApiService,
    private catApi: CategoryOfAggregatorApiService,
    private devApi: DeveloperOfAggregatorApiService,
    private platApi: PlatformOfAggregatorApiService,
    private tagApi: TagOfAggregatorApiService,
    private message: NzMessageService
  ) {}

  public updateState(partial: Partial<ProgramOfAggregatorState>): void {
    this.stateSubject$.next({ ...this.stateSubject$.value, ...partial });
  }

  checkPrerequisites(): void {
    forkJoin({
      langs: this.langApi.getAll().pipe(take(1)),
      cats: this.catApi.getPaged({ pageNumber: 1, pageSize: 1, sortBy: 'Id', sortDirection: 1, showDeleted: false }).pipe(take(1)),
      devs: this.devApi.getPaged({ pageNumber: 1, pageSize: 1, sortBy: 'Id', sortDirection: 1, showDeleted: false }).pipe(take(1)),
      plats: this.platApi.getPaged({ pageNumber: 1, pageSize: 1, sortBy: 'Id', sortDirection: 1, showDeleted: false }).pipe(take(1)),
      tags: this.tagApi.getPaged({ pageNumber: 1, pageSize: 1 }).pipe(take(1))
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        const prereq = {
          languagesCount: res.langs.length,
          categoriesCount: res.cats.total,
          developersCount: res.devs.total,
          platformsCount: res.plats.total,
          tagsCount: res.tags.total,
          isValid: res.langs.length > 0 && res.cats.total > 0 && res.devs.total > 0
        };
        this.updateState({ 
          prerequisites: prereq,
          languages: res.langs
        });
      },
      error: (err) => console.error('Prerequisites check failed', err)
    });
  }

  loadItems(): void {
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
        sortDirection: s.sortDirection
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false }))
      )
      .subscribe({
        next: (res) => this.updateState({ items: res.items, total: res.total }),
        error: (err) => this.handleError(err, 'LoadItems')
      });
  }

  setLanguageId(id: number | null): void {
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  loadById(id: number): void {
    this.updateState({ pageLoading: true, error: null });
    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false }))
      )
      .subscribe({
        next: (item) => this.updateState({ editingItem: item }),
        error: (err) => this.handleError(err, 'LoadById')
      });
  }

  save(data: any): Observable<any> {
    const isUpdate = !!data.id;
    const request: Observable<any> = isUpdate
      ? this.api.update(data.id, data as ProgramOfAggregatorUpdate)
      : this.api.create(data as ProgramOfAggregatorCreate);

    this.updateState({ pageLoading: true });
    return request.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ pageLoading: false }))
    );
  }

  delete(id: number, hardDelete: boolean = false): void {
    this.updateState({ deletingId: id });
    this.api
      .delete(id, hardDelete)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ deletingId: null }))
      )
      .subscribe({
        next: () => {
          this.message.success(hardDelete ? 'Программа окончательно удалена' : 'Программа перемещена в корзину');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Delete')
      });
  }

  restore(id: number): void {
    this.updateState({ loading: true });
    this.api
      .restore(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false }))
      )
      .subscribe({
        next: () => {
          this.message.success('Программа восстановлена');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Restore')
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
    this.api.seedFromJson().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ loading: false }))
    ).subscribe({
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
    this.updateState({ loading: true });
    this.api.clearDatabase().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ loading: false }))
    ).subscribe({
      next: () => {
        this.message.remove(msgId);
        this.message.success('База данных очищена');
        this.loadItems();
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Clear');
      }
    });
  }

  private handleError(err: any, context: string): void {
    this.updateState({ error: err });
    this.message.error(`Ошибка [${context}]: ${err.message || 'Произошла непредвиденная ошибка'}`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
