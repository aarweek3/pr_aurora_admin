import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent } from '../../../icon/icon.component';
import { modalAnimation } from '../../animations/modal.animations';
import { ModalPosition, ModalSize } from '../../models/modal-config.model';
import { MODAL_DATA } from '../../tokens/modal-tokens';

/**
 * Базовый компонент модального окна
 * ПРИМЕЧАНИЕ: Это простая версия для декларативного использования
 * Для программного открытия с полной поддержкой CDК используйте ModalService
 *
 * @example
 * ```html
 * <av-modal
 *   [(isOpen)]="showModal"
 *   title="Заголовок"
 *   subtitle="Подзаголовок"
 *   size="medium">
 *
 *   <div modal-body>
 *     <p>Содержимое модала</p>
 *   </div>
 *
 *   <div modal-footer>
 *     <button (click)="showModal = false">Закрыть</button>
 *   </div>
 * </av-modal>
 * ```
 */
@Component({
  selector: 'av-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, DragDropModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [modalAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('modalContainer') modalContainer?: ElementRef;

  private _isOpen = false;

  /** Открыт ли модал */
  @Input()
  set isOpen(value: boolean) {
    if (this._isOpen === value) return;
    this._isOpen = value;

    if (value) {
      this.onOpen();
    } else {
      this.removeBodyScrollLock();
    }
    this.isOpenChange.emit(value);
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  /** Размер модала */
  @Input() size: ModalSize = 'medium';

  /** Позиция модала */
  @Input() position: ModalPosition = 'center';

  /** Заголовок */
  @Input() title?: string;

  /** Подзаголовок */
  @Input() subtitle?: string;

  /** Показывать кнопку закрытия */
  @Input() showCloseButton = true;

  /** Показывать backdrop */
  @Input() showBackdrop = true;

  /** Закрывать по клику на backdrop */
  @Input() closeOnBackdrop = true;

  /** Закрывать по ESC */
  @Input() closeOnEsc = true;

  /** Fullscreen на мобильных */
  @Input() mobileFullscreen = true;

  /** Breakpoint для мобильной версии */
  @Input() mobileBreakpoint = 768;

  /** Hook перед закрытием */
  @Input() beforeClose?: (result?: any) => boolean | Promise<boolean>;

  /** Состояние загрузки */
  @Input() loading = false;

  /** Блокировать footer при loading */
  @Input() disableFooterWhileLoading = true;

  /** Центрировать содержимое (для диалогов с иконками) */
  @Input() centered = false;

  /** Кастомная ширина */
  @Input() avWidth?: string | number;

  /** Кастомная высота */
  @Input() avHeight?: string | number;

  /** Максимальная ширина */
  @Input() avMaxWidth?: string | number;

  /** Максимальная высота */
  @Input() avMaxHeight?: string | number;

  /** Можно ли перетаскивать */
  @Input() draggable = false;

  /** Можно ли менять размер */
  @Input() resizable = false;

  /** Показывать кнопку разворачивания на весь экран */
  @Input() showMaximizeButton = false;

  /** Состояние полноэкранного режима (внутреннее) */
  isFullscreen = false;

  /** Событие изменения isOpen */
  @Output() isOpenChange = new EventEmitter<boolean>();

  /** Событие закрытия с результатом */
  @Output() closed = new EventEmitter<any>();

  /** Событие открытия */
  @Output() opened = new EventEmitter<void>();

  /** Эффективный размер (с учетом мобильной версии) */
  get effectiveSize(): ModalSize {
    if (
      this.mobileFullscreen &&
      typeof window !== 'undefined' &&
      window.innerWidth < this.mobileBreakpoint
    ) {
      return 'fullscreen';
    }
    return this.size;
  }

  /** Проверка наличия кастомных размеров */
  private get hasCustomDimensions(): boolean {
    return !!(this.avWidth || this.avHeight);
  }

  /** CSS классы для контейнера */
  get containerClasses(): string[] {
    const classes = ['modal-container', `modal-container--${this.position}`];

    // Добавляем класс размера только если нет кастомных габаритов
    if (!this.hasCustomDimensions) {
      classes.push(`modal-container--${this.effectiveSize}`);
    }

    if (this.centered) {
      classes.push('modal-container--centered');
    }

    if (this.isFullscreen) {
      classes.push('modal-container--maximized');
    }

    return classes;
  }

  /** CSS классы для обертки */
  get wrapperClasses(): string[] {
    return ['modal-wrapper', `modal-wrapper--${this.position}`];
  }

  /** Стили для контейнера */
  get containerStyles(): { [key: string]: any } {
    if (this.isFullscreen) {
      return {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        borderRadius: '0',
      };
    }

    const styles: { [key: string]: any } = {};

    if (this.avWidth) {
      styles['width'] = this.getSafeDimension(this.avWidth, 100, 'width');
    }

    if (this.avHeight) {
      styles['height'] = this.getSafeDimension(this.avHeight, 50, 'height');
    }

    if (this.avMaxWidth) {
      styles['max-width'] = this.getSafeDimension(this.avMaxWidth, 100, 'width');
    }

    if (this.avMaxHeight) {
      styles['max-height'] = this.getSafeDimension(this.avMaxHeight, 50, 'height');
    }

    return styles;
  }

  /** Получение безопасного размера с учетом текущего окна */
  private getSafeDimension(
    value: string | number | undefined,
    min: number,
    type: 'width' | 'height',
  ): string {
    if (value === undefined || value === null || value === '') return '';

    const strValue = value.toString();
    const numValue = parseInt(strValue);

    // Если это не число или содержит относительные единицы, возвращаем как есть (браузер сам ограничит)
    if (
      isNaN(numValue) ||
      strValue.includes('%') ||
      strValue.includes('vw') ||
      strValue.includes('vh')
    ) {
      return strValue;
    }

    // Лимиты экрана на лету
    const screenLimit =
      typeof window !== 'undefined'
        ? (type === 'width' ? window.innerWidth : window.innerHeight) * 0.98
        : 2000;

    const safeValue = Math.min(Math.max(numValue, min), screenLimit);
    return `${safeValue}px`;
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.onOpen();
    }
  }

  ngOnDestroy(): void {
    this.removeBodyScrollLock();
  }

  /**
   * Закрыть модал
   */
  async close(result?: any): Promise<void> {
    // Вызываем beforeClose если есть
    if (this.beforeClose) {
      const canClose = await this.beforeClose(result);
      if (!canClose) {
        return; // Отменяем закрытие
      }
    }

    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.closed.emit(result);
    this.removeBodyScrollLock();
  }

  /**
   * Обработка клика на backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Переключение полноэкранного режима
   */
  toggleFullscreen(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isFullscreen = !this.isFullscreen;
    this.cdr.detectChanges();
  }

  /**
   * Обработка нажатия клавиш (глобально)
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isOpen && this.closeOnEsc && event.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Обработка открытия
   */
  private onOpen(): void {
    this.addBodyScrollLock();
    this.opened.emit();
  }

  /**
   * Блокировка скролла body
   */
  private addBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Снятие блокировки скролла body
   */
  private removeBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // Логика Resize
  onResizeMouseDown(event: MouseEvent): void {
    if (!this.resizable || !this.modalContainer || this.isFullscreen) return;

    event.preventDefault();
    event.stopPropagation();

    const container = this.modalContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;

    const onMouseMove = (e: MouseEvent) => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Максимально допустимые размеры (98% экрана, чтобы окно не исчезало)
      const maxW = screenWidth * 0.98;
      const maxH = screenHeight * 0.98;

      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);

      // Ограничиваем Min (100x50) и Max (98% экрана)
      this.avWidth = Math.min(Math.max(newWidth, 100), maxW);
      this.avHeight = Math.min(Math.max(newHeight, 50), maxH);

      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}

/**
 * Компонент для рендеринга template внутри CDK Overlay
 * Используется ModalService для программного открытия
 */
@Component({
  selector: 'av-modal-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-content-wrapper">
      <!-- Header -->
      <div class="modal-header" *ngIf="data?.title || data?.showCloseButton !== false">
        <div class="modal-header__content">
          <h2 *ngIf="data?.title" class="modal-header__title">{{ data.title }}</h2>
          <p *ngIf="data?.subtitle" class="modal-header__subtitle">{{ data.subtitle }}</p>
        </div>
        <button
          *ngIf="data?.showCloseButton !== false"
          type="button"
          class="modal-header__close"
          (click)="closeModal()"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <ng-container
          *ngIf="data?.template"
          [ngTemplateOutlet]="data.template"
          [ngTemplateOutletContext]="data.context || {}"
        ></ng-container>
      </div>

      <!-- Footer -->
      <div class="modal-footer" *ngIf="data?.footerTemplate">
        <ng-container
          [ngTemplateOutlet]="data.footerTemplate"
          [ngTemplateOutletContext]="data.context || {}"
        ></ng-container>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class ModalContentComponent {
  data = inject(MODAL_DATA, { optional: true });

  closeModal(): void {
    // ModalRef будет инжектирован в родительском компоненте
    // Это просто placeholder для кнопки закрытия
  }
}
