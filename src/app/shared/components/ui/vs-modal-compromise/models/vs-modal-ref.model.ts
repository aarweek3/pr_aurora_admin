import { OverlayRef } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { VSModalConfig } from './vs-modal-config.model';

/**
 * Контроллер модального окна VS (Compromise)
 * @template TData - тип входных данных
 * @template TResult - тип возвращаемого результата
 */
export class VSModalRef<TData = any, TResult = any> {
  /** Реактивный заголовок */
  readonly title = signal<string>('');

  /** Реактивный текст в статус-баре */
  readonly statusText = signal<string>('');

  /** Флаг активного ресайза для визуальных эффектов */
  readonly isResizing = signal<boolean>(false);

  /** Debug информация о позиции и размерах */
  readonly debugInfo = signal<{
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  } | null>(null);

  /** История изменений позиции и размеров для отладки */
  readonly debugHistory = signal<
    Array<{
      timestamp: number;
      action: 'drag' | 'resize' | 'init' | 'adjust';
      top: number;
      left: number;
      width: number;
      height: number;
      right: number;
      bottom: number;
    }>
  >([]);

  private readonly _afterClosed$ = new Subject<TResult | undefined>();

  constructor(
    private readonly overlayRef: OverlayRef,
    public readonly config: VSModalConfig<TData>,
    public readonly data?: TData,
  ) {
    // Инициализация из конфига
    this.title.set(config.title);
    this.statusText.set(config.statusText || 'Ready');

    // Подписка на Escape
    if (config.closeOnEscape !== false) {
      this.overlayRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
        .subscribe(() => this.close());
    }

    // Подписка на клик по бэкдропу
    if (config.hasBackdrop !== false && config.closeOnBackdropClick !== false) {
      this.overlayRef.backdropClick().subscribe(() => this.close());
    }
  }

  /**
   * Закрыть окно
   * @param result Опциональный возвращаемый результат
   */
  close(result?: TResult): void {
    this._afterClosed$.next(result);
    this._afterClosed$.complete();
    this.overlayRef.dispose();
  }

  /**
   * Поток события закрытия окна
   */
  afterClosed(): Observable<TResult | undefined> {
    return this._afterClosed$.asObservable();
  }

  /**
   * Обновить заголовок окна "на лету"
   */
  updateTitle(text: string): void {
    this.title.set(text);
  }

  /**
   * Обновить статус в футере "на лету"
   */
  updateStatus(text: string): void {
    this.statusText.set(text);
  }

  /**
   * Получить нативный OverlayRef для тонкой настройки
   */
  getOverlayRef(): OverlayRef {
    return this.overlayRef;
  }

  /**
   * Добавить запись в историю debug
   */
  addDebugHistoryEntry(
    action: 'drag' | 'resize' | 'init' | 'adjust',
    rect: { top: number; left: number; width: number; height: number; right: number; bottom: number },
  ): void {
    const history = this.debugHistory();
    const newEntry = {
      timestamp: Date.now(),
      action,
      ...rect,
    };

    // Ограничиваем историю последними 100 записями
    const updatedHistory = [...history, newEntry].slice(-100);
    this.debugHistory.set(updatedHistory);
  }

  /**
   * Очистить историю debug
   */
  clearDebugHistory(): void {
    this.debugHistory.set([]);
  }
}
