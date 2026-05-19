import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  input,
  model,
  Output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { InputDirective } from './input.directive';

@Component({
  selector: 'av-input',
  standalone: true,
  imports: [CommonModule, InputDirective, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="av-input-wrapper"
      [class.av-input-wrapper--block]="block()"
      [style.display]="visible() ? null : 'none'"
    >
      @if (label()) {
        <label [for]="effectiveId" class="av-input-wrapper__label">{{ label() }}</label>
      }

      <div
        class="av-input-container"
        [class.av-input-container--with-toggle]="type() === 'password' && showPasswordToggle()"
        [class.av-input-container--with-prefix]="prefixIcon()"
        [class.av-input-container--with-suffix]="suffixIcon()"
        [style.--av-prefix-icon-size]="getPrefixIconSize() + 'px'"
        [style.--av-prefix-icon-color]="iconColor() || prefixIconColor()"
        [style.--av-suffix-icon-size]="getSuffixIconSize() + 'px'"
        [style.--av-suffix-icon-color]="iconColor() || suffixIconColor()"
      >
        @if (prefixIcon()) {
          <div class="av-input-prefix">
            <av-icon
              [type]="prefixIcon()!"
              [size]="getPrefixIconSize()"
              [color]="iconColor() || prefixIconColor()"
            ></av-icon>
          </div>
        }

        <input
          [id]="effectiveId"
          [type]="getInputType()"
          avInput
          [avSize]="size()"
          [avStatus]="status()"
          [avVariant]="variant()"
          [avWidth]="width()"
          [avHeight]="height()"
          [avRadius]="radius()"
          [avVisible]="visible()"
          [avBlock]="block()"
          [avBlock]="block()"
          [avShape]="shape()"
          [avDashed]="dashed()"
          [avIconSize]="iconSize()"
          [avIconColor]="iconColor()"
          [avPrefixIconSize]="prefixIconSize()"
          [avPrefixIconColor]="prefixIconColor()"
          [avSuffixIconSize]="suffixIconSize()"
          [avSuffixIconColor]="suffixIconColor()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [style.padding-left]="prefixIcon() ? getIconPadding() : null"
          [style.padding-right]="
            suffixIcon() || (type() === 'password' && showPasswordToggle())
              ? getIconPaddingRight()
              : null
          "
          [value]="value()"
          (input)="onInput($event)"
        />

        @if (suffixIcon() && !(type() === 'password' && showPasswordToggle())) {
          <div class="av-input-suffix">
            <av-icon
              [type]="suffixIcon()!"
              [size]="getSuffixIconSize()"
              [color]="iconColor() || suffixIconColor()"
            ></av-icon>
          </div>
        }
        @if (type() === 'password' && showPasswordToggle()) {
          <button
            type="button"
            class="av-input-toggle"
            [class.av-input-toggle--small]="size() === 'small'"
            [class.av-input-toggle--large]="size() === 'large'"
            [class.av-input-toggle--x-large]="size() === 'x-large'"
            (click)="togglePasswordVisibility()"
            [disabled]="disabled()"
            [attr.aria-label]="passwordVisible() ? 'Скрыть пароль' : 'Показать пароль'"
          >
            @if (passwordVisible()) {
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
        }
      </div>

      @if (hint() && !errorMessage()) {
        <span class="av-input-wrapper__hint">{{ hint() }}</span>
      }
      @if (errorMessage() && status() === 'error') {
        <span class="av-input-wrapper__error">{{ errorMessage() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .av-input-container {
        position: relative;
        display: flex;
        align-items: center;

        .av-input-prefix,
        .av-input-suffix {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 0, 0, 0.45);
          pointer-events: none;
          z-index: 1;
          transition: all 0.3s;

          av-icon,
          .anticon,
          nz-icon {
            font-size: var(--av-input-icon-size, inherit);
            display: inline-flex;
            align-items: center;
            justify-content: center;

            svg {
              width: var(--av-input-icon-size, inherit) !important;
              height: var(--av-input-icon-size, inherit) !important;
            }
          }
        }

        .av-input-prefix {
          left: 12px;
          av-icon,
          .anticon,
          nz-icon {
            font-size: var(--av-prefix-icon-size, inherit);
            svg {
              width: var(--av-prefix-icon-size, inherit) !important;
              height: var(--av-prefix-icon-size, inherit) !important;
            }
          }
        }

        .av-input-suffix {
          right: 12px;
          av-icon,
          .anticon,
          nz-icon {
            font-size: var(--av-suffix-icon-size, inherit);
            svg {
              width: var(--av-suffix-icon-size, inherit) !important;
              height: var(--av-suffix-icon-size, inherit) !important;
            }
          }
        }
      }

      .av-input-container--with-toggle .av-input-toggle {
        z-index: 2;
      }

      .av-input-toggle {
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
        padding: 0;

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

        &--small {
          width: 24px;
          height: 24px;

          svg {
            width: 16px;
            height: 16px;
          }
        }

        &--large {
          width: 36px;
          height: 36px;

          svg {
            width: 22px;
            height: 22px;
          }
        }

        &--x-large {
          width: 40px;
          height: 40px;

          svg {
            width: 24px;
            height: 24px;
          }
        }

        svg {
          display: block;
        }
      }

      @media (prefers-color-scheme: dark) {
        .av-input-prefix,
        .av-input-suffix {
          color: rgba(255, 255, 255, 0.45);
        }

        .av-input-toggle {
          color: rgba(255, 255, 255, 0.45);

          &:hover:not(:disabled) {
            background-color: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.65);
          }

          &:active:not(:disabled) {
            background-color: rgba(255, 255, 255, 0.12);
          }
        }
      }
    `,
  ],
})
export class InputComponent implements ControlValueAccessor {
  value = model<string>('');
  @Output() valueChange = new EventEmitter<string>(); // Keep for compatibility if needed, but model handles it
  label = input<string>('');
  type = input<
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'color'
  >('text');
  placeholder = input<string>('');
  size = input<'small' | 'default' | 'large' | 'x-large'>('default');
  status = input<'default' | 'error' | 'warning' | 'success'>('default');
  variant = input<'outlined' | 'filled' | 'borderless'>('outlined');
  errorMessage = input<string>('');
  hint = input<string>('');
  disabled = input<boolean>(false);
  showPasswordToggle = input<boolean>(true);

  // Custom dimensions
  width = input<string | number | null>(null);
  height = input<string | number | null>(null);
  radius = input<string | number | null>(null);

  /** Видимость компонента */
  visible = input<boolean>(true);

  /** Растягивание на всю ширину контейнера */
  block = input<boolean>(false);

  /** Форма (скругление) */
  shape = input<'default' | 'rounded' | 'rounded-big'>('default');

  dashed = input<boolean>(false);

  /** Иконка в начале */
  prefixIcon = input<string | null>(null);

  /** Иконка в конце */
  suffixIcon = input<string | null>(null);

  /** Общий размер иконок (fallback) */
  iconSize = input<number | null>(null);

  /** Размер префиксной иконки */
  prefixIconSize = input<number | null>(null);

  /** Размер суффиксной иконки */
  suffixIconSize = input<number | null>(null);

  /** Кастомный цвет иконки (для обоих, если задан) */
  iconColor = input<string | null>(null);

  /** Цвет префиксной иконки */
  prefixIconColor = input<string | null>(null);

  /** Цвет суффиксной иконки */
  suffixIconColor = input<string | null>(null);

  private el = inject(ElementRef);
  generatedId = `av-input-${Math.random().toString(36).substring(2, 9)}`;

  get effectiveId(): string {
    return this.el.nativeElement.id || this.generatedId;
  }
  passwordVisible = signal(false);
  private onChange?: (value: string) => void;
  private onTouched?: () => void;

  getInputType(): string {
    if (this.type() === 'password' && this.passwordVisible()) {
      return 'text';
    }
    return this.type();
  }

  togglePasswordVisibility(): void {
    console.log('🔑 Toggle password visibility:', !this.passwordVisible());
    this.passwordVisible.update((v) => !v);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.valueChange.emit(value);
    this.onChange?.(value);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }



  getPrefixIconSize(): number {
    return this.prefixIconSize() || this.iconSize() || this.getEffectiveIconSize();
  }

  getSuffixIconSize(): number {
    return this.suffixIconSize() || this.iconSize() || this.getEffectiveIconSize();
  }

  getEffectiveIconSize(): number {
    switch (this.size()) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      case 'x-large':
        return 22;
      default:
        return 16;
    }
  }

  getIconPadding(): string {
    const iconSize = this.getPrefixIconSize();
    return `${iconSize + 20}px`;
  }

  getIconPaddingRight(): string {
    let padding = 12; // default base padding
    const isPasswordWithToggle = this.type() === 'password' && this.showPasswordToggle();

    if (isPasswordWithToggle) {
      padding += 32; // width of the toggle button
    } else if (this.suffixIcon()) {
      padding += this.getSuffixIconSize() + 8;
    }

    return `${padding}px`;
  }
}
