/**
 * ════════════════════════════════════════════════════════════════════════════
 * ITALIC PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования текста курсивом.
 * Использует тег <em>.
 * Горячая клавиша: Ctrl+I
 *
 * @module ItalicPlugin
 */

import { BaseFormatPlugin } from '../aurora-plugin.interface';

/**
 * Плагин курсивного текста
 */
export class ItalicPlugin extends BaseFormatPlugin {
  name = 'italic';
  title = 'Курсив';
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g transform="scale(0.0514) translate(0, 0)"><path fill="currentColor" d="M433.333,0v33.333h-66.667L200,433.333h66.667v33.333H33.333v-33.333H100l166.667-400H200V0H433.333z"/></g></svg>';
  shortcut = 'Ctrl+I';

  protected tagName = 'em';

  /**
   * Инициализация плагина
   */
  override init(): void {
    console.log('[ItalicPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  override destroy(): void {
    console.log('[ItalicPlugin] Destroyed');
  }
}
