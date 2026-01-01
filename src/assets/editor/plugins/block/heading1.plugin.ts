/**
 * ════════════════════════════════════════════════════════════════════════════
 * HEADING 1 PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста как заголовок H1.
 *
 * @module Heading1Plugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин заголовка H1
 */
export class Heading1Plugin implements AuroraPlugin {
  name = 'h1';
  title = 'Заголовок 1';
  icon = 'H1';
  shortcut = 'Ctrl+Alt+1';

  /**
   * Выполнить команду форматирования
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const success = document.execCommand('formatBlock', false, '<H1>');
      if (success) {
        console.log('[Heading1Plugin] Applied H1 format');
      }
      return success;
    } catch (error) {
      console.error('[Heading1Plugin] Error:', error);
      return false;
    }
  }

  /**
   * Проверить, активен ли H1
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'H1') {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  init(): void {
    console.log('[Heading1Plugin] Initialized');
  }

  destroy(): void {
    console.log('[Heading1Plugin] Destroyed');
  }
}
