import { Injectable, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, takeUntil } from 'rxjs/operators';
import { ErrorResponse } from '../../../shared/infrastructure/interceptor/models/error-response.model';
import {
  INITIAL_PLATFORM_STATE,
  PlatformCreateDto,
  PlatformDetailDto,
  PlatformState,
  PlatformUpdateDto,
} from '../models/platform.model';
import { PlatformApiService } from './platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class PlatformStateService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private state$ = new BehaviorSubject<PlatformState>(INITIAL_PLATFORM_STATE);

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
  readonly editingItem$ = this.state$.pipe(
    map((s) => s.editingItem),
    distinctUntilChanged(),
  );
  readonly viewItem$ = this.state$.pipe(
    map((s) => s.viewItem),
    distinctUntilChanged(),
  );
  readonly pageLoading$ = this.state$.pipe(
    map((s) => s.pageLoading),
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
    private api: PlatformApiService,
    private message: NzMessageService,
    private langService: LanguageService,
  ) {}

  public updateState(partial: Partial<PlatformState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  loadItems(): void {
    const s = this.state$.value;
    this.updateState({ loading: true, error: null });
    this.api
      .getPaged({
        pageNumber: s.pageNumber,
        pageSize: s.pageSize,
        searchTerm: s.searchTerm,
        languageId: s.languageId || undefined,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
      )
      .subscribe({
        next: (res) => this.updateState({ items: res.items, total: res.total }),
        error: (err) => this.handleError(err, 'LoadItems'),
      });
  }

  loadById(id: string): void {
    this.updateState({ pageLoading: true, error: null });
    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      )
      .subscribe({
        next: (item) => this.updateState({ editingItem: item }),
        error: (err) => this.handleError(err, 'LoadById'),
      });
  }

  loadForView(id: string): void {
    this.updateState({ pageLoading: true, error: null, viewItem: null });
    this.api
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ pageLoading: false })),
      )
      .subscribe({
        next: (item) => this.updateState({ viewItem: item }),
        error: (err) => this.handleError(err, 'LoadForView'),
      });
  }

  setSearchTerm(term: string): void {
    this.updateState({ searchTerm: term, pageNumber: 1 });
    this.loadItems();
  }

  setLanguageId(id: number | null): void {
    this.updateState({ languageId: id, pageNumber: 1 });
    this.loadItems();
  }

  setPageIndex(index: number): void {
    this.updateState({ pageNumber: index });
    this.loadItems();
  }

  save(data: any): Observable<PlatformDetailDto> {
    const isUpdate = !!data.id;
    const request = isUpdate
      ? this.api.update(data.id, data as PlatformUpdateDto)
      : this.api.create(data as PlatformCreateDto);

    this.updateState({ pageLoading: true });
    return request.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ pageLoading: false })),
    );
  }

  delete(id: string): void {
    this.updateState({ deletingId: id });
    this.api
      .delete(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ deletingId: null })),
      )
      .subscribe({
        next: () => {
          this.message.success('Платформа удалена');
          this.loadItems();
        },
        error: (err) => this.handleError(err, 'Delete'),
      });
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.updateState({ error: errorResponse });
    this.message.error(errorResponse.getUserMessage());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
