/**
 * ════════════════════════════════════════════════════════════════════════════
 * TEXT ALIGNMENT ADVANCED PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин расширенных настроек выравнивания текста:
 * - Text Indent (красная строка)
 * - Letter Spacing (межбуквенный интервал)
 * - Word Spacing (интервал между словами)
 * - Vertical Align (вертикальное выравнивание)
 *
 * @module TextAlignmentAdvancedPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Настройки text-indent
 */
export interface TextIndentOption {
  name: string;
  value: string;
  emoji: string;
}

/**
 * Настройки letter-spacing
 */
export interface LetterSpacingOption {
  name: string;
  value: string;
  emoji: string;
}

/**
 * Настройки word-spacing
 */
export interface WordSpacingOption {
  name: string;
  value: string;
  emoji: string;
}

/**
 * Настройки vertical-align
 */
export interface VerticalAlignOption {
  name: string;
  value: string;
  emoji: string;
}

/**
 * Плагин расширенных настроек выравнивания
 */
export class TextAlignmentAdvancedPlugin implements AuroraPlugin {
  name = 'textAlignmentAdvanced';
  title = 'Расширенное выравнивание';
  icon = '📏'; // Линейка
  isDropdown = true;

  /**
   * Опции text-indent (красная строка)
   */
  private readonly textIndentOptions: TextIndentOption[] = [
    { name: 'Нет отступа', value: '0', emoji: '⬜' },
    { name: '1em', value: '1em', emoji: '▫️' },
    { name: '2em', value: '2em', emoji: '▫️▫️' },
    { name: '3em', value: '3em', emoji: '▫️▫️▫️' },
  ];

  /**
   * Опции letter-spacing (межбуквенный интервал)
   */
  private readonly letterSpacingOptions: LetterSpacingOption[] = [
    { name: 'Сжатый (-1px)', value: '-1px', emoji: '🔤' },
    { name: 'Нормальный', value: 'normal', emoji: '🔡' },
    { name: 'Расширенный 1px', value: '1px', emoji: '🔠' },
    { name: 'Расширенный 2px', value: '2px', emoji: '🅰️' },
    { name: 'Расширенный 3px', value: '3px', emoji: '🅱️' },
  ];

  /**
   * Опции word-spacing (интервал между словами)
   */
  private readonly wordSpacingOptions: WordSpacingOption[] = [
    { name: 'Сжатый (-1px)', value: '-1px', emoji: '📉' },
    { name: 'Нормальный', value: 'normal', emoji: '📊' },
    { name: 'Расширенный 2px', value: '2px', emoji: '📈' },
    { name: 'Расширенный 4px', value: '4px', emoji: '📶' },
  ];

  /**
   * Опции vertical-align (вертикальное выравнивание)
   */
  private readonly verticalAlignOptions: VerticalAlignOption[] = [
    { name: 'Top (Верх)', value: 'top', emoji: '⬆️' },
    { name: 'Middle (Центр)', value: 'middle', emoji: '↔️' },
    { name: 'Bottom (Низ)', value: 'bottom', emoji: '⬇️' },
    { name: 'Baseline (Базовая линия)', value: 'baseline', emoji: '📏' },
  ];

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[TextAlignmentAdvancedPlugin] Initialized');
  }

  /**
   * Выполнить команду применения стиля
   */
  execute(
    editorElement: HTMLElement,
    options?: {
      type?: 'textIndent' | 'letterSpacing' | 'wordSpacing' | 'verticalAlign';
      value?: string;
    }
  ): boolean {
    try {
      if (!options?.type || !options?.value) {
        console.warn('[TextAlignmentAdvancedPlugin] Missing type or value');
        return false;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Применяем стиль в зависимости от типа
      switch (options.type) {
        case 'textIndent':
          this.applyTextIndent(range, editorElement, options.value);
          break;
        case 'letterSpacing':
          this.applyLetterSpacing(range, options.value);
          break;
        case 'wordSpacing':
          this.applyWordSpacing(range, options.value);
          break;
        case 'verticalAlign':
          this.applyVerticalAlign(range, options.value);
          break;
        default:
          return false;
      }

      // Триггерим событие input для обновления состояния
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));

      return true;
    } catch (error) {
      console.error('[TextAlignmentAdvancedPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Применить text-indent (красная строка)
   * Применяется к блочным элементам
   */
  private applyTextIndent(range: Range, editorElement: HTMLElement, value: string): void {
    try {
      const block = this.getBlockElement(range.commonAncestorContainer, editorElement);

      if (block) {
        if (value === '0' || value === 'normal') {
          block.style.textIndent = '';
        } else {
          block.style.textIndent = value;
        }
      }
    } catch (error) {
      console.error('[TextAlignmentAdvancedPlugin] Error applying text-indent:', error);
    }
  }

  /**
   * Применить letter-spacing (межбуквенный интервал)
   * Может применяться как к блокам, так и к inline элементам
   */
  private applyLetterSpacing(range: Range, value: string): void {
    try {
      // Если выделение есть, оборачиваем в span
      if (!range.collapsed) {
        const span = document.createElement('span');

        if (value === 'normal') {
          span.style.letterSpacing = '';
        } else {
          span.style.letterSpacing = value;
        }

        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);

        // Восстанавливаем выделение
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }
    } catch (error) {
      console.error('[TextAlignmentAdvancedPlugin] Error applying letter-spacing:', error);
    }
  }

  /**
   * Применить word-spacing (интервал между словами)
   * Может применяться как к блокам, так и к inline элементам
   */
  private applyWordSpacing(range: Range, value: string): void {
    try {
      // Если выделение есть, оборачиваем в span
      if (!range.collapsed) {
        const span = document.createElement('span');

        if (value === 'normal') {
          span.style.wordSpacing = '';
        } else {
          span.style.wordSpacing = value;
        }

        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);

        // Восстанавливаем выделение
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }
    } catch (error) {
      console.error('[TextAlignmentAdvancedPlugin] Error applying word-spacing:', error);
    }
  }

  /**
   * Применить vertical-align (вертикальное выравнивание)
   * Применяется только к inline элементам
   */
  private applyVerticalAlign(range: Range, value: string): void {
    try {
      // Если выделение есть, оборачиваем в span
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.verticalAlign = value;

        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);

        // Восстанавливаем выделение
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }
    } catch (error) {
      console.error('[TextAlignmentAdvancedPlugin] Error applying vertical-align:', error);
    }
  }

  /**
   * Найти родительский блочный элемент
   */
  private getBlockElement(node: Node, editorElement: HTMLElement): HTMLElement | null {
    let current: Node | null = node;

    while (current && current !== editorElement) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (this.isBlockElement(tagName)) {
          return element;
        }
      }
      current = current.parentNode;
    }

    return null;
  }

  /**
   * Проверить, является ли тег блочным элементом
   */
  private isBlockElement(tagName: string): boolean {
    const blockElements = [
      'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'ul', 'ol', 'li'
    ];
    return blockElements.includes(tagName);
  }

  /**
   * Получить опции text-indent
   */
  getTextIndentOptions(): TextIndentOption[] {
    return this.textIndentOptions;
  }

  /**
   * Получить опции letter-spacing
   */
  getLetterSpacingOptions(): LetterSpacingOption[] {
    return this.letterSpacingOptions;
  }

  /**
   * Получить опции word-spacing
   */
  getWordSpacingOptions(): WordSpacingOption[] {
    return this.wordSpacingOptions;
  }

  /**
   * Получить опции vertical-align
   */
  getVerticalAlignOptions(): VerticalAlignOption[] {
    return this.verticalAlignOptions;
  }

  /**
   * Проверить, активен ли плагин
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[TextAlignmentAdvancedPlugin] Destroyed');
  }
}
