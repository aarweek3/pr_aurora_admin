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

export interface AnchorInfo {
  id: string;
  name: string;
}

/**
 * Модальное окно для создания ссылок на якоря
 *
 * Функциональность:
 * - Отображение списка всех доступных якорей в документе
 * - Выбор якоря для ссылки
 * - Ввод текста ссылки
 * - Создание внутренней ссылки (#anchor-id)
 *
 * @example
 * <app-link-to-anchor-modal
 *   [availableAnchors]="anchors"
 *   [selectedText]="'Перейти к разделу'"
 *   (save)="onSave($event)"
 *   (cancel)="onCancel()">
 * </app-link-to-anchor-modal>
 */
@Component({
  selector: 'app-link-to-anchor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './link-to-anchor-modal.component.html',
  styleUrls: ['./link-to-anchor-modal.component.scss'],
})
export class LinkToAnchorModalComponent implements AfterViewInit {
  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('linkTextInput') linkTextInputRef!: ElementRef<HTMLInputElement>;

  @Output() save = new EventEmitter<{ anchorId: string; text: string }>();
  @Output() cancel = new EventEmitter<void>();

  availableAnchors: AnchorInfo[] = [];
  selectedText = '';
  selectedAnchorId = '';
  linkText = '';
  validationError = '';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    console.log('[LinkToAnchorModal] ViewChild initialized');
  }

  /**
   * Открытие модального окна
   */
  open(): void {
    // Инициализируем поля формы
    this.linkText = this.selectedText;
    this.selectedAnchorId = '';
    this.validationError = '';

    // Автоматически выбираем первый якорь, если он есть
    if (this.availableAnchors.length > 0) {
      this.selectedAnchorId = this.availableAnchors[0].id;
    }

    // Используем прямой доступ к DOM, если ViewChild еще не инициализирован
    const dialogElement =
      this.dialogRef?.nativeElement || this.elementRef.nativeElement.querySelector('dialog');

    if (dialogElement) {
      dialogElement.showModal();
      console.log('[LinkToAnchorModal] Opened', {
        anchorsCount: this.availableAnchors.length,
        selectedText: this.selectedText,
      });

      // Фокусируемся на поле ввода текста
      setTimeout(() => {
        const linkTextInput =
          this.linkTextInputRef?.nativeElement ||
          this.elementRef.nativeElement.querySelector('input[name="linkText"]');
        linkTextInput?.focus();
        linkTextInput?.select(); // Выделяем текст для удобства редактирования
      }, 50);
    } else {
      console.error('[LinkToAnchorModal] Dialog element not found');
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
   * Выбор якоря из списка
   */
  selectAnchor(anchorId: string): void {
    this.selectedAnchorId = anchorId;
    this.validationError = '';
  }

  /**
   * Обработка сохранения
   */
  onSave(): void {
    const trimmedText = this.linkText.trim();

    // Валидация
    if (!trimmedText) {
      this.validationError = 'Текст ссылки не может быть пустым';
      return;
    }

    if (!this.selectedAnchorId) {
      this.validationError = 'Пожалуйста, выберите якорь из списка';
      return;
    }

    // Эмитим событие с данными
    this.save.emit({
      anchorId: this.selectedAnchorId,
      text: trimmedText,
    });

    console.log('[LinkToAnchorModal] Save clicked', {
      anchorId: this.selectedAnchorId,
      text: trimmedText,
    });
  }

  /**
   * Обработка отмены
   */
  onCancel(): void {
    this.close();
    this.cancel.emit();
    console.log('[LinkToAnchorModal] Cancel clicked');
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
}
