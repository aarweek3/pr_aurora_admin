// src/app/shared/components/ui/input/input.component.ts
import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Input Sizes
 */
export type InputSize = 'small' | 'default' | 'large';

/**
 * Input Types
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

/**
 * Input Component
 *
 * Универсальный input с поддержкой:
 * - Разных размеров (small, default, large) - совпадают с кнопками по высоте
 * - Разных типов (text, password, email, number, tel, url, search)
 * - Состояний (disabled, readonly, error)
 * - Иконок (prefix, suffix)
 * - Clear button
 * - BEM классов для стилизации
 *
 * Использование:
 * ```html
 * <app-input
 *   size="large"
 *   type="email"
 *   placeholder="Введите email"
 *   [value]="email()"
 *   (valueChange)="email.set($event)"
 * />
 *
 * <app-input
 *   prefixIcon="user"
 *   suffixIcon="search"
 *   [allowClear]="true"
 *   (valueChange)="handleSearch($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="input-wrapper" [class]="wrapperClasses()">
      <!-- Prefix Icon -->
      @if (prefixIcon()) {
      <span class="input-wrapper__icon input-wrapper__icon--prefix" nz-icon [nzType]="prefixIcon()!"></span>
      }

      <!-- Input Element -->
      <input
        #inputElement
        class="input-wrapper__input"
        [type]="showPassword() ? 'text' : type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [attr.maxlength]="maxLength() || null"
        (input)="handleInput($event)"
        (focus)="handleFocus()"
        (blur)="handleBlur()"
      />

      <!-- Clear Button -->
      @if (allowClear() && value() && !disabled() && !readonly()) {
      <span
        class="input-wrapper__icon input-wrapper__icon--clear"
        nz-icon
        nzType="close-circle"
        nzTheme="fill"
        (click)="handleClear()"
      ></span>
      }

      <!-- Password Toggle -->
      @if (type() === 'password' && value()) {
      <span
        class="input-wrapper__icon input-wrapper__icon--password"
        nz-icon
        [nzType]="showPassword() ? 'eye-invisible' : 'eye'"
        (click)="togglePassword()"
      ></span>
      }

      <!-- Suffix Icon -->
      @if (suffixIcon()) {
      <span class="input-wrapper__icon input-wrapper__icon--suffix" nz-icon [nzType]="suffixIcon()!"></span>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../../../styles/abstracts/variables' as *;
      @use '../../../../../styles/abstracts/mixins' as *;

      .input-wrapper {
        @include flex-layout(center, flex-start);
        position: relative;
        width: 100%;
        gap: $spacing-xs;

        // Base styles
        background: $color-white;
        border: $border-width-base solid $color-border-base;
        border-radius: $border-radius-base;
        transition: $transition-base;

        // Размеры по умолчанию (совпадают с кнопками!)
        height: $input-height-base;
        padding: 0 $input-padding-horizontal-base;

        &:hover:not(&--disabled):not(&--readonly) {
          border-color: $color-primary-hover;
        }

        &:focus-within {
          border-color: $color-primary;
          box-shadow: 0 0 0 2px rgba($color-primary, 0.1);
          outline: none;
        }

        // === SIZE VARIANTS ===

        &--small {
          height: $input-height-sm;
          padding: 0 $input-padding-horizontal-sm;
          font-size: $font-size-sm;

          .input-wrapper__input {
            font-size: $font-size-sm;
          }

          .input-wrapper__icon {
            font-size: 12px;
          }
        }

        &--large {
          height: $input-height-lg;
          padding: 0 $input-padding-horizontal-lg;
          font-size: $font-size-md;

          .input-wrapper__input {
            font-size: $font-size-md;
          }

          .input-wrapper__icon {
            font-size: 16px;
          }
        }

        // === STATE MODIFIERS ===

        &--disabled {
          background: $color-bg-gray;
          border-color: $color-border-base;
          cursor: not-allowed;

          .input-wrapper__input {
            color: $color-text-disabled;
            cursor: not-allowed;
          }
        }

        &--readonly {
          background: $color-bg-light;
          cursor: default;
        }

        &--error {
          border-color: $color-error;

          &:focus-within {
            border-color: $color-error;
            box-shadow: 0 0 0 2px rgba($color-error, 0.1);
          }
        }

        &--focused {
          border-color: $color-primary;
          box-shadow: 0 0 0 2px rgba($color-primary, 0.1);
        }

        // === INPUT ELEMENT ===

        &__input {
          @include reset-input;
          flex: 1;
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: $font-size-base;
          line-height: 1.5;
          color: $color-text-primary;

          &::placeholder {
            color: $color-text-tertiary;
          }

          &:disabled {
            cursor: not-allowed;
          }

          // Remove autofill background
          &:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px $color-white inset;
            -webkit-text-fill-color: $color-text-primary;
          }
        }

        // === ICONS ===

        &__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: $color-text-tertiary;
          font-size: 14px;
          flex-shrink: 0;

          &--clear,
          &--password {
            cursor: pointer;
            transition: color $transition-duration-base;

            &:hover {
              color: $color-text-secondary;
            }
          }

          &--clear {
            color: $color-text-tertiary;
          }
        }

        // === DARK THEME ===

        @include dark-theme {
          background: $dark-bg-light;
          border-color: $dark-border-base;
          color: $dark-text-primary;

          &:hover:not(.input-wrapper--disabled):not(.input-wrapper--readonly) {
            border-color: $color-primary-hover;
          }

          &--disabled {
            background: $dark-bg-gray;
            border-color: $dark-border-base;

            .input-wrapper__input {
              color: $dark-text-tertiary;
            }
          }

          &--readonly {
            background: $dark-bg-gray;
          }

          .input-wrapper__input {
            color: $dark-text-primary;

            &::placeholder {
              color: $dark-text-tertiary;
            }

            &:-webkit-autofill {
              -webkit-box-shadow: 0 0 0 1000px $dark-bg-light inset;
              -webkit-text-fill-color: $dark-text-primary;
            }
          }

          .input-wrapper__icon {
            color: $dark-text-tertiary;

            &--clear:hover,
            &--password:hover {
              color: $dark-text-secondary;
            }
          }
        }
      }
    `,
  ],
})
export class InputComponent {
  // ===== INPUTS =====

  /** Размер input (small: 24px, default: 32px, large: 40px) */
  size = input<InputSize>('default');

  /** Тип input */
  type = input<InputType>('text');

  /** Placeholder текст */
  placeholder = input<string>('');

  /** Значение */
  value = input<string>('');

  /** Иконка перед текстом */
  prefixIcon = input<string | null>(null);

  /** Иконка после текста */
  suffixIcon = input<string | null>(null);

  /** Показывать кнопку очистки */
  allowClear = input<boolean>(false);

  /** Disabled состояние */
  disabled = input<boolean>(false);

  /** Readonly состояние */
  readonly = input<boolean>(false);

  /** Error состояние */
  error = input<boolean>(false);

  /** Максимальная длина */
  maxLength = input<number | null>(null);

  // ===== OUTPUTS =====

  /** Событие изменения значения */
  valueChange = output<string>();

  /** Событие фокуса */
  focused = output<void>();

  /** Событие потери фокуса */
  blurred = output<void>();

  // ===== STATE =====

  /** Показывать пароль (для type="password") */
  showPassword = signal(false);

  /** Input в фокусе */
  isFocused = signal(false);

  // ===== COMPUTED =====

  /** Собрать CSS классы на основе inputs */
  wrapperClasses() {
    const classes: string[] = [];

    // Size
    if (this.size() !== 'default') {
      classes.push(`input-wrapper--${this.size()}`);
    }

    // States
    if (this.disabled()) {
      classes.push('input-wrapper--disabled');
    }

    if (this.readonly()) {
      classes.push('input-wrapper--readonly');
    }

    if (this.error()) {
      classes.push('input-wrapper--error');
    }

    if (this.isFocused()) {
      classes.push('input-wrapper--focused');
    }

    return classes.join(' ');
  }

  // ===== METHODS =====

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  handleFocus(): void {
    this.isFocused.set(true);
    this.focused.emit();
  }

  handleBlur(): void {
    this.isFocused.set(false);
    this.blurred.emit();
  }

  handleClear(): void {
    this.valueChange.emit('');
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
