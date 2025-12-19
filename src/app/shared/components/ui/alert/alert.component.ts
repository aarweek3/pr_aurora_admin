// src/app/shared/components/ui/alert/alert.component.ts
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Alert Types
 */
export type AlertType = 'success' | 'info' | 'warning' | 'error';

/**
 * Alert Component
 *
 * Компонент для отображения уведомлений/сообщений.
 * Кастомная обёртка над nz-alert с нашими стилями.
 *
 * Использование:
 * ```html
 * <app-alert type="success" [closable]="true" (closed)="handleClose()">
 *   Данные успешно сохранены!
 * </app-alert>
 *
 * <app-alert type="error" title="Ошибка" description="Не удалось сохранить данные" />
 * ```
 *
 * Согласно SOW (ЧАСТЬ 6.6):
 * - Status/Feedback компонент
 * - BEM стилизация
 * - Кастомная обёртка над ng-zorro
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="alert" [class]="alertClasses()" [class.is-closable]="closable()">
      <!-- Icon -->
      <div class="alert__icon">
        <span nz-icon [nzType]="getIcon()"></span>
      </div>

      <!-- Content -->
      <div class="alert__content">
        @if (title()) {
        <div class="alert__title">{{ title() }}</div>
        } @if (description()) {
        <div class="alert__description">{{ description() }}</div>
        } @else {
        <div class="alert__message">
          <ng-content></ng-content>
        </div>
        }
      </div>

      <!-- Close Button -->
      @if (closable()) {
      <button class="alert__close" (click)="handleClose()" type="button">
        <span nz-icon nzType="close"></span>
      </button>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../../../styles/abstracts/variables' as *;
      @use '../../../../../styles/abstracts/mixins' as *;

      .alert {
        @include flex-layout(flex-start, flex-start);
        gap: $spacing-md;
        position: relative;
        padding: $spacing-md $spacing-base;
        border: $border-width-base solid transparent;
        border-radius: $border-radius-base;
        margin-bottom: $spacing-base;

        &__icon {
          flex-shrink: 0;
          font-size: $font-size-lg;
        }

        &__content {
          flex: 1;
        }

        &__title {
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
          margin-bottom: $spacing-xs;
        }

        &__description,
        &__message {
          font-size: $font-size-sm;
          line-height: $line-height-base;
        }

        &__close {
          @include reset-button;
          flex-shrink: 0;
          font-size: $font-size-base;
          color: $color-text-secondary;
          transition: color $transition-duration-base;

          &:hover {
            color: $color-text-primary;
          }
        }

        // Type variants

        &--success {
          background: $color-success-light;
          border-color: $color-success;

          .alert__icon {
            color: $color-success;
          }

          .alert__title {
            color: $color-success-dark;
          }
        }

        &--info {
          background: $color-info-light;
          border-color: $color-info;

          .alert__icon {
            color: $color-info;
          }

          .alert__title {
            color: $color-primary-active;
          }
        }

        &--warning {
          background: $color-warning-light;
          border-color: $color-warning;

          .alert__icon {
            color: $color-warning;
          }

          .alert__title {
            color: $color-warning-dark;
          }
        }

        &--error {
          background: $color-error-light;
          border-color: $color-error;

          .alert__icon {
            color: $color-error;
          }

          .alert__title {
            color: $color-error-dark;
          }
        }

        // Show icon variant
        &--no-icon {
          .alert__icon {
            display: none;
          }
        }

        // Banner style (no border, no rounded corners)
        &--banner {
          border-radius: 0;
          border-left: none;
          border-right: none;
        }

        // Dark theme
        @include dark-theme {
          &--success {
            background: rgba($color-success, 0.15);
            border-color: $color-success;

            .alert__title {
              color: $color-success-hover;
            }
          }

          &--info {
            background: rgba($color-info, 0.15);
            border-color: $color-info;

            .alert__title {
              color: $color-info-hover;
            }
          }

          &--warning {
            background: rgba($color-warning, 0.15);
            border-color: $color-warning;

            .alert__title {
              color: $color-warning-hover;
            }
          }

          &--error {
            background: rgba($color-error, 0.15);
            border-color: $color-error;

            .alert__title {
              color: $color-error-hover;
            }
          }

          .alert__close {
            color: $dark-text-secondary;

            &:hover {
              color: $dark-text-primary;
            }
          }
        }
      }
    `,
  ],
})
export class AlertComponent {
  // ===== INPUTS =====

  /** Тип alert */
  type = input<AlertType>('info');

  /** Заголовок */
  title = input<string>('');

  /** Описание */
  description = input<string>('');

  /** Показывать иконку */
  showIcon = input<boolean>(true);

  /** Closable */
  closable = input<boolean>(false);

  /** Banner style */
  banner = input<boolean>(false);

  // ===== OUTPUTS =====

  /** Событие закрытия */
  closed = output<void>();

  // ===== METHODS =====

  alertClasses(): string {
    const classes: string[] = [];

    // Type
    classes.push(`alert--${this.type()}`);

    // Icon
    if (!this.showIcon()) {
      classes.push('alert--no-icon');
    }

    // Banner
    if (this.banner()) {
      classes.push('alert--banner');
    }

    return classes.join(' ');
  }

  getIcon(): string {
    const iconMap: Record<AlertType, string> = {
      success: 'check-circle',
      info: 'info-circle',
      warning: 'exclamation-circle',
      error: 'close-circle',
    };

    return iconMap[this.type()];
  }

  handleClose(): void {
    this.closed.emit();
  }
}
