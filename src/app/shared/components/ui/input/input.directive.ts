// src/app/shared/components/ui/input/input.directive.ts
import { Directive, HostBinding, input } from '@angular/core';

/**
 * Input Directive
 *
 * Директива для стилизации нативных input элементов.
 * Добавляет классы для размеров, статусов и вариантов отображения.
 *
 * @example Базовый input
 * <input avInput type="text" placeholder="Enter text" />
 *
 * @example С параметрами
 * <input
 *   avInput
 *   avSize="large"
 *   avStatus="error"
 *   avVariant="filled"
 *   type="email"
 *   placeholder="your@email.com"
 * />
 *
 * @example С FormControl
 * <input avInput [formControl]="emailControl" />
 */
@Directive({
  selector: 'input[avInput], textarea[avInput]',
  standalone: true,
  host: {
    class: 'av-input',
  },
})
export class InputDirective {
  /**
   * Размер input
   */
  avSize = input<'small' | 'default' | 'large' | 'x-large'>('default');

  /**
   * Статус (для валидации)
   */
  avStatus = input<'default' | 'error' | 'warning' | 'success'>('default');

  /**
   * Вариант отображения
   */
  avVariant = input<'outlined' | 'filled' | 'borderless'>('outlined');

  /**
   * Пунктирная рамка
   */
  avDashed = input<boolean>(false);

  /**
   * Отключенное состояние
   */
  disabled = input<boolean>(false);

  /** Пользовательская ширина */
  avWidth = input<string | number | null>(null);

  /** Пользовательская высота */
  avHeight = input<string | number | null>(null);

  /** Пользовательский радиус скругления */
  avRadius = input<string | number | null>(null);

  /** Видимость компонента */
  avVisible = input<boolean>(true);

  /** Растягивание на всю ширину контейнера */
  avBlock = input<boolean>(false);

  /** Форма (скругление) */
  avShape = input<'default' | 'rounded' | 'rounded-big'>('default');

  /** Размер префиксной иконки */
  avPrefixIconSize = input<string | number | null>(null);

  /** Цвет префиксной иконки */
  avPrefixIconColor = input<string | null>(null);

  /** Размер суффиксной иконки */
  avSuffixIconSize = input<string | number | null>(null);

  /** Цвет суффиксной иконки */
  avSuffixIconColor = input<string | null>(null);

  /** Базовый размер иконок (если не заданы специфичные) */
  avIconSize = input<string | number | null>(null);

  /** Базовый цвет иконок (если не заданы специфичные) */
  avIconColor = input<string | null>(null);

  @HostBinding('class')
  get hostClasses(): string {
    const classes = ['av-input'];

    if (this.avSize() !== 'default') {
      classes.push(`av-input--${this.avSize()}`);
    }

    if (this.avStatus() !== 'default') {
      classes.push(`av-input--${this.avStatus()}`);
    }

    if (this.avVariant() !== 'outlined') {
      classes.push(`av-input--${this.avVariant()}`);
    }

    if (this.avDashed()) {
      classes.push('av-input--dashed');
    }

    if (this.disabled()) {
      classes.push('av-input--disabled');
    }

    if (this.avBlock()) {
      classes.push('av-input--block');
    }

    if (!this.avRadius()) {
      if (this.avShape() === 'rounded') {
        classes.push('av-input--rounded');
      } else if (this.avShape() === 'rounded-big') {
        classes.push('av-input--rounded-big');
      }
    }

    return classes.join(' ');
  }

  @HostBinding('style.display')
  get display(): string | null {
    return this.avVisible() ? null : 'none';
  }

  @HostBinding('style.width')
  get width(): string | null {
    if (this.avBlock()) return '100%';
    return this.formatDimension(this.avWidth());
  }

  @HostBinding('style.height')
  get height(): string | null {
    return this.formatDimension(this.avHeight());
  }

  @HostBinding('style.borderRadius')
  get borderRadius(): string | null {
    return this.formatDimension(this.avRadius());
  }

  @HostBinding('style.--av-icon-color')
  get iconColor(): string | null {
    return this.avIconColor();
  }

  @HostBinding('style.--av-input-icon-size')
  get iconSize(): string | null {
    return this.formatDimension(this.avIconSize());
  }

  @HostBinding('style.--av-prefix-icon-color')
  get prefixIconColor(): string | null {
    return this.avPrefixIconColor() || this.avIconColor();
  }

  @HostBinding('style.--av-prefix-icon-size')
  get prefixIconSize(): string | null {
    return this.formatDimension(this.avPrefixIconSize() || this.avIconSize());
  }

  @HostBinding('style.--av-suffix-icon-color')
  get suffixIconColor(): string | null {
    return this.avSuffixIconColor() || this.avIconColor();
  }

  @HostBinding('style.--av-suffix-icon-size')
  get suffixIconSize(): string | null {
    return this.formatDimension(this.avSuffixIconSize() || this.avIconSize());
  }

  private formatDimension(value: string | number | null): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return `${value}px`;
    if (/^\d+$/.test(value)) return `${value}px`;
    return value;
  }
}
