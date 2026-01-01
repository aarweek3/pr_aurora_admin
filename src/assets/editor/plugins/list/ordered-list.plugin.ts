/**
 * ════════════════════════════════════════════════════════════════════════════
 * ORDERED LIST PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для создания нумерованного списка.
 * Использует команду insertOrderedList через execCommand.
 *
 * @module OrderedListPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин нумерованного списка
 */
export class OrderedListPlugin implements AuroraPlugin {
  name = 'orderedList';
  title = 'Нумерованный список';
  icon = '1.'; // Иконка нумерованного списка
  shortcut = undefined;

  /**
   * Выполнить команду создания нумерованного списка
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    try {
      // Используем нативную команду insertOrderedList
      document.execCommand('insertOrderedList', false);
      return true;
    } catch (error) {
      console.error('[OrderedListPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Проверить, находится ли курсор в нумерованном списке
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    let node: Node | null = selection.anchorNode;

    // Проходим по родителям до редактора
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === 'ol') {
          return true;
        }
      }
      node = node.parentNode;
    }

    return false;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[OrderedListPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[OrderedListPlugin] Destroyed');
  }
}
