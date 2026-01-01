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
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g transform="scale(1.5000) translate(0, 0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.011 1h-14v2h14V1zm0 4h-14v2h14V5zm-14 4h14v2h-14V9zm14 4h-14v2h14v-2z" fill="currentColor"/></g></svg>';
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
