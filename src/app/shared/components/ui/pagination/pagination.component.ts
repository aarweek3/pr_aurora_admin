// src/app/shared/components/ui/pagination/pagination.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Pagination Variants
 */
export type PaginationVariant = 'default' | 'simple' | 'compact' | 'minimal';

/**
 * Pagination Sizes
 */
export type PaginationSize = 'small' | 'medium' | 'large';

/**
 * Pagination Shapes (button styles)
 */
export type PaginationShape = 'square' | 'rounded' | 'circle';

/**
 * Pagination Change Event
 */
export interface PaginationChangeEvent {
  page: number;
  pageSize: number;
  range: { start: number; end: number };
  total: number;
}

/**
 * Pagination Component
 *
 * Универсальный компонент пагинации с поддержкой:
 * - Разных вариантов отображения (default, simple, compact, minimal)
 * - Разных размеров (small, medium, large)
 * - Двусторонней привязки через model()
 * - Селектора размера страницы
 * - Быстрого перехода
 * - Локализации
 *
 * Использование:
 * ```html
 * <av-pagination
 *   [total]="100"
 *   [(currentPage)]="page"
 *   [(pageSize)]="size"
 *   (paginationChange)="onPaginationChange($event)">
 * </av-pagination>
 * ```
 */
@Component({
  selector: 'av-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  // ===== INPUTS =====

  /** Общее количество элементов */
  total = input<number>(0);

  /** Вариант отображения */
  variant = input<PaginationVariant>('default');

  /** Размер компонента */
  size = input<PaginationSize>('medium');

  /** Показать селектор размера страницы */
  showSizeChanger = input<boolean>(true);

  /** Опции для выбора размера страницы */
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  /** Показать поле быстрого перехода */
  showQuickJumper = input<boolean>(false);

  /** Показать общее количество */
  showTotal = input<boolean>(true);

  /** Максимум видимых кнопок страниц */
  maxPages = input<number>(7);

  /** Отключить пагинацию */
  disabled = input<boolean>(false);

  /** Скрыть если только одна страница */
  hideOnSinglePage = input<boolean>(false);

  /** Локаль */
  locale = input<'ru' | 'en'>('ru');

  /** Форма кнопок */
  shape = input<PaginationShape>('rounded');

  /** Цветовая схема */
  color = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /** Показать кнопки первой/последней страницы */
  showFirstLast = input<boolean>(true);

  // ===== MODELS (Two-way binding) =====

  /** Текущая страница (1-based) */
  currentPage = model<number>(1);

  /** Количество элементов на странице */
  pageSize = model<number>(10);

  // ===== OUTPUTS =====

  /** Объединенное событие изменения пагинации */
  paginationChange = output<PaginationChangeEvent>();

  // Для обратной совместимости
  pageChange = output<number>();
  pageSizeChange = output<number>();

  // ===== SIGNALS =====

  /** Значение поля быстрого перехода */
  jumpInputValue = signal<string>('');

  // ===== COMPUTED =====

  /** Общее количество страниц */
  totalPages = computed(() => {
    return Math.ceil(this.total() / this.pageSize()) || 1;
  });

  /** Диапазон элементов для текущей страницы */
  range = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.total());
    return { start, end };
  });

  /** Видимые номера страниц с многоточием */
  visiblePages = computed(() => {
    return this.getVisiblePages(this.currentPage(), this.totalPages(), this.maxPages());
  });

  /** Можно ли перейти на предыдущую страницу */
  canGoPrev = computed(() => this.currentPage() > 1);

  /** Можно ли перейти на следующую страницу */
  canGoNext = computed(() => this.currentPage() < this.totalPages());

  /** Скрыть компонент если только одна страница */
  shouldHide = computed(() => {
    return this.hideOnSinglePage() && this.totalPages() <= 1;
  });

  /** Локализованные тексты */
  labels = computed(() => {
    const locale = this.locale();
    return locale === 'ru'
      ? {
          previous: 'Назад',
          next: 'Далее',
          page: 'Страница',
          of: 'из',
          showing: 'Показано',
          jumpTo: 'Перейти к',
          itemsPerPage: 'на странице',
        }
      : {
          previous: 'Previous',
          next: 'Next',
          page: 'Page',
          of: 'of',
          showing: 'Showing',
          jumpTo: 'Go to',
          itemsPerPage: 'per page',
        };
  });

  /** CSS классы для контейнера */
  containerClasses = computed(() => {
    const classes = ['pagination'];

    classes.push(`pagination--${this.variant()}`);
    classes.push(`pagination--${this.size()}`);
    classes.push(`pagination--${this.shape()}`);

    // Добавляем класс цвета только если это не primary (по умолчанию)
    if (this.color() !== 'primary') {
      classes.push(`pagination--color-${this.color()}`);
    }

    if (this.disabled()) {
      classes.push('pagination--disabled');
    }

    return classes.join(' ');
  });

  // ===== METHODS =====

  /** Перейти на страницу */
  goToPage(page: number): void {
    if (this.disabled() || page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.emitChanges();
  }

  /** Предыдущая страница */
  prevPage(): void {
    if (this.canGoPrev()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /** Следующая страница */
  nextPage(): void {
    if (this.canGoNext()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /** Первая страница */
  firstPage(): void {
    this.goToPage(1);
  }

  /** Последняя страница */
  lastPage(): void {
    this.goToPage(this.totalPages());
  }

  /** Изменить размер страницы */
  changePageSize(newSize: number): void {
    if (this.disabled() || newSize === this.pageSize()) {
      return;
    }

    this.pageSize.set(newSize);

    // Пересчитать текущую страницу если она стала невалидной
    const newTotalPages = Math.ceil(this.total() / newSize);
    if (this.currentPage() > newTotalPages) {
      this.currentPage.set(newTotalPages || 1);
    }

    this.emitChanges();
  }

  /** Быстрый переход на страницу */
  onQuickJump(): void {
    const value = this.jumpInputValue();
    let page = parseInt(value, 10);

    // Валидация
    if (isNaN(page) || page < 1) {
      page = 1;
    } else if (page > this.totalPages()) {
      page = this.totalPages();
    }

    this.goToPage(page);
    this.jumpInputValue.set(''); // Очистить поле
  }

  /** Эмитить все события изменения */
  private emitChanges(): void {
    const event: PaginationChangeEvent = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      range: this.range(),
      total: this.total(),
    };

    this.paginationChange.emit(event);
    this.pageChange.emit(this.currentPage());
    this.pageSizeChange.emit(this.pageSize());
  }

  /** Получить видимые страницы с многоточием */
  private getVisiblePages(current: number, total: number, max: number): (number | 'ellipsis')[] {
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfMax = Math.floor(max / 2);

    // Всегда показываем первую страницу
    pages.push(1);

    let start: number;
    let end: number;

    if (current <= halfMax + 1) {
      // Начало списка
      start = 2;
      end = max - 1;
    } else if (current >= total - halfMax) {
      // Конец списка
      start = total - max + 2;
      end = total - 1;
    } else {
      // Середина списка
      start = current - halfMax + 1;
      end = current + halfMax - 1;
    }

    // Добавить многоточие после первой страницы если нужно
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Добавить видимые страницы
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Добавить многоточие перед последней страницей если нужно
    if (end < total - 1) {
      pages.push('ellipsis');
    }

    // Всегда показываем последнюю страницу
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  }

  /** Проверка является ли элемент многоточием */
  isEllipsis(item: number | 'ellipsis'): boolean {
    return item === 'ellipsis';
  }

  /** Получить номер страницы как число */
  asNumber(item: number | 'ellipsis'): number {
    return item as number;
  }
}
