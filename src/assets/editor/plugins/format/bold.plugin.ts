/**
 * ════════════════════════════════════════════════════════════════════════════
 * BOLD PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста жирным шрифтом.
 * Использует тег <strong>.
 * Горячая клавиша: Ctrl+B
 *
 * @module BoldPlugin
 */

import { BaseFormatPlugin } from '../aurora-plugin.interface';

/**
 * Плагин жирного текста
 */
export class BoldPlugin extends BaseFormatPlugin {
  name = 'bold';
  title = 'Жирный';
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g transform="scale(1.5000) translate(0, 0)"><path fill="currentColor" d="M11 7.5c0 0 2-0.8 2-3.6 0-4.1-5.1-3.9-7-3.9h-4v16h4c3.7 0 8 0 8-4.4 0-3.8-3-4.1-3-4.1zM9 4.4c0 1.8-1.5 1.6-3 1.6v-3c1.8 0 3 0.1 3 1.4zM6 13v-4c1.8 0 4-0.3 4 2.2 0 1.9-2.5 1.8-4 1.8z"/></g></svg>';
  shortcut = 'Ctrl+B';

  protected tagName = 'strong';

  /**
   * Инициализация плагина
   */
  override init(): void {
    console.log('[BoldPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  override destroy(): void {
    console.log('[BoldPlugin] Destroyed');
  }
}
