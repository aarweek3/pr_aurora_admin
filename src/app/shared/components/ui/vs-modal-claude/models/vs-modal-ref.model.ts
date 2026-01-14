import { Observable, Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Референс для управления конкретным модальным окном
 */
export class VSModalRef<TData = any, TResult = any> {
  private readonly _afterClosed$ = new Subject<TResult | undefined>();

  constructor(
    private overlayRef: OverlayRef,
    public data?: TData,
  ) {
    // Подписываемся на backdrop клики
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    // Подписываемся на Escape
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Закрывает модальное окно с опциональным результатом
   */
  close(result?: TResult): void {
    this._afterClosed$.next(result);
    this._afterClosed$.complete();
    this.overlayRef.dispose();
  }

  /**
   * Observable, который эмитит результат после закрытия окна
   */
  afterClosed(): Observable<TResult | undefined> {
    return this._afterClosed$.asObservable();
  }

  /**
   * Получить OverlayRef (для продвинутого управления)
   */
  getOverlayRef(): OverlayRef {
    return this.overlayRef;
  }
}
