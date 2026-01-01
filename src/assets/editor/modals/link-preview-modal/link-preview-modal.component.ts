/**
 * ════════════════════════════════════════════════════════════════════════════
 * LINK PREVIEW MODAL COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Модальное окно для создания превью ссылки.
 * Позволяет выбрать размер карточки и ввести URL.
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreviewSize } from '../../plugins/insert/link-preview.plugin';

@Component({
  selector: 'app-link-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './link-preview-modal.component.html',
  styleUrls: ['./link-preview-modal.component.scss'],
})
export class LinkPreviewModalComponent {
  @ViewChild('dialogRef', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  /**
   * Событие вставки превью
   */
  @Output() insert = new EventEmitter<{
    url: string;
    size: PreviewSize;
  }>();

  /**
   * URL для превью
   */
  url = '';

  /**
   * Размер карточки
   */
  size: PreviewSize = PreviewSize.MEDIUM;

  /**
   * Доступные размеры карточек
   */
  readonly sizes = [
    {
      value: PreviewSize.SMALL,
      name: 'Компактная',
      icon: '🔹',
      description: 'Маленькая карточка с миниатюрой',
    },
    {
      value: PreviewSize.MEDIUM,
      name: 'Стандартная',
      icon: '🔸',
      description: 'Средняя карточка с изображением',
    },
    {
      value: PreviewSize.LARGE,
      name: 'Полная',
      icon: '🔶',
      description: 'Большая карточка со всеми деталями',
    },
  ];

  /**
   * Ошибка валидации URL
   */
  urlError = '';

  /**
   * Открыть модальное окно
   */
  open(): void {
    // Сбрасываем состояние
    this.url = '';
    this.size = PreviewSize.MEDIUM;
    this.urlError = '';

    this.dialogRef.nativeElement.showModal();
  }

  /**
   * Закрыть модальное окно
   */
  close(): void {
    this.dialogRef.nativeElement.close();
  }

  /**
   * Валидация URL
   */
  validateUrl(): void {
    this.urlError = '';

    if (!this.url) {
      this.urlError = 'Введите URL';
      return;
    }

    try {
      new URL(this.url);
    } catch {
      this.urlError = 'Некорректный URL. Используйте полный формат: https://example.com';
    }
  }

  /**
   * Обработчик изменения URL
   */
  onUrlChange(): void {
    if (this.urlError) {
      this.validateUrl();
    }
  }

  /**
   * Обработчик отмены
   */
  onCancel(): void {
    this.close();
  }

  /**
   * Обработчик вставки превью
   */
  onInsert(): void {
    this.validateUrl();

    if (this.urlError) {
      return;
    }

    if (!this.url) {
      alert('Введите URL для создания превью');
      return;
    }

    this.insert.emit({
      url: this.url,
      size: this.size,
    });

    this.close();
  }
}
