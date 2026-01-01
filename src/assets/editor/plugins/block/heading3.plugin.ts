/**
 * ════════════════════════════════════════════════════════════════════════════
 * HEADING 3 PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста как заголовок H3.
 *
 * @module Heading3Plugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин заголовка H3
 */
export class Heading3Plugin implements AuroraPlugin {
  name = 'h3';
  title = 'Заголовок 3';
  icon = 'H3';
  shortcut = 'Ctrl+Alt+3';

  /**
   * Выполнить команду форматирования
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const success = document.execCommand('formatBlock', false, '<H3>');
      if (success) {
        console.log('[Heading3Plugin] Applied H3 format');
      }
      return success;
    } catch (error) {
      console.error('[Heading3Plugin] Error:', error);
      return false;
    }
  }

  /**
   * Проверить, активен ли H3
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'H3') {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  init(): void {
    console.log('[Heading3Plugin] Initialized');
  }

  destroy(): void {
    console.log('[Heading3Plugin] Destroyed');
  }
}
