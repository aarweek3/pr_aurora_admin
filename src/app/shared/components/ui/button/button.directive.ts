// src/app/shared/components/ui/button/button.directive.ts
import { Directive, HostBinding, HostListener, input, output } from '@angular/core';
import type { ButtonSize, ButtonType } from './button.component';

/**
 * Button Directive
 *
 * Директива для стилизации нативных кнопок с поддержкой:
 * - Разных типов (primary, default, dashed, text, link, danger)
 * - Разных размеров (small, default, large)
 * - Состояний (loading, disabled)
 * - BEM классов для стилизации
 *
 * Использование:
 * ```html
 * <button av-button avType="primary" avSize="large" [avLoading]="isLoading()" (clicked)="handleClick()">
 *   Сохранить
 * </button>
 *
 * <button av-button avType="danger" [avLoading]="true">
 *   Удалить
 * </button>
 * ```
 */
@Directive({
  selector: 'button[av-button], a[av-button]',
  standalone: true,
  host: {
    '[class.av-btn]': 'true',
  },
})
export class ButtonDirective {
  // Inputs
  avType = input<ButtonType>('default');
  avSize = input<ButtonSize>('default');
  avLoading = input<boolean>(false);
  avBlock = input<boolean>(false);

  // Output
  clicked = output<MouseEvent>();

  // Computed classes
  @HostBinding('class')
  get hostClasses(): string {
    const classes = ['av-btn'];

    // Type classes
    classes.push(`av-btn--${this.avType()}`);

    // Size classes
    if (this.avSize() !== 'default') {
      classes.push(`av-btn--${this.avSize()}`);
    }

    // State classes
    if (this.avLoading()) {
      classes.push('av-btn--loading');
    }

    if (this.avBlock()) {
      classes.push('av-btn--block');
    }

    return classes.join(' ');
  }

  @HostBinding('attr.disabled')
  get isDisabled(): boolean | null {
    return this.avLoading() ? true : null;
  }

  @HostListener('click', ['$event'])
  handleClick(event: Event): void {
    if (!this.avLoading()) {
      this.clicked.emit(event as MouseEvent);
    }
  }
}
