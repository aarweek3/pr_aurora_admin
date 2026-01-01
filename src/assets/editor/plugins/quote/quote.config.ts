/**
 * Конфигурация плагина Quote
 *
 * Определяет настройки по умолчанию для плагина вставки цитат
 */

export interface QuotePluginConfig {
  /**
   * ID плагина (должен быть уникальным)
   */
  id: string;

  /**
   * Отображаемое имя плагина
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
   * Формат: 'Ctrl+Shift+Q' или 'Meta+Shift+Q'
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
   * CSS класс для стилизации blockquote элементов
   */
  blockquoteClassName: string;

  /**
   * Атрибут для хранения ID стиля
   */
  styleIdAttribute: string;

  /**
   * Максимальная длина текста цитаты (в символах)
   */
  maxQuoteLength: number;

  /**
   * Максимальная длина имени автора (в символах)
   */
  maxAuthorLength: number;

  /**
   * Максимальная длина источника (в символах)
   */
  maxSourceLength: number;

  /**
   * Использовать ли анимации при открытии модального окна
   */
  useAnimations: boolean;

  /**
   * Автоматически фокусироваться на поле ввода текста при открытии
   */
  autoFocusTextarea: boolean;

  /**
   * Сохранять последний выбранный стиль
   */
  rememberLastStyle: boolean;

  /**
   * Включить режим отладки (логирование в консоль)
   */
  debug: boolean;
}

/**
 * Конфигурация плагина по умолчанию
 */
export const DEFAULT_QUOTE_CONFIG: QuotePluginConfig = {
  id: 'quote',
  name: 'quote', // Технический идентификатор (используется в фильтрах)
  description: 'Вставка стилизованных цитат с настраиваемым оформлением',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>`,
  hotkey: 'Ctrl+Shift+Q',
  showInToolbar: true,
  toolbarOrder: 50,
  blockquoteClassName: 'aurora-blockquote',
  styleIdAttribute: 'data-style-id',
  maxQuoteLength: 5000,
  maxAuthorLength: 200,
  maxSourceLength: 500,
  useAnimations: true,
  autoFocusTextarea: true,
  rememberLastStyle: true,
  debug: false,
};

/**
 * Константы для плагина
 */
export const QUOTE_CONSTANTS = {
  /**
   * Имя ключа в localStorage для сохранения последнего выбранного стиля
   */
  LAST_STYLE_STORAGE_KEY: 'aurora-quote-last-style',

  /**
   * Имя ключа в localStorage для настроек плагина
   */
  CONFIG_STORAGE_KEY: 'aurora-quote-config',

  /**
   * CSS классы для элементов цитаты
   */
  CSS_CLASSES: {
    BLOCKQUOTE: 'aurora-blockquote',
    TEXT: 'aurora-blockquote-text',
    FOOTER: 'aurora-blockquote-footer',
    CITE: 'aurora-blockquote-cite',
    BEFORE: 'aurora-blockquote-before',
    PRESET: 'aurora-blockquote-preset',
    CUSTOM: 'aurora-blockquote-custom',
  },

  /**
   * Атрибуты данных
   */
  DATA_ATTRIBUTES: {
    STYLE_ID: 'data-style-id',
    AUTHOR: 'data-author',
    SOURCE: 'data-source',
    CREATED_AT: 'data-created-at',
  },

  /**
   * События плагина
   */
  EVENTS: {
    QUOTE_INSERTED: 'quote:inserted',
    QUOTE_UPDATED: 'quote:updated',
    QUOTE_DELETED: 'quote:deleted',
    STYLE_SELECTED: 'quote:style-selected',
    MODAL_OPENED: 'quote:modal-opened',
    MODAL_CLOSED: 'quote:modal-closed',
  },
} as const;

/**
 * Типы режимов работы модального окна
 */
export type QuoteModalMode = 'insert' | 'edit';

/**
 * Опции для открытия модального окна
 */
export interface QuoteModalOptions {
  /**
   * Режим работы: вставка новой цитаты или редактирование существующей
   */
  mode: QuoteModalMode;

  /**
   * Предзаполненный текст цитаты
   */
  prefilledText?: string;

  /**
   * Предзаполненный автор
   */
  prefilledAuthor?: string;

  /**
   * Предзаполненный источник
   */
  prefilledSource?: string;

  /**
   * ID стиля для предвыбора
   */
  preselectedStyleId?: string;

  /**
   * Сохраненная позиция курсора в редакторе
   */
  savedSelection?: Range;

  /**
   * Элемент blockquote для редактирования (в режиме edit)
   */
  editingElement?: HTMLElement;
}

/**
 * Результат операции вставки/редактирования цитаты
 */
export interface QuoteOperationResult {
  /**
   * Успешность операции
   */
  success: boolean;

  /**
   * Сообщение об ошибке (если success = false)
   */
  error?: string;

  /**
   * Вставленный/обновленный элемент blockquote
   */
  element?: HTMLElement;

  /**
   * ID использованного стиля
   */
  styleId?: string;
}
