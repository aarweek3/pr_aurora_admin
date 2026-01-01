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
 * Модальное окно для создания и редактирования гиперссылок
 *
 * Функциональность:
 * - Ввод URL с валидацией
 * - Ввод текста ссылки
 * - Редактирование существующих ссылок
 * - Удаление ссылок
 * - Валидация URL (http, https, mailto, tel)
 *
 * @example
 * <app-link-modal
 *   [selectedText]="'Текст'"
 *   [existingUrl]="'https://example.com'"
 *   (save)="onSave($event)"
 *   (unlink)="onUnlink()"
 *   (cancel)="onCancel()">
 * </app-link-modal>
 */
@Component({
  selector: 'app-link-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'link-modal.component.html',
  styleUrls: ['link-modal.component.scss'],
})
export class LinkModalComponent implements AfterViewInit {
  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('urlInput') urlInputRef!: ElementRef<HTMLInputElement>;

  @Output() save = new EventEmitter<{
    url: string;
    text: string;
    title: string;
    openInNewTab: boolean;
    allowIndex: boolean;
  }>();
  @Output() unlink = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedText = '';
  existingUrl = '';
  existingText = '';
  existingTitle = '';
  existingOpenInNewTab = true;
  existingAllowIndex = true;

  url = '';
  linkText = '';
  linkTitle = '';
  openInNewTab = true;
  allowIndex = true;
  validationError = '';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    console.log('[LinkModal] ViewChild initialized');
  }

  /**
   * Открытие модального окна
   */
  open(): void {
    // Инициализируем поля формы
    this.url = this.existingUrl;
    this.linkText = this.existingText || this.selectedText;
    this.linkTitle = this.existingTitle;
    this.openInNewTab = this.existingOpenInNewTab;
    this.allowIndex = this.existingAllowIndex;
    this.validationError = '';

    // Используем прямой доступ к DOM, если ViewChild еще не инициализирован
    const dialogElement =
      this.dialogRef?.nativeElement || this.elementRef.nativeElement.querySelector('dialog');

    if (dialogElement) {
      dialogElement.showModal();
      console.log('[LinkModal] Opened', { url: this.url, text: this.linkText });

      // Фокусируемся на поле ввода URL
      setTimeout(() => {
        const urlInput =
          this.urlInputRef?.nativeElement ||
          this.elementRef.nativeElement.querySelector('input[name="url"]');
        urlInput?.focus();
      }, 50);
    } else {
      console.error('[LinkModal] Dialog element not found');
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
   * Валидация URL
   */
  private validateUrl(url: string): boolean {
    if (!url.trim()) {
      this.validationError = 'URL не может быть пустым';
      return false;
    }

    // Добавляем https:// если протокол не указан
    if (!/^[a-z]+:/i.test(url)) {
      url = 'https://' + url;
      this.url = url; // Обновляем поле
    }

    // Проверяем допустимые протоколы
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
      const urlObj = new URL(url);
      if (!allowedProtocols.includes(urlObj.protocol)) {
        this.validationError = 'Недопустимый протокол. Разрешены: http, https, mailto, tel';
        return false;
      }
    } catch {
      this.validationError = 'Некорректный URL';
      return false;
    }

    this.validationError = '';
    return true;
  }

  /**
   * Обработка сохранения
   */
  onSave(): void {
    const trimmedUrl = this.url.trim();
    const trimmedText = this.linkText.trim();
    const trimmedTitle = this.linkTitle.trim();

    // Валидация
    if (!this.validateUrl(trimmedUrl)) {
      return;
    }

    if (!trimmedText) {
      this.validationError = 'Текст ссылки не может быть пустым';
      return;
    }

    // Эмитим событие с данными
    this.save.emit({
      url: this.url, // Используем url с добавленным протоколом
      text: trimmedText,
      title: trimmedTitle,
      openInNewTab: this.openInNewTab,
      allowIndex: this.allowIndex,
    });

    console.log('[LinkModal] Save clicked', {
      url: this.url,
      text: trimmedText,
      title: trimmedTitle,
      openInNewTab: this.openInNewTab,
      allowIndex: this.allowIndex,
    });
  }

  /**
   * Обработка удаления ссылки
   */
  onUnlink(): void {
    this.unlink.emit();
    console.log('[LinkModal] Unlink clicked');
  }

  /**
   * Обработка отмены
   */
  onCancel(): void {
    this.close();
    this.cancel.emit();
    console.log('[LinkModal] Cancel clicked');
  }

  /**
   * Обработка Enter в форме
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  /**
   * Очистка ошибки валидации при изменении URL
   */
  onUrlChange(): void {
    if (this.validationError) {
      this.validationError = '';
    }
  }
}
