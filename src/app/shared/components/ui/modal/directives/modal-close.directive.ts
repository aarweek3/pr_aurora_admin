import { Directive, HostListener, Input, inject } from '@angular/core';
import { ModalRef } from '../models/modal-ref.model';

/**
 * Директива для упрощенного закрытия модала с передачей результата
 *
 * @example
 * ```html
 * <!-- Закрыть без результата -->
 * <button av-button avModalClose>Отмена</button>
 *
 * <!-- Закрыть с результатом -->
 * <button av-button [avModalClose]="'saved'">Сохранить</button>
 *
 * <!-- Условное закрытие -->
 * <button av-button
 *   [avModalClose]="form.valid ? formData : undefined"
 *   [closeOnClick]="form.valid">
 *   Сохранить
 * </button>
 * ```
 */
@Directive({
  selector: '[avModalClose]',
  standalone: true,
})
export class ModalCloseDirective<T = unknown> {
  private modalRef = inject<ModalRef<T>>(ModalRef, { optional: true });

  /** Результат для передачи при закрытии */
  @Input('avModalClose') result?: T;

  /** Закрывать ли модал при клике */
  @Input() closeOnClick = true;

  constructor() {
    if (!this.modalRef) {
      throw new Error('ModalCloseDirective requires ModalRef to be injected');
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.closeOnClick && this.modalRef) {
      event.stopPropagation();
      this.modalRef.close(this.result);
    }
  }
}
