/**
 * ════════════════════════════════════════════════════════════════════════════
 * INDENT PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для увеличения отступа блока.
 * Добавляет margin-left: 40px к текущему блоку.
 * Горячая клавиша: Tab
 *
 * @module IndentPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин увеличения отступа
 */
export class IndentPlugin implements AuroraPlugin {
  name = 'indent';
  title = 'Увеличить отступ';
  icon = '→'; // Стрелка вправо
  shortcut = 'Tab';

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[IndentPlugin] Initialized');
  }

  /**
   * Выполнить команду увеличения отступа
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Находим текущий блочный элемент
      const block = this.getBlockElement(range.commonAncestorContainer, editorElement);

      if (!block) {
        return false;
      }

      // Увеличиваем отступ
      this.increaseIndent(block);

      return true;
    } catch (error) {
      console.error('[IndentPlugin] Error executing plugin:', error);
      return false;
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

        // Проверяем, является ли элемент блочным
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
   * Увеличить отступ блока
   */
  private increaseIndent(element: HTMLElement): void {
    const currentIndent = this.getCurrentIndent(element);
    const newIndent = currentIndent + 40; // Увеличиваем на 40px

    element.style.marginLeft = `${newIndent}px`;
  }

  /**
   * Получить текущий отступ элемента
   */
  private getCurrentIndent(element: HTMLElement): number {
    const marginLeft = element.style.marginLeft;
    if (!marginLeft) {
      return 0;
    }

    const value = parseInt(marginLeft, 10);
    return isNaN(value) ? 0 : value;
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
    console.log('[IndentPlugin] Destroyed');
  }
}
