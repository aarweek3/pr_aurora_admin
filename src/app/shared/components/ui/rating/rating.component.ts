import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * AvRatingComponent
 *
 * Компонент для отображения рейтинга в виде 5 звезд.
 * Использует метод CSS linear-gradient и mask-image для закрашивания внутри одной иконки.
 * Это минимизирует количество элементов в DOM.
 */
@Component({
  selector: 'av-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="av-rating" [style.--av-rating-size.px]="size">
      <div class="stars-container">
        <div
          *ngFor="let star of stars; let i = index"
          class="star-item"
          [style.background]="getStarGradient(i)"
        ></div>
      </div>

      <span class="rating-value" *ngIf="showValue">
        {{ value | number: '1.1-1' }}
      </span>
    </div>
  `,
  styles: [
    `
      .av-rating {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        line-height: 1;
      }

      .stars-container {
        display: flex;
        gap: 2px;
      }

      .star-item {
        width: var(--av-rating-size);
        height: var(--av-rating-size);

        /* Используем SVG-маску в форме звезды */
        /* Путь соответствует стандартной иконке star из Ant Design */
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='64 64 896 896'%3E%3Cpath d='M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 3.1-17.5-8.8-34-26.3-37.1z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='64 64 896 896'%3E%3Cpath d='M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 3.1-17.5-8.8-34-26.3-37.1z'/%3E%3C/svg%3E");

        -webkit-mask-size: contain;
        mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;

        transition: background 0.3s ease;
      }

      .rating-value {
        font-weight: 600;
        color: #595959;
        font-size: calc(var(--av-rating-size) * 0.85);
        margin-left: 4px;
      }
    `,
  ],
})
export class AvRatingComponent {
  /** Текущее значение рейтинга (0-5) */
  @Input() value = 0;

  /** Максимальное количество звезд */
  @Input() total = 5;

  /** Размер звезды в пикселях */
  @Input() size = 18;

  /** Показывать ли числовое значение рядом */
  @Input() showValue = false;

  /** Цвет закрашенной части (по умолчанию золотой) */
  @Input() color = '#fadb14';

  /** Массив для итерации звезд */
  stars = [0, 1, 2, 3, 4];

  /** Константы цветов */
  private readonly COLOR_INACTIVE = '#e8e8e8';

  /**
   * Генерирует строку градиента для конкретной звезды
   * @param index Индекс звезды
   */
  getStarGradient(index: number): string {
    const diff = this.value - index;
    let percent = 0;

    if (diff >= 1) percent = 100;
    else if (diff > 0) percent = diff * 100;

    // Создаем резкий переход (hard edge) для градиента
    return `linear-gradient(to right, ${this.color} ${percent}%, ${this.COLOR_INACTIVE} ${percent}%)`;
  }
}
