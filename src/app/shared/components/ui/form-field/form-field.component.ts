// src/app/shared/components/ui/form-field/form-field.component.ts
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Form Field Component
 *
 * Обёртка для input элементов с:
 * - Label
 * - Error handling
 * - Required indicator
 * - Help text
 * - BEM стилизацией
 *
 * Использование:
 * ```html
 * <app-form-field
 *   label="Email"
 *   [required]="true"
 *   [control]="emailControl"
 *   helpText="Введите ваш email"
 * >
 *   <input type="email" formControlName="email" />
 * </app-form-field>
 * ```
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="form-field"
      [class.form-field--error]="hasError()"
      [class.form-field--disabled]="disabled()"
    >
      <!-- Label -->
      @if (label()) {
      <label class="form-field__label">
        {{ label() }}
        @if (required()) {
        <span class="form-field__required">*</span>
        }
      </label>
      }

      <!-- Input Wrapper -->
      <div class="form-field__input">
        <ng-content></ng-content>
      </div>

      <!-- Help Text -->
      @if (helpText() && !hasError()) {
      <div class="form-field__help">{{ helpText() }}</div>
      }

      <!-- Error Messages -->
      @if (hasError() && control()) {
      <div class="form-field__error">
        @if (control()?.hasError('required')) {
        <span>Поле обязательно для заполнения</span>
        } @else if (control()?.hasError('email')) {
        <span>Введите корректный email</span>
        } @else if (control()?.hasError('minlength')) {
        <span>Минимальная длина: {{ control()?.errors?.['minlength']?.requiredLength }}</span>
        } @else if (control()?.hasError('maxlength')) {
        <span>Максимальная длина: {{ control()?.errors?.['maxlength']?.requiredLength }}</span>
        } @else if (control()?.hasError('pattern')) {
        <span>Неверный формат</span>
        } @else if (errorMessage()) {
        <span>{{ errorMessage() }}</span>
        } @else {
        <span>Ошибка валидации</span>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../../../styles/abstracts/variables' as *;
      @use '../../../../../styles/abstracts/mixins' as *;

      .form-field {
        display: flex;
        flex-direction: column;
        margin-bottom: $spacing-base;

        &__label {
          display: block;
          margin-bottom: $spacing-xs;
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
          color: $color-text-primary;
        }

        &__required {
          color: $color-error;
          margin-left: 2px;
        }

        &__input {
          position: relative;

          // Стилизация вложенных input, textarea, select
          :ng-deep {
            input,
            textarea,
            select {
              width: 100%;
              height: $input-height-base;
              padding: 0 $input-padding-horizontal-base;
              font-size: $font-size-base;
              line-height: 1.5;
              color: $color-text-primary;
              background: $color-white;
              border: $border-width-base solid $color-border-base;
              border-radius: $border-radius-base;
              transition: $transition-base;

              &:focus {
                outline: none;
                border-color: $color-primary;
                box-shadow: 0 0 0 2px rgba($color-primary, 0.1);
              }

              &::placeholder {
                color: $color-text-tertiary;
              }

              &:disabled {
                background: $color-bg-gray;
                cursor: not-allowed;
                color: $color-text-disabled;
              }
            }

            textarea {
              height: auto;
              min-height: 80px;
              padding: $spacing-sm $input-padding-horizontal-base;
              resize: vertical;
            }
          }
        }

        &__help {
          margin-top: $spacing-xs;
          font-size: $font-size-sm;
          color: $color-text-secondary;
        }

        &__error {
          margin-top: $spacing-xs;
          font-size: $font-size-sm;
          color: $color-error;
        }

        // Error state
        &--error {
          .form-field__input {
            :ng-deep {
              input,
              textarea,
              select {
                border-color: $color-error;

                &:focus {
                  border-color: $color-error;
                  box-shadow: 0 0 0 2px rgba($color-error, 0.1);
                }
              }
            }
          }
        }

        // Disabled state
        &--disabled {
          .form-field__label {
            color: $color-text-disabled;
          }
        }

        // Dark theme
        @include dark-theme {
          &__label {
            color: $dark-text-primary;
          }

          &__help {
            color: $dark-text-secondary;
          }

          &__input {
            :ng-deep {
              input,
              textarea,
              select {
                background: $dark-bg-light;
                color: $dark-text-primary;
                border-color: $dark-border-base;

                &:disabled {
                  background: $dark-bg-gray;
                  color: $dark-text-tertiary;
                }
              }
            }
          }
        }
      }
    `,
  ],
})
export class FormFieldComponent {
  /** Label текст */
  label = input<string>('');

  /** Обязательное поле */
  required = input<boolean>(false);

  /** FormControl для валидации */
  control = input<AbstractControl | null>(null);

  /** Текст подсказки */
  helpText = input<string>('');

  /** Кастомное сообщение об ошибке */
  errorMessage = input<string>('');

  /** Disabled состояние */
  disabled = input<boolean>(false);

  /** Проверка наличия ошибок */
  hasError(): boolean {
    const ctrl = this.control();
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
