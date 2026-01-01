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
  icon = '⬅️'; // Стрелка влево
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
