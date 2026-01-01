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
 * Модальное окно для создания и редактирования якорей
 *
 * Функциональность:
 * - Ввод ID якоря с валидацией
 * - Ввод названия якоря (отображается рядом со значком)
 * - Автогенерация ID из текста элемента
 * - Редактирование существующих якорей
 * - Удаление якорей
 *
 * @example
 * <app-anchor-modal
 *   [elementText]="'Заголовок раздела'"
 *   [existingId]="'section-1'"
 *   [existingName]="'Раздел 1'"
 *   (save)="onSave($event)"
 *   (remove)="onRemove()"
 *   (cancel)="onCancel()">
 * </app-anchor-modal>
 */
@Component({
  selector: 'app-anchor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anchor-modal.component.html',
  styleUrls: ['./anchor-modal.component.scss'],
})
export class AnchorModalComponent implements AfterViewInit {
  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('anchorIdInput') anchorIdInputRef!: ElementRef<HTMLInputElement>;

  @Output() save = new EventEmitter<{ id: string; name: string }>();
  @Output() remove = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  elementText = ''; // Текст элемента для автогенерации ID
  existingId = '';
  existingName = '';

  anchorId = '';
  anchorName = '';
  validationError = '';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    console.log('[AnchorModal] ViewChild initialized');
  }

  /**
   * Открытие модального окна
   */
  open(): void {
    // Инициализируем поля формы
    this.anchorId = this.existingId;
    this.anchorName = this.existingName;
    this.validationError = '';

    // Если это новый якорь, автоматически генерируем ID
    if (!this.existingId && this.elementText) {
      this.anchorId = this.generateId(this.elementText);
    }

    // Используем прямой доступ к DOM, если ViewChild еще не инициализирован
    const dialogElement =
      this.dialogRef?.nativeElement || this.elementRef.nativeElement.querySelector('dialog');

    if (dialogElement) {
      dialogElement.showModal();
      console.log('[AnchorModal] Opened', { id: this.anchorId, name: this.anchorName });

      // Фокусируемся на поле ввода ID
      setTimeout(() => {
        const anchorIdInput =
          this.anchorIdInputRef?.nativeElement ||
          this.elementRef.nativeElement.querySelector('input[name="anchorId"]');
        anchorIdInput?.focus();
        anchorIdInput?.select(); // Выделяем текст для удобства редактирования
      }, 50);
    } else {
      console.error('[AnchorModal] Dialog element not found');
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
   * Валидация ID якоря
   */
  private validateAnchorId(id: string): boolean {
    if (!id.trim()) {
      this.validationError = 'ID якоря не может быть пустым';
      return false;
    }

    // Проверяем формат ID (только буквы, цифры, дефисы и подчеркивания)
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(id)) {
      this.validationError =
        'ID должен содержать только латинские буквы, цифры, дефисы и подчеркивания';
      return false;
    }

    // ID не должен начинаться с цифры
    if (/^\d/.test(id)) {
      this.validationError = 'ID не должен начинаться с цифры';
      return false;
    }

    this.validationError = '';
    return true;
  }

  /**
   * Обработка сохранения
   */
  onSave(): void {
    const trimmedId = this.anchorId.trim();
    const trimmedName = this.anchorName.trim();

    // Валидация
    if (!this.validateAnchorId(trimmedId)) {
      return;
    }

    // Эмитим событие с данными
    this.save.emit({
      id: trimmedId,
      name: trimmedName,
    });

    console.log('[AnchorModal] Save clicked', { id: trimmedId, name: trimmedName });
  }

  /**
   * Обработка удаления якоря
   */
  onRemove(): void {
    this.remove.emit();
    console.log('[AnchorModal] Remove clicked');
  }

  /**
   * Обработка отмены
   */
  onCancel(): void {
    this.close();
    this.cancel.emit();
    console.log('[AnchorModal] Cancel clicked');
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
   * Очистка ошибки валидации при вводе
   */
  onAnchorIdInput(): void {
    if (this.validationError) {
      this.validationError = '';
    }
  }

  /**
   * Автоматическая генерация ID из текста элемента
   */
  onAutoGenerate(): void {
    if (this.elementText) {
      this.anchorId = this.generateId(this.elementText);
      this.validationError = '';
    }
  }

  /**
   * Генерация ID из текста
   * - Приводит к нижнему регистру
   * - Заменяет пробелы и спецсимволы на дефисы
   * - Транслитерирует кириллицу
   */
  private generateId(text: string): string {
    // Транслитерация кириллицы
    const translitMap: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'g',
      д: 'd',
      е: 'e',
      ё: 'yo',
      ж: 'zh',
      з: 'z',
      и: 'i',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'h',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'sch',
      ъ: '',
      ы: 'y',
      ь: '',
      э: 'e',
      ю: 'yu',
      я: 'ya',
    };

    let result = text.toLowerCase().trim();

    // Транслитерация
    result = result
      .split('')
      .map((char) => translitMap[char] || char)
      .join('');

    // Заменяем всё кроме букв, цифр и дефисов на дефис
    result = result.replace(/[^a-z0-9-]/g, '-');

    // Убираем повторяющиеся дефисы
    result = result.replace(/-+/g, '-');

    // Убираем дефисы в начале и конце
    result = result.replace(/^-+|-+$/g, '');

    // Если ID начинается с цифры, добавляем префикс
    if (/^\d/.test(result)) {
      result = 'anchor-' + result;
    }

    // Ограничиваем длину
    if (result.length > 50) {
      result = result.substring(0, 50);
    }

    // Если получилась пустая строка, используем дефолтное имя
    if (!result) {
      result = 'anchor';
    }

    return result;
  }
}
