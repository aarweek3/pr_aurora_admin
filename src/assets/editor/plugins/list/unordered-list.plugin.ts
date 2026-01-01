/**
 * ════════════════════════════════════════════════════════════════════════════
 * UNORDERED LIST PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для создания маркированного списка.
 * Использует команду insertUnorderedList через execCommand.
 *
 * @module UnorderedListPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин маркированного списка
 */
export class UnorderedListPlugin implements AuroraPlugin {
  name = 'unorderedList';
  title = 'Маркированный список';
  icon = '•'; // Иконка маркированного списка
  shortcut = undefined;

  /**
   * Выполнить команду создания маркированного списка
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    try {
      // Используем нативную команду insertUnorderedList
      document.execCommand('insertUnorderedList', false);
      return true;
    } catch (error) {
      console.error('[UnorderedListPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Проверить, находится ли курсор в маркированном списке
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
        if (element.tagName.toLowerCase() === 'ul') {
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
    console.log('[UnorderedListPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[UnorderedListPlugin] Destroyed');
  }
}
