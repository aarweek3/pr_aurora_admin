/**
 * ════════════════════════════════════════════════════════════════════════════
 * ALIGN LEFT PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выравнивания текста по левому краю.
 *
 * @module AlignLeftPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин выравнивания текста по левому краю
 */
export class AlignLeftPlugin implements AuroraPlugin {
  name = 'alignLeft';
  title = 'Выровнять по левому краю';
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g transform="scale(1.5000) translate(0, 0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.051 1H1.016v1.973H7.05V1zm4.978 4.009H1.016v1.973h11.013V5.009zM1.016 9.018h9.022v1.973H1.016V9.018zm14 4.009h-14V15h14v-1.973z" fill="currentColor"/></g></svg>';
  shortcut = 'Ctrl+Shift+L';

  /**
   * Выполнить выравнивание по левому краю
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const parentBlock = this.getParentBlock(range.startContainer);

    if (parentBlock && parentBlock !== editorElement) {
      // Убираем все стили выравнивания
      parentBlock.style.textAlign = 'left';

      // Удаляем inline стили если они установлены в "left" (это значение по умолчанию)
      if (parentBlock.style.textAlign === 'left') {
        parentBlock.style.removeProperty('text-align');
      }
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
      return align === 'left' || align === 'start';
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
