import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для выбора семейства шрифтов
 *
 * Функциональность:
 * - Dropdown список доступных шрифтов
 * - Применение шрифта к выделенному тексту
 * - Предпросмотр шрифтов в списке
 * - Поддержка системных и веб-шрифтов
 *
 * @example
 * const fontFamilyPlugin = new FontFamilyPlugin();
 * fontFamilyPlugin.execute(editorElement, { fontFamily: 'Arial' });
 */
@Injectable()
export class FontFamilyPlugin implements AuroraPlugin {
  name = 'fontFamily';
  title = 'Выбрать шрифт';
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="min-width: 20px; min-height: 20px;" viewBox="0 0 24 24"><g transform="scale(0.0234) translate(0, 0)"><path d="M834.3 705.7c0 82.2-66.8 149-149 149H325.9c-82.2 0-149-66.8-149-149V346.4c0-82.2 66.8-149 149-149h129.8v-42.7H325.9c-105.7 0-191.7 86-191.7 191.7v359.3c0 105.7 86 191.7 191.7 191.7h359.3c105.7 0 191.7-86 191.7-191.7V575.9h-42.7v129.8z" fill="currentColor"/><path d="M889.7 163.4c-22.9-22.9-53-34.4-83.1-34.4s-60.1 11.5-83.1 34.4L312 574.9c-16.9 16.9-27.9 38.8-31.2 62.5l-19 132.8c-1.6 11.4 7.3 21.3 18.4 21.3 0.9 0 1.8-0.1 2.7-0.2l132.8-19c23.7-3.4 45.6-14.3 62.5-31.2l411.5-411.5c45.9-45.9 45.9-120.3 0-166.2zM362 585.3L710.3 237 816 342.8 467.8 691.1 362 585.3zM409.7 730l-101.1 14.4L323 643.3c1.4-9.5 4.8-18.7 9.9-26.7L436.3 720c-8 5.2-17.1 8.7-26.6 10z m449.8-430.7l-13.3 13.3-105.7-105.8 13.3-13.3c14.1-14.1 32.9-21.9 52.9-21.9s38.8 7.8 52.9 21.9c29.1 29.2 29.1 76.7-0.1 105.8z" fill="currentColor"/></g></svg>';
  shortcut = '';
  isDropdown = true;

  /**
   * Список доступных шрифтов
   */
  readonly fonts = [
    { value: '', label: 'Шрифт по умолчанию', family: '' },
    { value: 'Arial', label: 'Arial', family: 'Arial, sans-serif' },
    { value: 'Arial Black', label: 'Arial Black', family: '"Arial Black", sans-serif' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
    { value: 'Courier New', label: 'Courier New', family: '"Courier New", monospace' },
    { value: 'Georgia', label: 'Georgia', family: 'Georgia, serif' },
    { value: 'Impact', label: 'Impact', family: 'Impact, fantasy' },
    { value: 'Lucida Console', label: 'Lucida Console', family: '"Lucida Console", monospace' },
    {
      value: 'Lucida Sans Unicode',
      label: 'Lucida Sans Unicode',
      family: '"Lucida Sans Unicode", sans-serif',
    },
    {
      value: 'Palatino Linotype',
      label: 'Palatino Linotype',
      family: '"Palatino Linotype", serif',
    },
    { value: 'Tahoma', label: 'Tahoma', family: 'Tahoma, sans-serif' },
    { value: 'Times New Roman', label: 'Times New Roman', family: '"Times New Roman", serif' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
    { value: 'Verdana', label: 'Verdana', family: 'Verdana, sans-serif' },
  ];

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[FontFamilyPlugin] Initialized');
  }

  /**
   * Выполнение команды установки шрифта
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - { fontFamily: string } - название шрифта
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: { fontFamily: string }): boolean {
    if (!editorElement || !options?.fontFamily) {
      console.warn('[FontFamilyPlugin] Editor element or fontFamily not provided');
      return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[FontFamilyPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);

    // Если выделения нет, ничего не делаем
    if (range.collapsed) {
      console.warn('[FontFamilyPlugin] No text selected');
      return false;
    }

    // Если fontFamily пустой, удаляем стиль шрифта
    if (options.fontFamily === '') {
      this.removeFontFamily(editorElement);
      return true;
    }

    // Применяем шрифт
    this.applyFontFamily(editorElement, options.fontFamily);

    console.log('[FontFamilyPlugin] Font applied', { fontFamily: options.fontFamily });
    return true;
  }

  /**
   * Проверка активности команды (активна если курсор внутри элемента с font-family)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node = selection.anchorNode;
    if (!node) return false;

    // Проверяем, есть ли font-family у текущего элемента или его родителей
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const fontFamily = window.getComputedStyle(element).fontFamily;
        if (fontFamily && fontFamily !== 'inherit') {
          return true;
        }
      }
      node = node.parentElement;
    }

    return false;
  }

  /**
   * Получение текущего шрифта
   */
  getCurrentFont(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    let node = selection.anchorNode;
    if (!node) return '';

    // Проверяем font-family у текущего элемента или его родителей
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const fontFamily = window.getComputedStyle(element).fontFamily;

        // Находим соответствующий шрифт из списка
        const matchingFont = this.fonts.find((font) => {
          if (!font.value) return false;
          // Сравниваем без кавычек и в нижнем регистре
          const normalized = fontFamily.toLowerCase().replace(/['"]/g, '');
          return normalized.includes(font.value.toLowerCase());
        });

        if (matchingFont) {
          return matchingFont.value;
        }
      }
      node = node.parentElement;
    }

    return '';
  }

  /**
   * Применение шрифта к выделенному тексту
   */
  private applyFontFamily(editorElement: HTMLElement, fontFamily: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Создаем span с нужным шрифтом
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;

    try {
      // Оборачиваем выделенный текст в span
      range.surroundContents(span);
    } catch (e) {
      // Если не получилось обернуть (сложное выделение), используем execCommand
      console.warn('[FontFamilyPlugin] Failed to wrap selection, using fallback');
      document.execCommand('fontName', false, fontFamily);
    }

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Удаление стиля шрифта
   */
  private removeFontFamily(editorElement: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement!;
    }

    // Удаляем font-family у текущего элемента
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.style.fontFamily) {
          element.style.removeProperty('font-family');

          // Если у элемента нет других стилей, удаляем его
          if (!element.getAttribute('style')) {
            const parent = element.parentNode;
            while (element.firstChild) {
              parent?.insertBefore(element.firstChild, element);
            }
            parent?.removeChild(element);
          }
          break;
        }
      }
      node = node.parentElement!;
    }

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    console.log('[FontFamilyPlugin] Destroyed');
  }
}
