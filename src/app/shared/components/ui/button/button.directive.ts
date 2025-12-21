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
  avColor = input<string | null>(null);
  avVisible = input<boolean>(true);
  avIconOnly = input<boolean>(false);
  avShape = input<'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big'>('default');
  avWidth = input<string | number | null>(null);
  avHeight = input<string | number | null>(null);
  avRadius = input<string | number | null>(null);
  avIconSize = input<string | number | null>(null);
  avIconColor = input<string | null>(null);
  avTextColor = input<string | null>(null);

  // Output
  clicked = output<MouseEvent>();

  // Visibility binding
  @HostBinding('class.av-btn--hidden')
  get isHidden(): boolean {
    return !this.avVisible();
  }

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

    if (this.avIconOnly()) {
      classes.push('av-btn--icon-only');
    }

    if (this.avShape() !== 'default') {
      classes.push(`av-btn--shape-${this.avShape()}`);
    }

    return classes.join(' ');
  }

  @HostBinding('style.backgroundColor')
  get bgColor(): string | null {
    return this.avColor();
  }

  @HostBinding('style.borderColor')
  get borderColor(): string | null {
    return this.avColor();
  }

  @HostBinding('style.color')
  get textColor(): string | null {
    if (this.avTextColor()) return this.avTextColor();
    return this.avColor() ? '#fff' : null;
  }

  @HostBinding('style.--av-icon-color')
  get iconColor(): string | null {
    return this.avIconColor();
  }

  @HostBinding('style.width')
  get width(): string | null {
    return this.formatDimension(this.avWidth());
  }

  @HostBinding('style.height')
  get height(): string | null {
    return this.formatDimension(this.avHeight());
  }

  @HostBinding('style.borderRadius')
  get borderRadius(): string | null {
    // 1. Ручной радиус имеет высший приоритет
    const manualRadius = this.formatDimension(this.avRadius());
    if (manualRadius) return manualRadius;

    // 2. Если ручного нет, смотрим на пресеты формы
    if (this.avShape() === 'circle') return '50%';
    if (this.avShape() === 'square') return '0';

    return null;
  }

  @HostBinding('style.--av-btn-icon-size')
  get iconSize(): string | null {
    return this.formatDimension(this.avIconSize());
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

  private formatDimension(value: string | number | null): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return `${value}px`;

    // Если это строка, состоящая только из цифр - добавляем px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    return value;
  }
}
