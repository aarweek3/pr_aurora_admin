import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Модальное окно для вставки цитаты
 *
 * Функциональность:
 * - Ввод текста цитаты
 * - Ввод автора цитаты (необязательно)
 * - Ввод источника цитаты (необязательно)
 * - Выбор стиля оформления цитаты
 *
 * @example
 * <app-blockquote-modal
 *   (save)="onSave($event)"
 *   (cancel)="onCancel()">
 * </app-blockquote-modal>
 */
@Component({
  selector: 'app-blockquote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blockquote-modal.component.html',
  styleUrls: ['./blockquote-modal.component.scss'],
})
export class BlockquoteModalComponent implements AfterViewInit {
  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('quoteTextArea') quoteTextAreaRef!: ElementRef<HTMLTextAreaElement>;

  @Output() save = new EventEmitter<{
    text: string;
    author: string;
    source: string;
    style: string;
  }>();
  @Output() cancel = new EventEmitter<void>();

  quoteText = '';
  author = '';
  source = '';
  selectedStyle = 'modern';

  /**
   * Доступные стили оформления цитат
   */
  readonly quoteStyles = [
    {
      value: 'classic',
      label: 'Классическая',
      description: 'Стандартное оформление с отступом слева',
    },
    {
      value: 'modern',
      label: 'Современная',
      description: 'Современный дизайн с акцентной границей',
    },
    {
      value: 'minimal',
      label: 'Минималистичная',
      description: 'Минималистичный стиль без фона',
    },
  ];

  validationError = '';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    console.log('[BlockquoteModal] ViewChild initialized');
  }

  /**
   * Открытие модального окна
   */
  open(): void {
    // Сбрасываем поля формы
    this.quoteText = '';
    this.author = '';
    this.source = '';
    this.selectedStyle = 'modern';
    this.validationError = '';

    // Используем прямой доступ к DOM, если ViewChild еще не инициализирован
    const dialogElement =
      this.dialogRef?.nativeElement || this.elementRef.nativeElement.querySelector('dialog');

    if (dialogElement) {
      dialogElement.showModal();
      console.log('[BlockquoteModal] Opened');

      // Фокусируемся на textarea
      setTimeout(() => {
        const textarea =
          this.quoteTextAreaRef?.nativeElement ||
          this.elementRef.nativeElement.querySelector('textarea[name="quoteText"]');
        textarea?.focus();
      }, 50);
    } else {
      console.error('[BlockquoteModal] Dialog element not found');
    }
  }

  /**
   * Закрытие модального окна
   */
  close(): void {
    const dialogElement =
      this.dialogRef?.nativeElement || this.elementRef.nativeElement.querySelector('dialog');
    dialogElement?.close();
  }

  /**
   * Обработка сохранения
   */
  onSave(): void {
    const trimmedText = this.quoteText.trim();

    // Валидация
    if (!trimmedText) {
      this.validationError = 'Текст цитаты не может быть пустым';
      return;
    }

    // Эмитим событие с данными
    this.save.emit({
      text: trimmedText,
      author: this.author.trim(),
      source: this.source.trim(),
      style: this.selectedStyle,
    });

    console.log('[BlockquoteModal] Save clicked', {
      text: trimmedText,
      author: this.author,
      source: this.source,
      style: this.selectedStyle,
    });
  }

  /**
   * Обработка отмены
   */
  onCancel(): void {
    this.close();
    this.cancel.emit();
    console.log('[BlockquoteModal] Cancel clicked');
  }

  /**
   * Обработка Enter в форме
   */
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl+Enter для отправки формы
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.onSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  /**
   * Очистка ошибки валидации при вводе
   */
  onQuoteTextInput(): void {
    if (this.validationError) {
      this.validationError = '';
    }
  }

  /**
   * Выбор стиля цитаты
   */
  selectStyle(style: string): void {
    this.selectedStyle = style;
  }
}
