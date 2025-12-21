// src/app/shared/components/ui/toggle/toggle-labeled.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Labeled Toggle Component
 * Toggle switch with text labels inside (iOS style)
 * Supports two-way data binding and reactive forms
 */
@Component({
  selector: 'av-toggle-labeled',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="av-toggle-labeled"
      [class.av-toggle-labeled--small]="size() === 'small'"
      [class.av-toggle-labeled--default]="size() === 'default'"
      [class.av-toggle-labeled--large]="size() === 'large'"
      [class.av-toggle-labeled--square]="shape() === 'square'"
      [style.--av-toggle-color]="thumbColor()"
      [style.width]="width() ? (typeof width() === 'number' ? width() + 'px' : width()) : null"
      [style.--av-labeled-h]="height() ? (typeof height() === 'number' ? height() + 'px' : height()) : null"
      [style.--av-labeled-r]="radius() ? (typeof radius() === 'number' ? radius() + 'px' : radius()) : null"
      [style.--av-labeled-off]="offset() + 'px'"
    >
      <input
        type="checkbox"
        [id]="inputId"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onToggleChange($event)"
        class="av-toggle-labeled__input"
      />
      <label [for]="inputId" class="av-toggle-labeled__track">
        <span class="av-toggle-labeled__label av-toggle-labeled__label--left">
          {{ leftLabel() }}
        </span>
        <span class="av-toggle-labeled__label av-toggle-labeled__label--right">
          {{ rightLabel() }}
        </span>
        <span class="av-toggle-labeled__thumb" [style.background]="thumbColor()"></span>
      </label>
    </div>
  `,
  styles: `
    .av-toggle-labeled {
      display: inline-block;
      position: relative;
    }

    .av-toggle-labeled--square .av-toggle-labeled__track,
    .av-toggle-labeled--square .av-toggle-labeled__thumb {
      border-radius: 0 !important;
    }

    .av-toggle-labeled__input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .av-toggle-labeled__track {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      border-radius: var(--av-labeled-r, 20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      width: 100%;
      height: var(--av-labeled-h, 44px);
    }

    .av-toggle-labeled__thumb {
      position: absolute;
      left: var(--av-labeled-off, 2px);
      top: var(--av-labeled-off, 2px);
      height: calc(var(--av-labeled-h, 44px) - (var(--av-labeled-off, 2px) * 2));
      width: calc(50% - var(--av-labeled-off, 2px));
      background: var(--av-toggle-color, #2196f3);
      border-radius: var(--av-labeled-r, 18px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* Checked state translation: move by its own width */
    .av-toggle-labeled__input:checked + .av-toggle-labeled__track .av-toggle-labeled__thumb {
       transform: translateX(100%);
    }

    /* Size Presets */
    .av-toggle-labeled--default {
      --av-labeled-h: 44px;
      --av-labeled-r: 22px;
      --av-labeled-off: 3px;
      .av-toggle-labeled__track { width: 140px; }
      .av-toggle-labeled__label { font-size: 14px; font-weight: 500; }
    }

    .av-toggle-labeled--small {
      --av-labeled-h: 30px;
      --av-labeled-r: 15px;
      --av-labeled-off: 2px;
      .av-toggle-labeled__track { width: 100px; }
      .av-toggle-labeled__label { font-size: 11px; font-weight: 500; }
    }

    .av-toggle-labeled--large {
      --av-labeled-h: 56px;
      --av-labeled-r: 28px;
      --av-labeled-off: 4px;
      .av-toggle-labeled__track { width: 180px; }
      .av-toggle-labeled__label { font-size: 18px; font-weight: 600; }
    }
    /* Track colors - unchecked state */
    .av-toggle-labeled__track {
      background: #e0e0e0;
      border: 1px solid #d0d0d0;
    }

    .av-toggle-labeled__label {
      position: relative;
      z-index: 1;
      flex: 1;
      text-align: center;
      transition: all 0.3s ease;
      color: #666;
    }

    .av-toggle-labeled__label--left {
      color: #fff;
    }

    /* Checked state track/label adjustment */
    .av-toggle-labeled__input:checked + .av-toggle-labeled__track {
      background: #e0e0e0;
    }

    .av-toggle-labeled__input:checked + .av-toggle-labeled__track .av-toggle-labeled__label--left {
      color: #666;
    }

    .av-toggle-labeled__input:checked + .av-toggle-labeled__track .av-toggle-labeled__label--right {
      color: #fff;
    }

    /* Focus state */
    .av-toggle-labeled__input:focus-visible + .av-toggle-labeled__track {
      outline: 2px solid #2196f3;
      outline-offset: 2px;
    }

    /* Disabled state */
    .av-toggle-labeled__input:disabled + .av-toggle-labeled__track {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f5f5f5;
    }

    .av-toggle-labeled__input:disabled + .av-toggle-labeled__track .av-toggle-labeled__thumb {
      background: #999;
    }

    /* Dark theme support */
    [data-theme='dark'] {
      .av-toggle-labeled__track {
        background: #333;
        border-color: #555;
      }

      .av-toggle-labeled__label {
        color: #999;
      }

      .av-toggle-labeled__label--left {
        color: #fff;
      }

      .av-toggle-labeled__input:checked + .av-toggle-labeled__track {
        background: #333;
      }

      .av-toggle-labeled__input:checked + .av-toggle-labeled__track .av-toggle-labeled__label--left {
        color: #999;
      }

      .av-toggle-labeled__input:checked + .av-toggle-labeled__track .av-toggle-labeled__label--right {
        color: #fff;
      }

      .av-toggle-labeled__input:disabled + .av-toggle-labeled__track {
        background: #1a1a1a;
      }
    }

    /* Animation for reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .av-toggle-labeled__track,
      .av-toggle-labeled__thumb,
      .av-toggle-labeled__label {
        transition: none;
      }
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleLabeledComponent),
      multi: true,
    },
  ],
})
export class ToggleLabeledComponent implements ControlValueAccessor {
  leftLabel = input('OFF');
  rightLabel = input('ON');
  checked = model<boolean>(false);
  disabled = input<boolean>(false);
  size = input<'small' | 'default' | 'large'>('default');
  shape = input<'default' | 'square'>('default');
  color = input<string | 'primary' | 'success' | 'warning' | 'danger'>('primary');
  width = input<string | number | null>(null);
  height = input<string | number | null>(null);
  radius = input<string | number | null>(null);

  offset = computed(() => {
    const h = this.height();
    if (h) {
      const hNum = typeof h === 'number' ? h : parseInt(h.toString());
      return hNum > 40 ? 4 : hNum > 25 ? 3 : 2;
    }
    // Fallbacks based on size preset
    if (this.size() === 'large') return 4;
    if (this.size() === 'default') return 3;
    return 2;
  });

  typeof = (val: any) => typeof val;

  thumbColor = computed(() => {
    switch (this.color()) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'danger':
        return '#ff4d4f';
      case 'primary':
        return '#1890ff';
      default:
        return this.color();
    }
  });

  inputId = `av-toggle-labeled-${Math.random().toString(36).substr(2, 9)}`;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.checked;
    this.checked.set(newValue);
    this.onChange(newValue);
    this.onTouched();
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
    // Read-only in signals
  }
}
