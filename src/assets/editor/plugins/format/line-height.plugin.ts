import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для управления межстрочным интервалом
 *
 * Функциональность:
 * - Dropdown список интервалов (1.0 - 3.0)
 * - Применение к параграфам и блокам текста
 * - Сброс на дефолтный интервал (1.5)
 * - Визуальная индикация текущего значения
 *
 * @example
 * const lineHeightPlugin = new LineHeightPlugin();
 * lineHeightPlugin.execute(editorElement, { lineHeight: '1.5' });
 */
@Injectable()
export class LineHeightPlugin implements AuroraPlugin {
  name = 'lineHeight';
  title = 'Межстрочный интервал';
  icon = '≡';
  shortcut = '';
  isDropdown = true;

  /**
   * Список доступных межстрочных интервалов
   */
  readonly lineHeights = [
    { value: '', label: 'По умолчанию' },
    { value: '1.0', label: '1.0 (одинарный)' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5 (полуторный)' },
    { value: '2.0', label: '2.0 (двойной)' },
    { value: '2.5', label: '2.5' },
    { value: '3.0', label: '3.0' },
  ];

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[LineHeightPlugin] Initialized');
  }

  /**
   * Выполнение команды установки межстрочного интервала
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - { lineHeight: string } - интервал (например, '1.5')
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: { lineHeight: string }): boolean {
    if (!editorElement) {
      console.warn('[LineHeightPlugin] Editor element not provided');
      return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[LineHeightPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);
    const lineHeight = options?.lineHeight || '';

    console.log('[LineHeightPlugin] Applying line-height:', lineHeight);

    try {
      // Получаем все блочные элементы в выделении
      const blocks = this.getBlockElementsInRange(range, editorElement);

      if (blocks.length === 0) {
        // Если нет выделения, применяем к текущему параграфу
        const currentBlock = this.getCurrentBlock(selection);
        if (currentBlock && editorElement.contains(currentBlock)) {
          this.applyLineHeight(currentBlock, lineHeight);
        }
      } else {
        // Применяем к каждому блоку в выделении
        blocks.forEach((block) => {
          this.applyLineHeight(block, lineHeight);
        });
      }

      // Диспатчим событие input для регистрации изменения
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));

      console.log('[LineHeightPlugin] Line height applied successfully');
      return true;
    } catch (error) {
      console.error('[LineHeightPlugin] Error applying line height:', error);
      return false;
    }
  }

  /**
   * Применяет line-height к элементу
   */
  private applyLineHeight(element: HTMLElement, lineHeight: string): void {
    if (lineHeight === '') {
      // Сброс на дефолтный - удаляем стиль
      element.style.removeProperty('line-height');

      // Если после удаления style атрибут пустой, удаляем его
      if (!element.getAttribute('style')) {
        element.removeAttribute('style');
      }
    } else {
      element.style.lineHeight = lineHeight;
    }
  }

  /**
   * Получает все блочные элементы в выделении
   */
  private getBlockElementsInRange(range: Range, editorElement: HTMLElement): HTMLElement[] {
    const blocks: HTMLElement[] = [];
    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE'];

    // Получаем общего предка выделения
    const container = range.commonAncestorContainer;
    const containerElement =
      container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as HTMLElement);

    if (!containerElement || !editorElement.contains(containerElement)) {
      return blocks;
    }

    // Если выделение внутри одного блока
    if (
      range.startContainer === range.endContainer ||
      this.getBlockParent(range.startContainer, editorElement) ===
        this.getBlockParent(range.endContainer, editorElement)
    ) {
      const block = this.getBlockParent(range.startContainer, editorElement);
      if (block) {
        blocks.push(block);
      }
      return blocks;
    }

    // Получаем все элементы между начальным и конечным узлом
    const walker = document.createTreeWalker(editorElement, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node: Node) => {
        const element = node as HTMLElement;
        if (!blockTags.includes(element.tagName)) {
          return NodeFilter.FILTER_SKIP;
        }

        if (range.intersectsNode(element)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    });

    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      blocks.push(currentNode as HTMLElement);
    }

    return blocks;
  }

  /**
   * Получает ближайший блочный родительский элемент
   */
  private getBlockParent(node: Node | null, editorElement: HTMLElement): HTMLElement | null {
    if (!node) return null;

    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE'];
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);

    while (current && current !== editorElement) {
      if (blockTags.includes(current.tagName)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  /**
   * Получает текущий блочный элемент по курсору
   */
  private getCurrentBlock(selection: Selection): HTMLElement | null {
    if (!selection.anchorNode) return null;

    let node: Node | null = selection.anchorNode;

    // Если это текстовый узел, берём его родителя
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    // Ищем ближайший блочный элемент
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const display = window.getComputedStyle(element).display;

      if (display === 'block' || element.tagName.match(/^(P|DIV|H[1-6]|BLOCKQUOTE|LI|PRE)$/)) {
        return element;
      }

      node = element.parentElement;
    }

    return null;
  }

  /**
   * Проверяет, активен ли плагин для текущего выделения
   * (возвращает текущее значение line-height)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const currentBlock = this.getCurrentBlock(selection);
    if (!currentBlock) return false;

    const lineHeight = window.getComputedStyle(currentBlock).lineHeight;

    // Проверяем, установлен ли line-height
    return lineHeight !== 'normal' && currentBlock.style.lineHeight !== '';
  }

  /**
   * Получает текущее значение line-height для выделения
   */
  getCurrentValue(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return '';
    }

    const currentBlock = this.getCurrentBlock(selection);
    if (!currentBlock) return '';

    // Возвращаем значение из inline стиля, если есть
    const inlineValue = currentBlock.style.lineHeight;
    if (inlineValue) {
      return inlineValue;
    }

    // Иначе вычисляем из computed стиля
    const computedLineHeight = window.getComputedStyle(currentBlock).lineHeight;

    // Конвертируем px в относительное значение
    if (computedLineHeight !== 'normal' && computedLineHeight.endsWith('px')) {
      const fontSize = window.getComputedStyle(currentBlock).fontSize;
      const lineHeightPx = parseFloat(computedLineHeight);
      const fontSizePx = parseFloat(fontSize);

      if (fontSizePx > 0) {
        const ratio = lineHeightPx / fontSizePx;
        return ratio.toFixed(2);
      }
    }

    return '';
  }
}
