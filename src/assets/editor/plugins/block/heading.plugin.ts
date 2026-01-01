/**
 * ════════════════════════════════════════════════════════════════════════════
 * HEADING PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста как заголовок (H1-H6).
 * Предоставляет выпадающий список для выбора уровня заголовка.
 *
 * @module HeadingPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Опции заголовков для выпадающего списка
 */
export interface HeadingOption {
  value: string;
  label: string;
  tag: string;
}

/**
 * Плагин заголовков с выпадающим списком
 */
export class HeadingPlugin implements AuroraPlugin {
  name = 'heading';
  title = 'Заголовок';
  icon = 'H';
  isDropdown = true;

  /**
   * Опции для выпадающего списка
   */
  readonly options: HeadingOption[] = [
    { value: 'h1', label: 'Заголовок 1', tag: 'H1' },
    { value: 'h2', label: 'Заголовок 2', tag: 'H2' },
    { value: 'h3', label: 'Заголовок 3', tag: 'H3' },
    { value: 'h4', label: 'Заголовок 4', tag: 'H4' },
    { value: 'h5', label: 'Заголовок 5', tag: 'H5' },
    { value: 'h6', label: 'Заголовок 6', tag: 'H6' },
  ];

  /**
   * Выполнить команду форматирования
   * @param editorElement - элемент редактора
   * @param value - значение из выпадающего списка (h1, h2, h3, h4, h5, h6)
   */
  execute(editorElement: HTMLElement, value?: string): boolean {
    // Если значение не передано, используем H2 по умолчанию
    const headingValue = value || 'h2';

    // Находим соответствующую опцию
    const option = this.options.find((opt) => opt.value === headingValue);
    if (!option) {
      console.error('[HeadingPlugin] Invalid heading value:', headingValue);
      return false;
    }

    try {
      const success = document.execCommand('formatBlock', false, `<${option.tag}>`);
      if (success) {
        console.log(`[HeadingPlugin] Applied ${option.tag} format`);
      }
      return success;
    } catch (error) {
      console.error('[HeadingPlugin] Error:', error);
      return false;
    }
  }

  /**
   * Проверить, активен ли заголовок
   */
  isActive(editorElement: HTMLElement): boolean {
    const value = this.getCurrentValue(editorElement);
    return value !== '';
  }

  /**
   * Получить текущий выбранный уровень заголовка
   * Возвращает значение активного заголовка (h1, h2, h3, h4, h5, h6) или пустую строку
   */
  getCurrentValue(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    let node: Node | null = selection.anchorNode;
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName;

        // Проверяем все уровни заголовков
        if (tagName === 'H1') return 'h1';
        if (tagName === 'H2') return 'h2';
        if (tagName === 'H3') return 'h3';
        if (tagName === 'H4') return 'h4';
        if (tagName === 'H5') return 'h5';
        if (tagName === 'H6') return 'h6';
      }
      node = node.parentNode;
    }

    return '';
  }

  /**
   * Получить метку текущего заголовка для отображения в кнопке
   */
  getCurrentLabel(editorElement: HTMLElement): string {
    const value = this.getCurrentValue(editorElement);
    if (!value) return this.title;

    const option = this.options.find((opt) => opt.value === value);
    return option ? option.label : this.title;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[HeadingPlugin] Initialized with options:', this.options);
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[HeadingPlugin] Destroyed');
  }
}
