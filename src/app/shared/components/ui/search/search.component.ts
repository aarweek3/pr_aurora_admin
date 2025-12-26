import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../button/button.directive';
import { InputDirective } from '../input/input.directive';

/**
 * Standard Live Search Component
 *
 * Компонент поиска с живой фильтрацией, кнопкой очистки и кнопкой принудительного поиска.
 * Реализован согласно ТЗ "Standard Live Search".
 */
@Component({
  selector: 'av-search',
  standalone: true,
  imports: [CommonModule, FormsModule, InputDirective, ButtonDirective],
  template: `
    <div class="av-search" [class.av-search--large]="avSize() === 'large'">
      <div class="av-search__input-wrapper">
        <span class="av-search__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>

        <input
          #searchInput
          type="text"
          avInput
          [avSize]="avSize()"
          [avVariant]="avVariant()"
          [avStatus]="avStatus()"
          [avShape]="avShape()"
          [avDashed]="avDashed()"
          [avBlock]="true"
          [avWidth]="avWidth()"
          [avHeight]="avHeight()"
          [avRadius]="avRadius()"
          [placeholder]="avPlaceholder()"
          [value]="value()"
          (input)="onInputChange($event)"
          (keydown.enter)="onSearchClick()"
          (keydown.escape)="onClearClick()"
          class="av-search__input"
        />

        @if (value().length > 0) {
        <button
          class="av-search__clear"
          (click)="onClearClick()"
          type="button"
          aria-label="Очистить"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        }
      </div>

      <button
        av-button
        avType="primary"
        [avSize]="getButtonSize()"
        (click)="onSearchClick()"
        class="av-search__button"
      >
        {{ avButtonText() }}
      </button>
    </div>
  `,
  styles: [
    `
      @use '../../../../../styles/abstracts/variables' as *;
      @use '../../../../../styles/abstracts/mixins' as *;

      .av-search {
        display: flex;
        gap: 8px;
        align-items: center;
        width: 100%;

        &__input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        &__input {
          width: 100%;
          padding-left: 40px !important;
          padding-right: 40px !important;
        }

        &__icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(0, 0, 0, 0.45);
          pointer-events: none;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        &__clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: rgba(0, 0, 0, 0.25);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 1;

          &:hover {
            color: rgba(0, 0, 0, 0.45);
            background-color: rgba(0, 0, 0, 0.05);
          }
        }

        &__button {
          flex-shrink: 0;
        }

        @include dark-theme {
          &__icon {
            color: rgba(255, 255, 255, 0.45);
          }
          &__clear {
            color: rgba(255, 255, 255, 0.25);
            &:hover {
              color: rgba(255, 255, 255, 0.45);
              background-color: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }
    `,
  ],
})
export class SearchInputComponent {
  // Inputs
  avPlaceholder = input<string>('Поиск...');
  avButtonText = input<string>('Найти');
  avSize = input<'small' | 'default' | 'large' | 'x-large'>('default');
  avVariant = input<'outlined' | 'filled' | 'borderless'>('outlined');
  avShape = input<'default' | 'rounded' | 'rounded-big'>('default');
  avStatus = input<'default' | 'error' | 'warning' | 'success'>('default');
  avBlock = input<boolean>(false);
  avDashed = input<boolean>(false);

  // Custom dimensions
  avWidth = input<string | number | null>(null);
  avHeight = input<string | number | null>(null);
  avRadius = input<string | number | null>(null);
  avVisible = input<boolean>(true);

  avDebounceTime = input<number>(300);

  // Value model (two-way binding)
  value = model<string>('');

  // Search event
  onSearch = output<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private debounceTimer: any;

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);

    // Live search with debounce
    this.resetTimer();
    this.debounceTimer = setTimeout(() => {
      this.onSearch.emit(this.value().trim());
    }, this.avDebounceTime());
  }

  onSearchClick(): void {
    this.resetTimer();
    this.onSearch.emit(this.value().trim());
  }

  onClearClick(): void {
    this.resetTimer();
    this.value.set('');
    this.onSearch.emit('');
    this.searchInput.nativeElement.focus();
  }

  getButtonSize(): 'small' | 'default' | 'large' {
    return this.avSize() === 'x-large' ? 'large' : (this.avSize() as 'small' | 'default' | 'large');
  }

  private resetTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
