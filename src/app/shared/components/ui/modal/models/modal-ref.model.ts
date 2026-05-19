import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { ModalConfig } from './modal-config.model';

/**
 * Класс для управления экземпляром модального окна
 */
export class ModalRef<TResult = unknown, TData = unknown> {
  private readonly afterClosedSubject = new Subject<TResult | undefined>();
  private result: TResult | undefined;

  constructor(
    public overlayRef: OverlayRef,
    public config: ModalConfig<TData, TResult>,
  ) {}

  /**
   * Закрыть модал с результатом
   */
  async close(result?: TResult): Promise<void> {
    // Вызываем beforeClose если есть
    if (this.config.beforeClose) {
      const canClose = await this.config.beforeClose(result);
      if (!canClose) {
        return; // Отменяем закрытие
      }
    }

    this.result = result;
    this.overlayRef.dispose();
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  /**
   * Observable, который эмитит значение при закрытии модала
   */
  afterClosed(): Observable<TResult | undefined> {
    return this.afterClosedSubject.asObservable();
  }

  /**
   * Обновить размер модала
   */
  updateSize(width?: string, height?: string): void {
    if (width) {
      this.overlayRef.updateSize({ width });
    }
    if (height) {
      this.overlayRef.updateSize({ height });
    }
  }

  /**
   * Обновить позицию модала
   */
  updatePosition(): void {
    this.overlayRef.updatePosition();
  }

  /**
   * Обновить конфигурацию модала
   */
  updateConfig(config: Partial<ModalConfig<TData, TResult>>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Получить результат закрытия
   */
  getResult(): TResult | undefined {
    return this.result;
  }
}
