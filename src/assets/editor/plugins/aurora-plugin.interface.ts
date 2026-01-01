/**
 * ════════════════════════════════════════════════════════════════════════════
 * AURORA PLUGIN INTERFACE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Базовый интерфейс для всех плагинов Aurora Editor.
 *
 * Каждый плагин должен реализовать этот интерфейс для единообразной работы.
 *
 * @module AuroraPlugin
 */

/**
 * Интерфейс плагина Aurora Editor
 */
export interface AuroraPlugin {
  /**
   * Уникальное имя плагина (например: 'bold', 'italic', 'link')
   */
  name: string;

  /**
   * Отображаемое название плагина
   */
  title: string;

  /**
   * Иконка для кнопки (можно использовать Unicode символы или CSS классы)
   */
  icon?: string;

  /**
   * Горячая клавиша (например: 'Ctrl+B', 'Ctrl+K')
   */
  shortcut?: string;

  /**
   * Является ли плагин выпадающим списком (dropdown)
   */
  isDropdown?: boolean;

  /**
   * Выполнить команду плагина
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean;

  /**
   * Проверить, активен ли плагин в текущей позиции курсора
   * (например, находится ли курсор в жирном тексте)
   *
   * @param editorElement - Элемент редактора
   * @returns true если плагин активен
   */
  isActive?(editorElement: HTMLElement): boolean;

  /**
   * Инициализация плагина (вызывается один раз при создании)
   */
  init?(): void;

  /**
   * Уничтожение плагина (вызывается при удалении)
   */
  destroy?(): void;
}

/**
 * Базовый класс для плагинов форматирования
 * (Bold, Italic, Underline, Strikethrough)
 */
export abstract class BaseFormatPlugin implements AuroraPlugin {
  abstract name: string;
  abstract title: string;
  abstract icon: string;
  abstract shortcut?: string;

  /**
   * HTML-тег для форматирования (например: 'strong', 'em', 'u')
   */
  protected abstract tagName: string;

  /**
   * Выполнить команду форматирования
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    try {
      // Проверяем, есть ли выделение
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      // Проверяем, что выделение внутри редактора
      const range = selection.getRangeAt(0);
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Если ничего не выделено, ставим курсор внутрь тега
      if (range.collapsed) {
        const tag = document.createElement(this.tagName);
        tag.textContent = '\u200B'; // Zero-width space для курсора
        range.insertNode(tag);

        // Устанавливаем курсор внутри тега
        const newRange = document.createRange();
        newRange.setStart(tag.firstChild!, 1);
        newRange.setEnd(tag.firstChild!, 1);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return true;
      }

      // Проверяем, активен ли формат
      const isActive = this.isActive(editorElement);

      if (isActive) {
        // Убираем форматирование
        this.removeFormat(range);
      } else {
        // Применяем форматирование
        this.applyFormat(range);
      }

      return true;
    } catch (error) {
      console.error(`[${this.name}] Error executing plugin:`, error);
      return false;
    }
  }

  /**
   * Проверить, активен ли формат в текущей позиции
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    let node: Node | null = selection.anchorNode;

    // Проходим по родителям до редактора
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === this.tagName.toLowerCase()) {
          return true;
        }
      }
      node = node.parentNode;
    }

    return false;
  }

  /**
   * Применить форматирование к выделению
   */
  protected applyFormat(range: Range): void {
    const tag = document.createElement(this.tagName);

    try {
      // Извлекаем содержимое из range
      const contents = range.extractContents();
      tag.appendChild(contents);

      // Вставляем тег с содержимым
      range.insertNode(tag);

      // Восстанавливаем выделение
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(tag);
        selection.addRange(newRange);
      }
    } catch (error) {
      console.error(`[${this.name}] Error applying format:`, error);
    }
  }

  /**
   * Убрать форматирование с выделения
   */
  protected removeFormat(range: Range): void {
    try {
      const selection = window.getSelection();
      if (!selection) return;

      // Находим родительский тег форматирования
      let node: Node | null = range.commonAncestorContainer;
      let formatElement: HTMLElement | null = null;

      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName.toLowerCase() === this.tagName.toLowerCase()) {
            formatElement = element;
            break;
          }
        }
        node = node.parentNode;
      }

      if (formatElement) {
        // Заменяем тег на его содержимое
        const parent = formatElement.parentNode;
        if (parent) {
          while (formatElement.firstChild) {
            parent.insertBefore(formatElement.firstChild, formatElement);
          }
          parent.removeChild(formatElement);
        }
      }
    } catch (error) {
      console.error(`[${this.name}] Error removing format:`, error);
    }
  }

  init?(): void {
    // Можно переопределить в наследниках
  }

  destroy?(): void {
    // Можно переопределить в наследниках
  }
}
