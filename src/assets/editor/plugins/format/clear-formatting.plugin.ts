/**
 * ════════════════════════════════════════════════════════════════════════════
 * CLEAR FORMATTING PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для удаления форматирования текста.
 * Поддерживает три режима очистки: лёгкая, средняя, полная.
 * Горячая клавиша: Ctrl+\
 *
 * @module ClearFormattingPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Режимы очистки форматирования
 */
export enum ClearMode {
  /** Удалить только inline стили */
  LIGHT = 'light',
  /** Удалить стили + классы */
  MEDIUM = 'medium',
  /** Оставить только текст (убрать все теги кроме структурных) */
  FULL = 'full',
}

/**
 * Плагин очистки форматирования
 */
export class ClearFormattingPlugin implements AuroraPlugin {
  name = 'clearFormatting';
  title = 'Очистить форматирование';
  icon = '⌫'; // Backspace символ
  shortcut = 'Ctrl+\\';

  /**
   * Текущий режим очистки (по умолчанию средний)
   */
  private currentMode: ClearMode = ClearMode.MEDIUM;

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[ClearFormattingPlugin] Initialized');
  }

  /**
   * Выполнить команду очистки форматирования
   */
  execute(editorElement: HTMLElement, options?: { mode?: ClearMode }): boolean {
    try {
      const mode = options?.mode || this.currentMode;
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Если ничего не выделено, очищаем весь редактор
      if (range.collapsed) {
        this.clearEntireEditor(editorElement, mode);
      } else {
        // Очищаем выделенный текст
        this.clearSelection(range, mode);
      }

      // Триггерим событие input для обновления состояния редактора
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));

      return true;
    } catch (error) {
      console.error('[ClearFormattingPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Очистить форматирование в выделенном тексте
   */
  private clearSelection(range: Range, mode: ClearMode): void {
    try {
      // Получаем содержимое выделения
      const fragment = range.cloneContents();

      // Очищаем форматирование
      const cleanedFragment = this.cleanFragment(fragment, mode);

      // Заменяем выделение на очищенное содержимое
      range.deleteContents();
      range.insertNode(cleanedFragment);

      // Восстанавливаем выделение
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(cleanedFragment);
        selection.addRange(newRange);
      }
    } catch (error) {
      console.error('[ClearFormattingPlugin] Error clearing selection:', error);
    }
  }

  /**
   * Очистить форматирование во всём редакторе
   */
  private clearEntireEditor(editorElement: HTMLElement, mode: ClearMode): void {
    try {
      const fragment = document.createDocumentFragment();

      // Клонируем содержимое редактора
      Array.from(editorElement.childNodes).forEach((node) => {
        fragment.appendChild(node.cloneNode(true));
      });

      // Очищаем форматирование
      const cleanedFragment = this.cleanFragment(fragment, mode);

      // Заменяем содержимое редактора
      editorElement.innerHTML = '';
      editorElement.appendChild(cleanedFragment);
    } catch (error) {
      console.error('[ClearFormattingPlugin] Error clearing entire editor:', error);
    }
  }

  /**
   * Очистить форматирование в документном фрагменте
   */
  private cleanFragment(fragment: DocumentFragment, mode: ClearMode): DocumentFragment {
    const cleanedFragment = document.createDocumentFragment();

    Array.from(fragment.childNodes).forEach((node) => {
      const cleanedNode = this.cleanNode(node, mode);
      if (cleanedNode) {
        cleanedFragment.appendChild(cleanedNode);
      }
    });

    return cleanedFragment;
  }

  /**
   * Очистить форматирование в узле
   */
  private cleanNode(node: Node, mode: ClearMode): Node | null {
    // Текстовые узлы оставляем как есть
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(false);
    }

    // Элементы обрабатываем в зависимости от режима
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      switch (mode) {
        case ClearMode.LIGHT:
          return this.cleanLight(element);

        case ClearMode.MEDIUM:
          return this.cleanMedium(element);

        case ClearMode.FULL:
          return this.cleanFull(element);

        default:
          return this.cleanMedium(element);
      }
    }

    return null;
  }

  /**
   * Лёгкая очистка: удалить только inline стили
   */
  private cleanLight(element: HTMLElement): Node {
    const cloned = element.cloneNode(false) as HTMLElement;

    // Удаляем только style атрибут
    cloned.removeAttribute('style');

    // Рекурсивно обрабатываем дочерние узлы
    Array.from(element.childNodes).forEach((child) => {
      const cleanedChild = this.cleanNode(child, ClearMode.LIGHT);
      if (cleanedChild) {
        cloned.appendChild(cleanedChild);
      }
    });

    return cloned;
  }

  /**
   * Средняя очистка: удалить стили + классы + форматирующие теги
   */
  private cleanMedium(element: HTMLElement): Node {
    const tagName = element.tagName.toLowerCase();

    // Форматирующие теги, которые нужно удалить (оставить только текст)
    const formattingTags = [
      'strong', 'b',           // Жирный
      'em', 'i',               // Курсив
      'u',                     // Подчёркнутый
      's', 'strike', 'del',    // Зачёркнутый
      'sup', 'sub',            // Надстрочный/подстрочный
      'mark',                  // Выделение
      'small', 'big',          // Размер
      'span',                  // Общий контейнер
      'font',                  // Старый тег шрифта
      'abbr', 'code', 'kbd', 'samp', 'var' // Семантические теги
    ];

    // Если это форматирующий тег - извлекаем только содержимое
    if (formattingTags.includes(tagName)) {
      const fragment = document.createDocumentFragment();

      Array.from(element.childNodes).forEach((child) => {
        const cleanedChild = this.cleanNode(child, ClearMode.MEDIUM);
        if (cleanedChild) {
          fragment.appendChild(cleanedChild);
        }
      });

      return fragment;
    }

    // Для остальных тегов (структурных) - сохраняем, но чистим атрибуты
    const cloned = element.cloneNode(false) as HTMLElement;

    // Удаляем style и class атрибуты
    cloned.removeAttribute('style');
    cloned.removeAttribute('class');

    // Сохраняем только важные атрибуты
    const preserveAttributes = ['href', 'src', 'alt', 'title', 'id', 'name'];
    const attributes = Array.from(element.attributes);

    attributes.forEach((attr) => {
      if (!preserveAttributes.includes(attr.name.toLowerCase())) {
        cloned.removeAttribute(attr.name);
      }
    });

    // Рекурсивно обрабатываем дочерние узлы
    Array.from(element.childNodes).forEach((child) => {
      const cleanedChild = this.cleanNode(child, ClearMode.MEDIUM);
      if (cleanedChild) {
        cloned.appendChild(cleanedChild);
      }
    });

    return cloned;
  }

  /**
   * Полная очистка: оставить только текст и структурные теги
   */
  private cleanFull(element: HTMLElement): Node | null {
    const tagName = element.tagName.toLowerCase();

    // Структурные теги, которые сохраняем
    const structuralTags = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];

    // Если тег структурный, сохраняем его
    if (structuralTags.includes(tagName)) {
      const cleaned = document.createElement(tagName);

      // Рекурсивно обрабатываем дочерние узлы
      Array.from(element.childNodes).forEach((child) => {
        const cleanedChild = this.cleanNode(child, ClearMode.FULL);
        if (cleanedChild) {
          cleaned.appendChild(cleanedChild);
        }
      });

      return cleaned;
    }

    // Для не-структурных тегов извлекаем только текст
    const fragment = document.createDocumentFragment();

    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(child.cloneNode(false));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const cleanedChild = this.cleanNode(child, ClearMode.FULL);
        if (cleanedChild) {
          fragment.appendChild(cleanedChild);
        }
      }
    });

    return fragment;
  }

  /**
   * Установить режим очистки
   */
  setMode(mode: ClearMode): void {
    this.currentMode = mode;
  }

  /**
   * Получить текущий режим очистки
   */
  getMode(): ClearMode {
    return this.currentMode;
  }

  /**
   * Проверить, активен ли плагин (всегда неактивен)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[ClearFormattingPlugin] Destroyed');
  }
}
