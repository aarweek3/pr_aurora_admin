// src/app/shared/components/ui/button/button.component.ts
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Button Types
 */
export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger';

/**
 * Button Sizes
 */
export type ButtonSize = 'small' | 'default' | 'large';

/**
 * Button Component
 *
 * Универсальная кнопка с поддержкой:
 * - Разных типов (primary, default, dashed, text, link, danger)
 * - Разных размеров (small, default, large)
 * - Состояний (loading, disabled)
 * - Иконок (prefix, suffix, icon-only)
 * - BEM классов для стилизации
 *
 * Использование:
 * ```html
 * <app-button type="primary" size="large" [loading]="isLoading()" (clicked)="handleClick()">
 *   Сохранить
 * </app-button>
 *
 * <app-button type="danger" icon="delete" [iconOnly]="true" (clicked)="handleDelete()" />
 * ```
 *
 * Согласно SOW (ЧАСТЬ 6.3):
 * - Используем BEM классы (.button, .button--primary, .button__icon)
 * - НЕ используем прямое переопределение .ant-btn
 * - Опционально используем nz-button внутри как основу
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <button
      class="button"
      [class]="buttonClasses()"
      [type]="htmlType()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)"
    >
      <!-- Loading Spinner -->
      @if (loading()) {
      <span class="button__icon button__icon--loading" nz-icon nzType="loading"></span>
      }

      <!-- Icon (prefix) -->
      @if (icon() && !iconOnly() && !loading()) {
      <span class="button__icon button__icon--prefix" nz-icon [nzType]="icon()!"></span>
      }

      <!-- Icon Only -->
      @if (iconOnly() && icon() && !loading()) {
      <span class="button__icon" nz-icon [nzType]="icon()!"></span>
      }

      <!-- Content (text) -->
      @if (!iconOnly()) {
      <span class="button__content">
        <ng-content></ng-content>
      </span>
      }

      <!-- Icon (suffix) -->
      @if (suffixIcon() && !loading()) {
      <span class="button__icon button__icon--suffix" nz-icon [nzType]="suffixIcon()!"></span>
      }
    </button>
  `,
  styles: [
    `
      @use 'sass:color';
      @use '../../../../../styles/abstracts/variables' as *;
      @use '../../../../../styles/abstracts/mixins' as *;

      .button {
        @include reset-button;
        @include flex-layout(center, center);
        gap: $spacing-sm;

        // Base styles
        position: relative;
        display: inline-flex;
        font-weight: $font-weight-normal;
        text-align: center;
        white-space: nowrap;
        border: $border-width-base solid transparent;
        border-radius: $border-radius-base;
        cursor: pointer;
        transition: $transition-base;
        user-select: none;

        // Размеры по умолчанию
        height: $button-height-base;
        padding: 0 $button-padding-horizontal-base;
        font-size: $font-size-base;
        line-height: 1.5;

        &:focus-visible {
          @include focus-ring;
        }

        // === TYPE VARIANTS ===

        // Default
        &--default {
          background: $color-white;
          border-color: $color-border-base;
          color: $color-text-primary;

          &:hover:not(:disabled) {
            color: $color-primary-hover;
            border-color: $color-primary-hover;
          }

          &:active:not(:disabled) {
            color: $color-primary-active;
            border-color: $color-primary-active;
          }
        }

        // Primary
        &--primary {
          background: $color-primary;
          border-color: $color-primary;
          color: $color-white;
          box-shadow: $shadow-sm;

          &:hover:not(:disabled) {
            background: $color-primary-hover;
            border-color: $color-primary-hover;
            transform: translateY(-1px);
            box-shadow: $shadow-md;
          }

          &:active:not(:disabled) {
            background: $color-primary-active;
            border-color: $color-primary-active;
            transform: translateY(0);
            box-shadow: $shadow-sm;
          }
        }

        // Dashed
        &--dashed {
          background: $color-white;
          border-style: dashed;
          border-color: $color-border-base;
          color: $color-text-primary;

          &:hover:not(:disabled) {
            color: $color-primary-hover;
            border-color: $color-primary-hover;
          }

          &:active:not(:disabled) {
            color: $color-primary-active;
            border-color: $color-primary-active;
          }
        }

        // Text
        &--text {
          background: transparent;
          border-color: transparent;
          color: $color-text-primary;

          &:hover:not(:disabled) {
            background: $color-bg-gray;
            color: $color-primary-hover;
          }

          &:active:not(:disabled) {
            background: color.scale($color-bg-gray, $lightness: -5.2040816327%);
            color: $color-primary-active;
          }
        }

        // Link
        &--link {
          background: transparent;
          border-color: transparent;
          color: $color-primary;
          padding: 0;
          height: auto;

          &:hover:not(:disabled) {
            color: $color-primary-hover;
            text-decoration: underline;
          }

          &:active:not(:disabled) {
            color: $color-primary-active;
          }
        }

        // Danger
        &--danger {
          background: $color-error;
          border-color: $color-error;
          color: $color-white;

          &:hover:not(:disabled) {
            background: $color-error-hover;
            border-color: $color-error-hover;
            transform: translateY(-1px);
            box-shadow: $shadow-md;
          }

          &:active:not(:disabled) {
            background: $color-error-active;
            border-color: $color-error-active;
            transform: translateY(0);
            box-shadow: $shadow-sm;
          }
        }

        // === SIZE VARIANTS ===

        &--small {
          height: $button-height-sm;
          padding: 0 $button-padding-horizontal-sm;
          font-size: $font-size-sm;
        }

        &--large {
          height: $button-height-lg;
          padding: 0 $button-padding-horizontal-lg;
          font-size: $font-size-md;
        }

        // === STATE MODIFIERS ===

        &--loading {
          cursor: default;
          pointer-events: none;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          background: $color-bg-gray;
          border-color: $color-border-base;
          color: $color-text-disabled;
          box-shadow: none;
          transform: none;
        }

        // === ICON VARIANTS ===

        &--icon-only {
          width: $button-height-base;
          padding: 0;

          &.button--small {
            width: $button-height-sm;
          }

          &.button--large {
            width: $button-height-lg;
          }
        }

        // === BLOCK VARIANT ===

        &--block {
          display: flex;
          width: 100%;
        }

        // === ICON SPACING ===

        &__icon {
          display: inline-flex;
          align-items: center;

          &--loading {
            animation: spin 1s linear infinite;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        &__content {
          display: inline-flex;
          align-items: center;
        }

        // === DARK THEME ===

        @include dark-theme {
          &--default {
            background: $dark-bg-light;
            border-color: $dark-border-base;
            color: $dark-text-primary;

            &:hover:not(:disabled) {
              background: $dark-bg-gray;
            }
          }

          &--text {
            color: $dark-text-primary;

            &:hover:not(:disabled) {
              background: $dark-bg-gray;
            }
          }

          &:disabled {
            background: $dark-bg-gray;
            border-color: $dark-border-base;
            color: $dark-text-tertiary;
          }
        }
      }
    `,
  ],
})
export class ButtonComponent {
  // ===== INPUTS =====

  /** Тип кнопки */
  type = input<ButtonType>('default');

  /** Размер кнопки */
  size = input<ButtonSize>('default');

  /** HTML тип кнопки */
  htmlType = input<'button' | 'submit' | 'reset'>('button');

  /** Иконка (prefix или icon-only) */
  icon = input<string | null>(null);

  /** Иконка после текста */
  suffixIcon = input<string | null>(null);

  /** Только иконка (без текста) */
  iconOnly = input<boolean>(false);

  /** Состояние загрузки */
  loading = input<boolean>(false);

  /** Disabled состояние */
  disabled = input<boolean>(false);

  /** Блочная кнопка (100% ширины) */
  block = input<boolean>(false);

  // ===== OUTPUTS =====

  /** Событие клика */
  clicked = output<MouseEvent>();

  // ===== COMPUTED =====

  /** Собрать CSS классы на основе inputs */
  buttonClasses() {
    const classes: string[] = [];

    // Type
    classes.push(`button--${this.type()}`);

    // Size
    if (this.size() !== 'default') {
      classes.push(`button--${this.size()}`);
    }

    // States
    if (this.loading()) {
      classes.push('button--loading');
    }

    if (this.iconOnly()) {
      classes.push('button--icon-only');
    }

    if (this.block()) {
      classes.push('button--block');
    }

    return classes.join(' ');
  }

  // ===== METHODS =====

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
