/**
 * ════════════════════════════════════════════════════════════════════════════
 * HEADING 2 PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста как заголовок H2.
 *
 * @module Heading2Plugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин заголовка H2
 */
export class Heading2Plugin implements AuroraPlugin {
  name = 'h2';
  title = 'Заголовок 2';
  icon = 'H2';
  shortcut = 'Ctrl+Alt+2';

  /**
   * Выполнить команду форматирования
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const success = document.execCommand('formatBlock', false, '<H2>');
      if (success) {
        console.log('[Heading2Plugin] Applied H2 format');
      }
      return success;
    } catch (error) {
      console.error('[Heading2Plugin] Error:', error);
      return false;
    }
  }

  /**
   * Проверить, активен ли H2
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'H2') {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  init(): void {
    console.log('[Heading2Plugin] Initialized');
  }

  destroy(): void {
    console.log('[Heading2Plugin] Destroyed');
  }
}
