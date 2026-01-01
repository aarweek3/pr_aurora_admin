import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для выбора размера шрифта
 *
 * Функциональность:
 * - Dropdown список размеров шрифтов (8-72px)
 * - Применение размера к выделенному тексту
 * - Предпросмотр размеров в списке
 * - Поддержка стандартных размеров
 *
 * @example
 * const fontSizePlugin = new FontSizePlugin();
 * fontSizePlugin.execute(editorElement, { fontSize: '16px' });
 */
@Injectable()
export class FontSizePlugin implements AuroraPlugin {
  name = 'fontSize';
  title = 'Выбрать размер шрифта';
  icon = '📏';
  shortcut = '';
  isDropdown = true;

  /**
   * Список доступных размеров шрифта
   */
  readonly fontSizes = [
    { value: '', label: 'Размер по умолчанию' },
    { value: '8px', label: '8px (очень маленький)' },
    { value: '9px', label: '9px' },
    { value: '10px', label: '10px (маленький)' },
    { value: '11px', label: '11px' },
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px (обычный)' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px (большой)' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px (очень большой)' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' },
    { value: '36px', label: '36px' },
    { value: '48px', label: '48px (огромный)' },
    { value: '72px', label: '72px (гигантский)' },
  ];

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[FontSizePlugin] Initialized');
  }

  /**
   * Выполнение команды установки размера шрифта
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - { fontSize: string } - размер шрифта (например, '16px')
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: { fontSize: string }): boolean {
    if (!editorElement || !options?.fontSize) {
      console.warn('[FontSizePlugin] Editor element or fontSize not provided');
      return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[FontSizePlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);

    // Если выделения нет, ничего не делаем
    if (range.collapsed) {
      console.warn('[FontSizePlugin] No text selected');
      return false;
    }

    // Если fontSize пустой, удаляем стиль размера
    if (options.fontSize === '') {
      this.removeFontSize(editorElement);
      return true;
    }

    // Применяем размер шрифта
    this.applyFontSize(editorElement, options.fontSize);

    console.log('[FontSizePlugin] Font size applied', { fontSize: options.fontSize });
    return true;
  }

  /**
   * Проверка активности команды (активна если курсор внутри элемента с font-size)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node = selection.anchorNode;
    if (!node) return false;

    // Проверяем, есть ли font-size у текущего элемента или его родителей
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const fontSize = window.getComputedStyle(element).fontSize;
        const defaultFontSize = window.getComputedStyle(editorElement).fontSize;

        if (fontSize && fontSize !== defaultFontSize && fontSize !== 'inherit') {
          return true;
        }
      }
      node = node.parentElement;
    }

    return false;
  }

  /**
   * Получение текущего размера шрифта
   */
  getCurrentFontSize(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    let node = selection.anchorNode;
    if (!node) return '';

    // Проверяем font-size у текущего элемента или его родителей
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const fontSize = element.style.fontSize;

        // Если есть inline стиль, возвращаем его
        if (fontSize) {
          return fontSize;
        }
      }
      node = node.parentElement;
    }

    return '';
  }

  /**
   * Применение размера шрифта к выделенному тексту
   */
  private applyFontSize(editorElement: HTMLElement, fontSize: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Создаем span с нужным размером
    const span = document.createElement('span');
    span.style.fontSize = fontSize;

    try {
      // Оборачиваем выделенный текст в span
      range.surroundContents(span);
    } catch (e) {
      // Если не получилось обернуть (сложное выделение), создаем span вручную
      console.warn('[FontSizePlugin] Failed to wrap selection, using manual approach');

      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      // Восстанавливаем выделение
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Удаление стиля размера шрифта
   */
  private removeFontSize(editorElement: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement!;
    }

    // Удаляем font-size у текущего элемента
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.style.fontSize) {
          element.style.removeProperty('font-size');

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
    console.log('[FontSizePlugin] Destroyed');
  }
}
