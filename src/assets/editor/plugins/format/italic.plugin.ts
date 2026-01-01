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
  icon = '𝐼'; // Unicode italic I
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
