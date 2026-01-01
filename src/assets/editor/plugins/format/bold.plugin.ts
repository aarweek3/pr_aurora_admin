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
  icon = '𝐁'; // Unicode bold B
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
