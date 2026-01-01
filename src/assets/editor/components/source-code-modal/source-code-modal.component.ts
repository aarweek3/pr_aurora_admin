/**
 * ════════════════════════════════════════════════════════════════════════════
 * SOURCE CODE MODAL COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Модальное окно для просмотра и редактирования HTML-кода и SCSS-стилей редактора.
 *
 * Особенности:
 * - Нативный <dialog> элемент
 * - Переключение между режимами HTML и SCSS
 * - Textarea с моноширинным шрифтом
 * - Применение изменений или отмена
 * - Закрытие по Escape
 *
 * @module SourceCodeModalComponent
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Тип режима просмотра
 */
type ViewMode = 'html' | 'scss';

/**
 * Компонент модального окна для HTML-кода и SCSS-стилей
 */
@Component({
  selector: 'aurora-source-code-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './source-code-modal.component.html',
  styleUrl: './source-code-modal.component.scss',
})
export class SourceCodeModalComponent {
  /**
   * Ссылка на нативный dialog элемент
   */
  @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef<HTMLDialogElement>;

  /**
   * Событие применения изменений
   */
  @Output() apply = new EventEmitter<string>();

  /**
   * Событие отмены
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Событие сохранения (без закрытия)
   */
  @Output() save = new EventEmitter<string>();

  /**
   * Событие сохранения SCSS
   */
  @Output() saveScss = new EventEmitter<string>();

  /**
   * Текущий режим просмотра
   */
  viewMode: ViewMode = 'html';

  /**
   * HTML-код для редактирования
   */
  htmlCode = '';

  /**
   * SCSS-код для редактирования
   */
  scssCode = '';

  /**
   * Флаг успешного копирования
   */
  copySuccess = false;

  /**
   * Ошибка валидации SCSS
   */
  scssValidationError = '';

  /**
   * Флаг успешной валидации SCSS
   */
  scssValidationSuccess = false;

  /**
   * Открыть модальное окно
   *
   * @param initialHtml - Начальный HTML-код
   * @param initialScss - Начальный SCSS-код (опционально)
   */
  open(initialHtml: string, initialScss?: string): void {
    this.htmlCode = this.formatHtml(initialHtml);
    this.scssCode =
      initialScss || '/* Стили редактора */\n\n// Здесь можно добавить кастомные стили';
    this.viewMode = 'html'; // По умолчанию показываем HTML
    this.copySuccess = false; // Сбрасываем флаг
    this.dialogRef.nativeElement.showModal();
  }

  /**
   * Закрыть модальное окно
   */
  close(): void {
    this.dialogRef.nativeElement.close();
  }

  /**
   * Обработчик кнопки "Применить"
   */
  onApply(): void {
    // Отправляем только HTML (SCSS применяется через Сохранить)
    this.apply.emit(this.htmlCode);
    this.close();
  }

  /**
   * Обработчик кнопки "Отмена"
   */
  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  /**
   * Обработчик кнопки "Сохранить" (без закрытия окна)
   */
  onSave(): void {
    // В зависимости от режима сохраняем HTML или SCSS
    if (this.viewMode === 'html') {
      this.save.emit(this.htmlCode);
      console.log('[SourceCodeModal] HTML content saved');
    } else {
      // Валидируем SCSS перед сохранением
      const validationResult = this.validateScss(this.scssCode);

      if (validationResult.isValid) {
        this.scssValidationError = '';
        this.scssValidationSuccess = true;
        this.saveScss.emit(this.scssCode);
        console.log('[SourceCodeModal] SCSS content saved');

        // Убираем сообщение об успехе через 2 секунды
        setTimeout(() => {
          this.scssValidationSuccess = false;
        }, 2000);
      } else {
        this.scssValidationError = validationResult.error;
        this.scssValidationSuccess = false;
        console.error('[SourceCodeModal] SCSS validation failed:', validationResult.error);
      }
    }
  }

  /**
   * Переключить режим просмотра
   *
   * @param mode - Режим (html или scss)
   */
  switchMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.scssValidationError = ''; // Сбрасываем ошибки при переключении
    this.scssValidationSuccess = false;
    console.log('[SourceCodeModal] Switched to mode:', mode);
  }

  /**
   * Скопировать HTML-код в буфер обмена
   */
  async copyToClipboard(): Promise<void> {
    try {
      const codeToCopy = this.viewMode === 'html' ? this.htmlCode : this.scssCode;
      await navigator.clipboard.writeText(codeToCopy);
      this.copySuccess = true;
      console.log(`[SourceCodeModal] ${this.viewMode.toUpperCase()} code copied to clipboard`);

      // Через 2 секунды убираем сообщение об успехе
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (error) {
      console.error('[SourceCodeModal] Failed to copy code:', error);
      alert('Не удалось скопировать код. Попробуйте выделить и скопировать вручную.');
    }
  }

  /**
   * Форматирование HTML для читаемости
   * (добавляет переносы строк и отступы)
   *
   * @param html - Исходный HTML
   * @returns Отформатированный HTML
   */
  private formatHtml(html: string): string {
    // Шаг 1: Добавляем переносы только после БЛОЧНЫХ элементов
    let formatted = html
      .replace(/(<\/?(p|div|h[1-6]|ul|ol|li|blockquote)[^>]*>)/gi, '\n$1\n')
      .replace(/\n{2,}/g, '\n') // Убираем множественные переносы
      .trim();

    // Шаг 2: Добавляем отступы
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines: string[] = [];

    for (let line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Определяем, это закрывающий тег?
      const isClosingTag = /^<\//.test(trimmedLine);
      // Определяем, это открывающий блочный тег?
      const isOpeningBlockTag = /^<(p|div|h[1-6]|ul|ol|li|blockquote)[\s>]/i.test(trimmedLine);

      // Для закрывающих тегов: сначала уменьшаем отступ
      if (isClosingTag) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Добавляем строку с отступом
      indentedLines.push('  '.repeat(indentLevel) + trimmedLine);

      // Для открывающих тегов: увеличиваем отступ ПОСЛЕ добавления строки
      if (isOpeningBlockTag && !isClosingTag) {
        indentLevel++;
      }
    }

    return indentedLines.join('\n');
  }

  /**
   * Валидация SCSS кода
   * Проверяет базовый синтаксис SCSS на наличие ошибок
   *
   * @param scss - SCSS код для валидации
   * @returns Объект с результатом валидации
   */
  private validateScss(scss: string): { isValid: boolean; error: string } {
    // Проверка 1: Парные фигурные скобки
    const openBraces = (scss.match(/{/g) || []).length;
    const closeBraces = (scss.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      return {
        isValid: false,
        error: `Несовпадение фигурных скобок: открывающих ${openBraces}, закрывающих ${closeBraces}`,
      };
    }

    // Проверка 2: Парные круглые скобки
    const openParens = (scss.match(/\(/g) || []).length;
    const closeParens = (scss.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      return {
        isValid: false,
        error: `Несовпадение круглых скобок: открывающих ${openParens}, закрывающих ${closeParens}`,
      };
    }

    // Проверка 3: Парные квадратные скобки
    const openBrackets = (scss.match(/\[/g) || []).length;
    const closeBrackets = (scss.match(/\]/g) || []).length;

    if (openBrackets !== closeBrackets) {
      return {
        isValid: false,
        error: `Несовпадение квадратных скобок: открывающих ${openBrackets}, закрывающих ${closeBrackets}`,
      };
    }

    // Проверка 4: Базовый синтаксис свойств (property: value;)
    const lines = scss.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Пропускаем комментарии, пустые строки, селекторы
      if (
        !line ||
        line.startsWith('//') ||
        line.startsWith('/*') ||
        line.startsWith('*') ||
        line.endsWith('{') ||
        line === '}' ||
        line.startsWith('@')
      ) {
        continue;
      }

      // Проверяем, что строка со свойством заканчивается на ;
      if (line.includes(':') && !line.endsWith(';') && !line.endsWith('{')) {
        return {
          isValid: false,
          error: `Строка ${i + 1}: отсутствует точка с запятой после "${line}"`,
        };
      }
    }

    // Проверка 5: Незакрытые строки в кавычках
    const doubleQuotes = (scss.match(/"/g) || []).length;
    const singleQuotes = (scss.match(/'/g) || []).length;

    if (doubleQuotes % 2 !== 0) {
      return {
        isValid: false,
        error: 'Незакрытая двойная кавычка (") в коде',
      };
    }

    if (singleQuotes % 2 !== 0) {
      return {
        isValid: false,
        error: "Незакрытая одинарная кавычка (') в коде",
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Подсветка синтаксиса SCSS
   * Возвращает HTML с подсветкой для отображения
   *
   * @param scss - SCSS код
   * @returns HTML с подсветкой синтаксиса
   */
  highlightScss(scss: string): string {
    let highlighted = scss;

    // 1. Комментарии
    highlighted = highlighted.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      '<span class="scss-comment">$1</span>',
    );

    // 2. Свойства (property:)
    highlighted = highlighted.replace(
      /([a-z-]+)(\s*:\s*)/gi,
      '<span class="scss-property">$1</span>$2',
    );

    // 3. Значения (: value;)
    highlighted = highlighted.replace(
      /(:\s*)([^;{]+)(;)/g,
      '$1<span class="scss-value">$2</span>$3',
    );

    // 4. Селекторы
    highlighted = highlighted.replace(
      /^([.#&]?[a-z0-9_-]+)(\s*{)/gim,
      '<span class="scss-selector">$1</span>$2',
    );

    // 5. Переменные SCSS ($variable)
    highlighted = highlighted.replace(/(\$[a-z0-9_-]+)/gi, '<span class="scss-variable">$1</span>');

    // 6. At-правила (@media, @import, etc)
    highlighted = highlighted.replace(/(@[a-z-]+)/gi, '<span class="scss-at-rule">$1</span>');

    return highlighted;
  }
}
