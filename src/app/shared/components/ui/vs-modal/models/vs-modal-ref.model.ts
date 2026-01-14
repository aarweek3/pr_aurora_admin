import { OverlayRef } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Контроллер модального окна VS
 * @template TData - тип входных данных
 * @template TResult - тип возвращаемого результата
 */
export class VSModalRef<TData = any, TResult = any> {
  /** Событие после закрытия окна */
  private readonly _afterClosed = new Subject<TResult | undefined>();

  /** Сигнал для динамического обновления текста в статус-баре */
  readonly statusText = signal<string | undefined>(undefined);

  /** Сигнал для динамического обновления заголовка */
  readonly title = signal<string | undefined>(undefined);

  constructor(
    private readonly overlayRef: OverlayRef,
    public readonly config: any, // Быстрая ссылка на конфиг
  ) {
    this.statusText.set(config.statusText);
    this.title.set(config.title);
  }

  /**
   * Закрыть модальное окно
   * @param result Опциональный результат операции
   */
  close(result?: TResult): void {
    this.overlayRef.dispose();
    this._afterClosed.next(result);
    this._afterClosed.complete();
  }

  /**
   * Получить поток события закрытия
   */
  afterClosed(): Observable<TResult | undefined> {
    return this._afterClosed.asObservable();
  }

  /**
   * Быстро обновить статус в футере
   */
  setStatus(text: string): void {
    this.statusText.set(text);
  }

  /**
   * Обновить заголовок окна
   */
  setTitle(text: string): void {
    this.title.set(text);
  }
}
