import { InjectionToken } from '@angular/core';
import { ModalRef } from '../models';

/**
 * Injection token для передачи данных в компонент модала
 *
 * @example
 * ```typescript
 * export class MyModalComponent {
 *   constructor(@Inject(MODAL_DATA) public data: { userId: number }) {}
 * }
 * ```
 */
export const MODAL_DATA = new InjectionToken<unknown>('ModalData');

/**
 * Injection token для получения ссылки на текущий ModalRef
 *
 * @example
 * ```typescript
 * export class MyModalComponent {
 *   constructor(private modalRef: ModalRef<User>) {}
 *
 *   save() {
 *     this.modalRef.close(this.user);
 *   }
 * }
 * ```
 */
export const MODAL_REF = new InjectionToken<ModalRef<unknown>>('ModalRef');
