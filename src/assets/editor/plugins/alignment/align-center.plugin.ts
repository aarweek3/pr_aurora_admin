/**
 * ════════════════════════════════════════════════════════════════════════════
 * ALIGN CENTER PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выравнивания текста по центру.
 *
 * @module AlignCenterPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин выравнивания текста по центру
 */
export class AlignCenterPlugin implements AuroraPlugin {
  name = 'alignCenter';
  title = 'Выровнять по центру';
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g transform="scale(1.5000) translate(0, 0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.07.992h5.979V2.99h-5.98V.992zM3.077 4.988h9.97v1.997h-9.97V4.989zm8.952 4.003H4.08v1.998h7.949V8.99zM1.031 12.994h14v1.998h-14v-1.998z" fill="currentColor"/></g></svg>';
  shortcut = 'Ctrl+Shift+E';

  /**
   * Выполнить выравнивание по центру
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const parentBlock = this.getParentBlock(range.startContainer);

    if (parentBlock && parentBlock !== editorElement) {
      parentBlock.style.textAlign = 'center';
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
      return align === 'center';
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
