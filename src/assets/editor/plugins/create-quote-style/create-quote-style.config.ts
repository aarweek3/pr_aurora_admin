/**
 * Конфигурация плагина CreateQuoteStyle
 *
 * Определяет настройки по умолчанию для плагина создания стилей цитат
 */

export interface CreateQuoteStylePluginConfig {
  /**
   * ID плагина (должен быть уникальным)
   */
  id: string;

  /**
   * Техническое имя плагина (для идентификации в коде)
   */
  name: string;

  /**
   * Описание плагина
   */
  description: string;

  /**
   * Иконка для кнопки в тулбаре (SVG path)
   */
  icon: string;

  /**
   * Горячая клавиша для вызова плагина
   * Формат: 'Ctrl+Shift+S' или 'Meta+Shift+S'
   */
  hotkey: string;

  /**
   * Показывать ли кнопку в тулбаре
   */
  showInToolbar: boolean;

  /**
   * Порядок отображения в тулбаре (меньше = левее)
   */
  toolbarOrder: number;

  /**
   * Включить режим отладки
   */
  debug: boolean;
}

/**
 * Конфигурация плагина по умолчанию
 */
export const DEFAULT_CREATE_QUOTE_STYLE_CONFIG: CreateQuoteStylePluginConfig = {
  id: 'createQuoteStyle',
  name: 'createQuoteStyle',
  description: 'Создание кастомных стилей для цитат с live preview',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a10 10 0 0 1 10 10 4 4 0 0 1-4 4h-1.5a2 2 0 0 0-1.5 3.5A10 10 0 1 1 12 2z"/>
    <circle cx="7.5" cy="10.5" r="1.5"/>
    <circle cx="12" cy="7.5" r="1.5"/>
    <circle cx="16.5" cy="10.5" r="1.5"/>
  </svg>`,
  hotkey: 'Ctrl+Shift+S',
  showInToolbar: true,
  toolbarOrder: 51, // Сразу после Quote (50)
  debug: true, // Включен режим отладки
};
