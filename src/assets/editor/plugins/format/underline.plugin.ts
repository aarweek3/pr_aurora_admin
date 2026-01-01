/**
 * ════════════════════════════════════════════════════════════════════════════
 * UNDERLINE PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для подчёркивания текста.
 * Использует тег <u>.
 * Горячая клавиша: Ctrl+U
 *
 * @module UnderlinePlugin
 */

import { BaseFormatPlugin } from '../aurora-plugin.interface';

/**
 * Плагин подчёркнутого текста
 */
export class UnderlinePlugin extends BaseFormatPlugin {
  name = 'underline';
  title = 'Подчёркнутый';
  icon = '𝑈'; // Unicode U
  shortcut = 'Ctrl+U';

  protected tagName = 'u';

  /**
   * Инициализация плагина
   */
  override init(): void {
    console.log('[UnderlinePlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  override destroy(): void {
    console.log('[UnderlinePlugin] Destroyed');
  }
}
