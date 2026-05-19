// src/app/shared/components/ui/password-input/password-input.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputDirective } from '../input/input.directive';

type InputSize = 'small' | 'default' | 'large' | 'x-large';
type InputStatus = 'default' | 'error' | 'warning' | 'success';
type InputVariant = 'outlined' | 'filled' | 'borderless';

/**
 * Password Input Component
 *
 * Специализированный компонент для ввода пароля с кнопкой показать/скрыть
 *
 * @example
 * ```html
 * <av-password-input
 *   label="Пароль"
 *   placeholder="Введите пароль"
 *   [(ngModel)]="password"
 * />
 * ```
 */
@Component({
  selector: 'av-password-input',
  standalone: true,
  imports: [CommonModule, InputDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="av-password-input">
      @if (label) {
        <label class="av-password-input__label" [for]="inputId">{{ label }}</label>
      }

      <div class="av-password-input__container">
        <input
          [id]="inputId"
          [type]="isVisible() ? 'text' : 'password'"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          [avSize]="size"
          [avStatus]="status"
          [avVariant]="variant"
          avInput
          (input)="onInput($event)"
          class="av-password-input__field"
        />

        <button
          type="button"
          class="av-password-input__toggle"
          (click)="toggleVisibility()"
          [disabled]="disabled"
          [attr.aria-label]="isVisible() ? 'Скрыть пароль' : 'Показать пароль'"
        >
          @if (isVisible()) {
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          } @else {
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        </button>
      </div>

      @if (hint && !errorMessage) {
        <span class="av-password-input__hint">{{ hint }}</span>
      }
      @if (errorMessage && status === 'error') {
        <span class="av-password-input__error">{{ errorMessage }}</span>
      }
    </div>
  `,
  styles: [
    `
      .av-password-input {
        display: block;

        &__label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }

        &__container {
          position: relative;
          display: flex;
          align-items: center;
        }

        &__field {
          flex: 1;
          padding-right: 48px !important; // Make room for toggle button
        }

        &__toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: rgba(0, 0, 0, 0.45);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;

          &:hover:not(:disabled) {
            background-color: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.65);
          }

          &:active:not(:disabled) {
            background-color: rgba(0, 0, 0, 0.08);
          }

          &:disabled {
            cursor: not-allowed;
            opacity: 0.4;
          }

          svg {
            display: block;
          }
        }

        &__hint {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }

        &__error {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: #ff4d4f;
        }
      }

      @media (prefers-color-scheme: dark) {
        .av-password-input {
          &__label {
            color: rgba(255, 255, 255, 0.85);
          }

          &__toggle {
            color: rgba(255, 255, 255, 0.45);

            &:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 0.08);
              color: rgba(255, 255, 255, 0.65);
            }

            &:active:not(:disabled) {
              background-color: rgba(255, 255, 255, 0.12);
            }
          }

          &__hint {
            color: rgba(255, 255, 255, 0.45);
          }
        }
      }
    `,
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() disabled = false;
  @Input() size: InputSize = 'default';
  @Input() status: InputStatus = 'default';
  @Input() variant: InputVariant = 'outlined';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  isVisible = signal(false);
  inputId = `password-input-${Math.random().toString(36).substring(7)}`;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggleVisibility() {
    this.isVisible.update((v) => !v);
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
