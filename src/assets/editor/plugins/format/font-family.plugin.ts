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
  icon = '🔤';
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
