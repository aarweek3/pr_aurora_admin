import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ToggleDirective } from './toggle.directive';

/**
 * Toggle Component
 *
 * Standalone компонент для создания toggle-переключателей.
 * Поддерживает Angular Forms (ControlValueAccessor) для использования с ngModel и FormControl.
 *
 * @example Простое использование
 * <av-toggle [(checked)]="isEnabled" />
 *
 * @example С параметрами
 * <av-toggle
 *   [(checked)]="notifications"
 *   [size]="'large'"
 *   [color]="'success'"
 *   [disabled]="false"
 *   (checkedChange)="onToggle($event)"
 * />
 *
 * @example С ngModel (требует FormsModule)
 * <av-toggle [(ngModel)]="isEnabled" />
 *
 * @example С FormControl (требует ReactiveFormsModule)
 * <av-toggle [formControl]="enabledControl" />
 *
 * @example С label
 * <av-toggle [(checked)]="darkMode">
 *   Dark Mode
 * </av-toggle>
 */
@Component({
  selector: 'av-toggle',
  standalone: true,
  imports: [CommonModule, ToggleDirective, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="av-toggle-wrapper"
      [class.av-toggle-wrapper--disabled]="disabled()"
      [class.av-toggle-wrapper--top]="labelPosition() === 'top'"
      [class.av-toggle-wrapper--bottom]="labelPosition() === 'bottom'"
      [class.av-toggle-wrapper--left]="labelPosition() === 'left'"
      [class.av-toggle-wrapper--right]="labelPosition() === 'right'"
      (click)="onWrapperClick()"
    >
      @if (hasLabel() && (labelPosition() === 'top' || labelPosition() === 'left')) {
      <span
        class="av-toggle-wrapper__label"
        [style.font-size]="labelSize()"
        [style.color]="labelColor()"
      >
        <ng-content></ng-content>
      </span>
      }

      <label class="av-toggle" [attr.for]="inputId">
        <input
          [id]="inputId"
          type="checkbox"
          avToggle
          [avSize]="size()"
          [avColor]="color()"
          [avShape]="shape()"
          [avWidth]="width()"
          [avHeight]="height()"
          [avRadius]="radius()"
          [checked]="checked()"
          [disabled]="disabled()"
          (change)="onInputChange($event)"
        />
        <span class="av-toggle__slider"></span>

        @if (checkedIcon()) {
        <app-icon
          [type]="checkedIcon()!"
          class="av-toggle__icon av-toggle__icon--checked"
        ></app-icon>
        } @if (uncheckedIcon()) {
        <app-icon
          [type]="uncheckedIcon()!"
          class="av-toggle__icon av-toggle__icon--unchecked"
        ></app-icon>
        }
      </label>

      @if (hasLabel() && (labelPosition() === 'bottom' || labelPosition() === 'right')) {
      <span
        class="av-toggle-wrapper__label"
        [style.font-size]="labelSize()"
        [style.color]="labelColor()"
      >
        <ng-content></ng-content>
      </span>
      }
    </div>
  `,
  styles: [
    `
      .av-toggle-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 12px;

        &--top {
          flex-direction: column-reverse;
        }
        &--bottom {
          flex-direction: column;
        }
        &--left {
          flex-direction: row-reverse;
        }
        &--right {
          flex-direction: row;
        }
      }
    `,
  ],
})
export class ToggleComponent implements ControlValueAccessor {
  /** Состояние переключателя */
  checked = model<boolean>(false);

  /** Размер переключателя */
  size = input<'small' | 'default' | 'large'>('default');

  /** Форма переключателя */
  shape = input<'default' | 'square'>('default');

  /** Цветовая схема */
  color = input<string | 'primary' | 'success' | 'warning' | 'danger'>('primary');

  /** Отключенное состояние */
  disabled = input<boolean>(false);

  /** Позиция текста: top, bottom, left, right */
  labelPosition = input<'top' | 'bottom' | 'left' | 'right'>('right');

  /** Размер шрифта метки */
  labelSize = input<string | null>(null);

  /** Цвет шрифта метки */
  labelColor = input<string | null>(null);

  /** Иконка для Checked состояния */
  checkedIcon = input<string | null>(null);

  /** Иконка для Unchecked состояния */
  uncheckedIcon = input<string | null>(null);

  /** Кастомные размеры */
  width = input<string | number | null>(null);
  height = input<string | number | null>(null);
  radius = input<string | number | null>(null);

  /** Уникальный ID для input элемента */
  inputId = `av-toggle-${Math.random().toString(36).substring(2, 9)}`;

  /** Есть ли label (ng-content) */
  hasLabel(): boolean {
    return true; // Можно добавить проверку на наличие контента
  }

  // ControlValueAccessor
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Обработчик изменения input
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.checked;

    this.checked.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  /**
   * Обработчик клика на wrapper (для label)
   */
  onWrapperClick(): void {
    if (this.disabled()) {
      return;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Note: Since 'disabled' is an input() signal, it's read-only from here.
    // Usually ControlValueAccessor for signals is handled via a separate state.
  }
}
