/**
 * ════════════════════════════════════════════════════════════════════════════
 * ALIGN JUSTIFY PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выравнивания текста по ширине.
 *
 * @module AlignJustifyPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин выравнивания текста по ширине
 */
export class AlignJustifyPlugin implements AuroraPlugin {
  name = 'alignJustify';
  title = 'Выровнять по ширине';
  icon = '⬌'; // Стрелки влево-вправо (justify)
  shortcut = 'Ctrl+Shift+J';

  /**
   * Выполнить выравнивание по ширине
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const parentBlock = this.getParentBlock(range.startContainer);

    if (parentBlock && parentBlock !== editorElement) {
      parentBlock.style.textAlign = 'justify';
      return true;
    }

    return false;
  }

  /**
   * Проверить активность плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const parentBlock = this.getParentBlock(range.startContainer);

    if (parentBlock && parentBlock !== editorElement) {
      const align = window.getComputedStyle(parentBlock).textAlign;
      return align === 'justify';
    }

    return false;
  }

  /**
   * Получить родительский блочный элемент
   */
  private getParentBlock(node: Node): HTMLElement | null {
    let current = node instanceof HTMLElement ? node : node.parentElement;

    while (current) {
      const display = window.getComputedStyle(current).display;
      if (
        display === 'block' ||
        current.tagName === 'P' ||
        current.tagName === 'DIV' ||
        current.tagName === 'H1' ||
        current.tagName === 'H2' ||
        current.tagName === 'H3' ||
        current.tagName === 'LI'
      ) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    // Плагин не требует инициализации
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    // Плагин не требует очистки ресурсов
  }
}
