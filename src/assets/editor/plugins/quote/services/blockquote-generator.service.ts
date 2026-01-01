/**
 * Генератор HTML/CSS для blockquote элементов
 *
 * @module BlockquoteGenerator
 * @description
 * Статический класс для генерации и применения стилей к blockquote элементам.
 * Преобразует объекты BlockquoteStyle в реальные HTML элементы с inline стилями.
 */

import {
  BlockquoteData,
  BlockquoteStyle,
  FooterStyles,
  QuoteStyles,
} from '../types/blockquote-styles.types';

// ═══════════════════════════════════════════════════════
// ГЕНЕРАТОР
// ═══════════════════════════════════════════════════════

/**
 * Статический класс для работы с blockquote элементами
 */
export class BlockquoteGenerator {
  // ═══════════════════════════════════════════════════════
  // ГЕНЕРАЦИЯ HTML
  // ═══════════════════════════════════════════════════════

  /**
   * Создать HTML элемент blockquote со стилями
   *
   * @param data - Данные цитаты (текст, автор, источник)
   * @param style - Стиль оформления
   * @returns HTMLElement - Готовый blockquote элемент
   *
   * @example
   * ```typescript
   * const blockquote = BlockquoteGenerator.createBlockquote({
   *   text: 'Цитата',
   *   author: 'Автор',
   *   source: 'Источник',
   *   styleId: 'preset-classic'
   * }, classicStyle);
   *
   * document.body.appendChild(blockquote);
   * ```
   */
  static createBlockquote(data: BlockquoteData, style: BlockquoteStyle): HTMLElement {
    // Создаём blockquote контейнер
    const blockquote = document.createElement('blockquote');
    blockquote.classList.add('aurora-blockquote');
    blockquote.setAttribute('data-style-id', style.id);

    // Применяем основные стили к blockquote
    this.applyStylesToBlockquote(blockquote, style.quote);

    // Создаём псевдоэлемент ::before (если есть контент)
    if (style.quote.beforeContent) {
      const beforeElement = this.createBeforeElement(style.quote);
      if (beforeElement) {
        blockquote.appendChild(beforeElement);
      }
    }

    // Создаём параграф с текстом цитаты
    const textParagraph = document.createElement('p');
    textParagraph.classList.add('aurora-blockquote-text');
    textParagraph.textContent = data.text;
    textParagraph.style.margin = '0';
    blockquote.appendChild(textParagraph);

    // Создаём footer (если есть автор или источник)
    if (data.author || data.source) {
      const footer = this.createFooter(data, style.footer);
      blockquote.appendChild(footer);
    }

    return blockquote;
  }

  /**
   * Создать HTML строку blockquote
   *
   * @param data - Данные цитаты
   * @param style - Стиль оформления
   * @returns string - HTML строка
   *
   * @example
   * ```typescript
   * const html = BlockquoteGenerator.createBlockquoteHTML(data, style);
   * editor.insertHTML(html);
   * ```
   */
  static createBlockquoteHTML(data: BlockquoteData, style: BlockquoteStyle): string {
    const element = this.createBlockquote(data, style);
    return element.outerHTML;
  }

  // ═══════════════════════════════════════════════════════
  // ПРИМЕНЕНИЕ СТИЛЕЙ К BLOCKQUOTE
  // ═══════════════════════════════════════════════════════

  /**
   * Применить стили к blockquote элементу
   *
   * @param element - HTML элемент blockquote
   * @param styles - Объект стилей
   */
  static applyStylesToBlockquote(element: HTMLElement, styles: QuoteStyles): void {
    const cssStyle = element.style;

    // Основные стили
    if (styles.backgroundColor) {
      cssStyle.background = styles.backgroundColor;
    }

    if (styles.borderColor && styles.borderWidth && styles.borderStyle) {
      const borderString = this.getBorderString(styles);
      cssStyle.border = borderString;
      cssStyle.borderColor = styles.borderColor;
    }

    if (styles.padding) {
      cssStyle.padding = styles.padding;
    }

    if (styles.margin) {
      cssStyle.margin = styles.margin;
    }

    if (styles.borderRadius) {
      cssStyle.borderRadius = styles.borderRadius;
    }

    // Стили текста
    if (styles.fontStyle) {
      cssStyle.fontStyle = styles.fontStyle;
    }

    if (styles.fontSize) {
      cssStyle.fontSize = styles.fontSize;
    }

    if (styles.color) {
      cssStyle.color = styles.color;
    }

    if (styles.lineHeight) {
      cssStyle.lineHeight = styles.lineHeight;
    }

    // Эффекты
    if (styles.boxShadow) {
      cssStyle.boxShadow = styles.boxShadow;
    }

    if (styles.opacity) {
      cssStyle.opacity = styles.opacity;
    }

    // Позиционирование для ::before
    cssStyle.position = 'relative';
  }

  /**
   * Получить строку border из компонентов
   *
   * @param styles - Объект стилей quote
   * @returns string - CSS строка border
   * @private
   *
   * @example
   * getBorderString({ borderWidth: '4px', borderStyle: 'solid', borderColor: '#ccc' })
   * // => '4px solid #ccc'
   */
  private static getBorderString(styles: QuoteStyles): string {
    const width = styles.borderWidth || '0';
    const style = styles.borderStyle || 'solid';
    const color = styles.borderColor || 'transparent';

    return `${width} ${style} ${color}`;
  }

  // ═══════════════════════════════════════════════════════
  // ПСЕВДОЭЛЕМЕНТ ::BEFORE (КАВЫЧКИ, ИКОНКИ)
  // ═══════════════════════════════════════════════════════

  /**
   * Создать элемент имитирующий ::before (кавычки, emoji)
   *
   * @param styles - Объект стилей quote
   * @returns HTMLSpanElement | null
   * @private
   *
   * @example
   * ```typescript
   * const before = BlockquoteGenerator.createBeforeElement({
   *   beforeContent: '"',
   *   beforeFontSize: '4em',
   *   beforeColor: '#ccc',
   *   beforeOpacity: '0.3',
   *   beforePosition: { left: '-0.4em', top: '-0.2em' }
   * });
   * ```
   */
  private static createBeforeElement(styles: QuoteStyles): HTMLSpanElement | null {
    if (!styles.beforeContent) return null;

    const span = document.createElement('span');
    span.classList.add('aurora-blockquote-before');

    // Декодируем unicode последовательности (\u201C → ")
    span.textContent = this.decodeUnicodeContent(styles.beforeContent);

    // Стили позиционирования
    span.style.position = 'absolute';
    span.style.pointerEvents = 'none';
    span.style.userSelect = 'none';

    // Позиция
    if (styles.beforePosition) {
      if (styles.beforePosition.left) {
        span.style.left = styles.beforePosition.left;
      }
      if (styles.beforePosition.right) {
        span.style.right = styles.beforePosition.right;
      }
      if (styles.beforePosition.top) {
        span.style.top = styles.beforePosition.top;
      }
      if (styles.beforePosition.bottom) {
        span.style.bottom = styles.beforePosition.bottom;
      }
    }

    // Стили текста
    if (styles.beforeFontSize) {
      span.style.fontSize = styles.beforeFontSize;
    }

    if (styles.beforeColor) {
      span.style.color = styles.beforeColor;
    }

    if (styles.beforeOpacity) {
      span.style.opacity = styles.beforeOpacity;
    }

    // Семейство шрифта (для эмодзи)
    span.style.fontFamily = 'inherit';
    span.style.lineHeight = '1';

    return span;
  }

  /**
   * Декодировать unicode последовательности
   *
   * @param content - Строка с unicode (\u201C, \u275D и т.д.)
   * @returns string - Декодированная строка
   * @private
   *
   * @example
   * decodeUnicodeContent('"\\u201C"') // => '"'
   * decodeUnicodeContent('"💬"')      // => '💬'
   */
  private static decodeUnicodeContent(content: string): string {
    // Убираем кавычки, если они есть
    let cleaned = content.replace(/^["']|["']$/g, '');

    // Декодируем \uXXXX последовательности
    cleaned = cleaned.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });

    return cleaned;
  }

  // ═══════════════════════════════════════════════════════
  // FOOTER (АВТОР И ИСТОЧНИК)
  // ═══════════════════════════════════════════════════════

  /**
   * Создать footer элемент с автором и источником
   *
   * @param data - Данные цитаты
   * @param styles - Объект стилей footer
   * @returns HTMLElement
   * @private
   *
   * @example
   * ```html
   * <footer class="aurora-blockquote-footer">
   *   — <cite>Источник</cite>, Автор
   * </footer>
   * ```
   */
  private static createFooter(data: BlockquoteData, styles: FooterStyles): HTMLElement {
    const footer = document.createElement('footer');
    footer.classList.add('aurora-blockquote-footer');

    // Применяем стили footer
    this.applyStylesToFooter(footer, styles);

    // Формируем текст: "— Источник, Автор"
    const parts: string[] = [];

    if (data.source) {
      const cite = document.createElement('cite');
      cite.textContent = data.source;
      this.applyStylesToCite(cite, styles);

      // Создаём текстовый узел с тире
      const dash = document.createTextNode('— ');
      footer.appendChild(dash);
      footer.appendChild(cite);

      if (data.author) {
        const comma = document.createTextNode(', ');
        footer.appendChild(comma);
      }
    }

    if (data.author) {
      if (!data.source) {
        const dash = document.createTextNode('— ');
        footer.appendChild(dash);
      }
      const authorText = document.createTextNode(data.author);
      footer.appendChild(authorText);
    }

    return footer;
  }

  /**
   * Применить стили к footer элементу
   *
   * @param element - HTML элемент footer
   * @param styles - Объект стилей footer
   * @private
   */
  private static applyStylesToFooter(element: HTMLElement, styles: FooterStyles): void {
    const cssStyle = element.style;

    if (styles.fontSize) {
      cssStyle.fontSize = styles.fontSize;
    }

    if (styles.color) {
      cssStyle.color = styles.color;
    }

    if (styles.fontStyle) {
      cssStyle.fontStyle = styles.fontStyle;
    }

    if (styles.fontWeight) {
      cssStyle.fontWeight = styles.fontWeight;
    }

    if (styles.textAlign) {
      cssStyle.textAlign = styles.textAlign;
    }

    if (styles.marginTop) {
      cssStyle.marginTop = styles.marginTop;
    }

    if (styles.marginBottom) {
      cssStyle.marginBottom = styles.marginBottom;
    }
  }

  /**
   * Применить стили к cite элементу
   *
   * @param element - HTML элемент cite
   * @param styles - Объект стилей footer
   * @private
   */
  private static applyStylesToCite(element: HTMLElement, styles: FooterStyles): void {
    const cssStyle = element.style;

    if (styles.citeColor) {
      cssStyle.color = styles.citeColor;
    }

    if (styles.citeFontWeight) {
      cssStyle.fontWeight = styles.citeFontWeight;
    }

    if (styles.citeFontStyle) {
      cssStyle.fontStyle = styles.citeFontStyle;
    }
  }

  // ═══════════════════════════════════════════════════════
  // ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕГО BLOCKQUOTE
  // ═══════════════════════════════════════════════════════

  /**
   * Обновить стили существующего blockquote элемента
   *
   * @param element - Существующий blockquote элемент
   * @param style - Новый стиль
   *
   * @example
   * ```typescript
   * const blockquote = document.querySelector('blockquote');
   * BlockquoteGenerator.updateBlockquoteStyle(blockquote, modernStyle);
   * ```
   */
  static updateBlockquoteStyle(element: HTMLElement, style: BlockquoteStyle): void {
    // Обновляем атрибут style-id
    element.setAttribute('data-style-id', style.id);

    // Удаляем старый ::before элемент
    const oldBefore = element.querySelector('.aurora-blockquote-before');
    if (oldBefore) {
      oldBefore.remove();
    }

    // Применяем новые стили к blockquote
    this.applyStylesToBlockquote(element, style.quote);

    // Создаём новый ::before элемент
    if (style.quote.beforeContent) {
      const beforeElement = this.createBeforeElement(style.quote);
      if (beforeElement) {
        element.insertBefore(beforeElement, element.firstChild);
      }
    }

    // Обновляем footer (если есть)
    const footer = element.querySelector('.aurora-blockquote-footer') as HTMLElement;
    if (footer) {
      this.applyStylesToFooter(footer, style.footer);

      // Обновляем cite
      const cite = footer.querySelector('cite') as HTMLElement;
      if (cite) {
        this.applyStylesToCite(cite, style.footer);
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // ПОЛУЧЕНИЕ CSS ОБЪЕКТА (ДЛЯ ПРЕВЬЮ)
  // ═══════════════════════════════════════════════════════

  /**
   * Получить CSS объект для blockquote (для inline стилей в превью)
   *
   * @param styles - Объект стилей quote
   * @returns Record<string, string> - CSS объект для [ngStyle]
   *
   * @example
   * ```html
   * <blockquote [ngStyle]="getBlockquoteCSSObject(style.quote)">
   *   Превью цитаты
   * </blockquote>
   * ```
   */
  static getBlockquoteCSSObject(styles: QuoteStyles): Record<string, string> {
    const css: Record<string, string> = {
      position: 'relative',
    };

    if (styles.backgroundColor) css['background'] = styles.backgroundColor;
    if (styles.borderColor && styles.borderWidth && styles.borderStyle) {
      css['border'] = this.getBorderString(styles);
      css['border-color'] = styles.borderColor;
    }
    if (styles.padding) css['padding'] = styles.padding;
    if (styles.margin) css['margin'] = styles.margin;
    if (styles.borderRadius) css['border-radius'] = styles.borderRadius;
    if (styles.fontStyle) css['font-style'] = styles.fontStyle;
    if (styles.fontSize) css['font-size'] = styles.fontSize;
    if (styles.color) css['color'] = styles.color;
    if (styles.lineHeight) css['line-height'] = styles.lineHeight;
    if (styles.boxShadow) css['box-shadow'] = styles.boxShadow;
    if (styles.opacity) css['opacity'] = styles.opacity;

    return css;
  }

  /**
   * Получить CSS объект для footer
   *
   * @param styles - Объект стилей footer
   * @returns Record<string, string> - CSS объект для [ngStyle]
   */
  static getFooterCSSObject(styles: FooterStyles): Record<string, string> {
    const css: Record<string, string> = {};

    if (styles.fontSize) css['font-size'] = styles.fontSize;
    if (styles.color) css['color'] = styles.color;
    if (styles.fontStyle) css['font-style'] = styles.fontStyle;
    if (styles.fontWeight) css['font-weight'] = styles.fontWeight;
    if (styles.textAlign) css['text-align'] = styles.textAlign;
    if (styles.marginTop) css['margin-top'] = styles.marginTop;
    if (styles.marginBottom) css['margin-bottom'] = styles.marginBottom;

    return css;
  }

  // ═══════════════════════════════════════════════════════
  // ИЗВЛЕЧЕНИЕ ДАННЫХ ИЗ СУЩЕСТВУЮЩЕГО BLOCKQUOTE
  // ═══════════════════════════════════════════════════════

  /**
   * Извлечь данные из существующего blockquote элемента
   *
   * @param element - HTML элемент blockquote
   * @returns BlockquoteData | null
   *
   * @example
   * ```typescript
   * const blockquote = editor.getSelectedElement();
   * const data = BlockquoteGenerator.extractDataFromBlockquote(blockquote);
   * // { text: '...', author: '...', source: '...', styleId: '...' }
   * ```
   */
  static extractDataFromBlockquote(element: HTMLElement): BlockquoteData | null {
    if (element.tagName !== 'BLOCKQUOTE') {
      return null;
    }

    // Получаем styleId
    const styleId = element.getAttribute('data-style-id') || 'preset-classic';

    // Извлекаем текст (параграф или весь текст)
    const textParagraph = element.querySelector('.aurora-blockquote-text');
    const text = textParagraph ? textParagraph.textContent || '' : element.textContent || '';

    // Извлекаем footer
    const footer = element.querySelector('.aurora-blockquote-footer');
    let author: string | undefined;
    let source: string | undefined;

    if (footer) {
      const cite = footer.querySelector('cite');
      if (cite) {
        source = cite.textContent || undefined;
      }

      // Автор - это текст после cite
      const footerText = footer.textContent || '';
      if (source) {
        const parts = footerText.split(source);
        if (parts[1]) {
          author = parts[1].replace(/^[,\s—]+|[,\s]+$/g, '').trim();
        }
      } else {
        author = footerText.replace(/^[,\s—]+|[,\s]+$/g, '').trim();
      }
    }

    return {
      text: text.trim(),
      author,
      source,
      styleId,
    };
  }

  // ═══════════════════════════════════════════════════════
  // УТИЛИТЫ
  // ═══════════════════════════════════════════════════════

  /**
   * Проверить, является ли элемент blockquote
   *
   * @param element - HTML элемент
   * @returns boolean
   */
  static isBlockquote(element: HTMLElement | null): boolean {
    return element?.tagName === 'BLOCKQUOTE';
  }

  /**
   * Найти ближайший родительский blockquote
   *
   * @param element - HTML элемент
   * @returns HTMLElement | null
   *
   * @example
   * ```typescript
   * const selection = window.getSelection();
   * const node = selection?.anchorNode?.parentElement;
   * const blockquote = BlockquoteGenerator.findParentBlockquote(node);
   * ```
   */
  static findParentBlockquote(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;

    let current: HTMLElement | null = element;

    while (current) {
      if (this.isBlockquote(current)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }
}
