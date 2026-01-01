/**
 * ════════════════════════════════════════════════════════════════════════════
 * STRIKETHROUGH PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для зачёркивания текста.
 * Использует тег <s>.
 *
 * @module StrikethroughPlugin
 */

import { BaseFormatPlugin } from '../aurora-plugin.interface';

/**
 * Плагин зачёркнутого текста
 */
export class StrikethroughPlugin extends BaseFormatPlugin {
  name = 'strikethrough';
  title = 'Зачёркнутый';
  icon = 'S̶'; // S с перечёркиванием
  shortcut = undefined; // Нет стандартной горячей клавиши

  protected tagName = 's';

  /**
   * Инициализация плагина
   */
  override init(): void {
    console.log('[StrikethroughPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  override destroy(): void {
    console.log('[StrikethroughPlugin] Destroyed');
  }
}
