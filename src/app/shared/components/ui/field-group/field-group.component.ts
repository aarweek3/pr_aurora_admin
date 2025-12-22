import { Component, computed, input, model } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'av-field-group',
  standalone: true,
  imports: [IconComponent],
  host: {
    '[attr.variant]': 'variant()',
    '[attr.size]': 'size()',
    '[style.--av-fg-label-color]': 'labelColor()',
    '[style.--av-fg-label-color-hover]': 'labelColorHover()',
    '[style.--av-fg-arrow-color]': 'arrowColor()',
    '[style.--av-fg-arrow-color-hover]': 'arrowColorHover()',
    '[style.--av-fg-border-color]': 'borderColor()',
    '[style.--av-fg-border-color-hover]': 'borderColorHover()',
    '[style.--av-fg-header-bg]': 'headerBgColor()',
    '[style.--av-fg-header-bg-hover]': 'headerBgColorHover()',
    '[style.--av-fg-content-bg]': 'showBackground() ? contentBackground() : "transparent"',
    '[style.--av-fg-content-bg-hover]':
      'hoverBackground() === "intensify" ? contentBackgroundHover() : (showBackground() ? contentBackground() : "transparent")',
    '[style.--av-fg-radius]': 'effectiveRadius()',
  },
  template: `
    <div class="av-field-group" [class.is-collapsed]="isCollapsed()">
      @if (label() || collapsible()) {
      <div
        class="av-field-group__header"
        (click)="toggleCollapse()"
        [class.is-clickable]="collapsible()"
        [class.is-empty]="!label()"
      >
        @if (label()) {
        <span class="av-field-group__label">{{ label() }}</span>
        } @if (collapsible()) {
        <button class="av-field-group__toggle" type="button">
          <av-icon
            [type]="isCollapsed() ? 'arrows/av_chevron-down' : 'arrows/av_chevron-up'"
            [size]="14"
          ></av-icon>
        </button>
        }
      </div>
      }
      <div class="av-field-group__content" [hidden]="isCollapsed()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './field-group.component.scss',
})
export class FieldGroupComponent {
  /**
   * Текст метки для группы полей
   */
  label = input<string>();

  /**
   * Можно ли сворачивать группу
   */
  collapsible = input<boolean>(false);

  /**
   * Состояние свернутости
   */
  isCollapsed = model<boolean>(false);

  /**
   * Вариант отображения группы
   * - 'block': растягиваемый блок (по умолчанию)
   * - 'default': обычная рамка с фоном
   * - 'minimal': пунктирная рамка без фона
   * - 'filled': заливка без рамки
   * - 'highlighted': выделенная рамка
   */
  variant = input<'block' | 'default' | 'minimal' | 'filled' | 'highlighted'>('block');

  /**
   * Размер группы полей
   */
  size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * Показывать ли фон области
   */
  showBackground = input<boolean>(false);

  /**
   * Поведение фона при наведении
   * - 'none': не меняется
   * - 'intensify': появляется или становится насыщеннее
   */
  hoverBackground = input<'none' | 'intensify'>('none');

  // Кастомные цвета
  contentBackground = input<string>('rgba(24, 144, 255, 0.02)');
  contentBackgroundHover = input<string>('rgba(24, 144, 255, 0.05)');
  labelColor = input<string>('');
  labelColorHover = input<string>('');
  arrowColor = input<string>('');
  arrowColorHover = input<string>('');
  borderColor = input<string>('');
  borderColorHover = input<string>('');
  headerBgColor = input<string>('');
  headerBgColorHover = input<string>('');

  /**
   * Форма (предустановленные стили скругления)
   */
  shape = input<'square' | 'default' | 'rounded' | 'rounded-big'>('default');

  /**
   * Пользовательский радиус скругления (перекрывает shape)
   */
  radius = input<string | number | null>(null);

  /**
   * Вычисляемое значение радиуса для CSS
   */
  effectiveRadius = computed(() => {
    if (this.radius() !== null) {
      return this.formatDimension(this.radius());
    }

    switch (this.shape()) {
      case 'square':
        return '0px';
      case 'rounded':
        return '8px';
      case 'rounded-big':
        return '16px';
      default:
        return '4px'; // Значение для 'default'
    }
  });

  toggleCollapse(): void {
    if (this.collapsible()) {
      this.isCollapsed.set(!this.isCollapsed());
    }
  }

  private formatDimension(value: string | number | null): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return `${value}px`;
    if (/^\d+$/.test(value)) return `${value}px`;
    return value;
  }
}
