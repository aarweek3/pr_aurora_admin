/**
 * Типы и интерфейсы для Aurora Editor
 * @description Полная типизация для WYSIWYG редактора
 * @version 1.0
 * @date 2025-12-04
 */

// ═══════════════════════════════════════════════════════════════
// SNAPSHOT И ИСТОРИЯ
// ═══════════════════════════════════════════════════════════════

/**
 * Снимок состояния редактора для истории Undo/Redo
 */
export interface EditorSnapshot {
  /** Санитизированный HTML контент */
  html: string;

  /** Позиция курсора/выделения (может быть null если нет выделения) */
  selection: SelectionPath | null;

  /** Временная метка создания snapshot (для дебага) */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// SELECTION (Path-based)
// ═══════════════════════════════════════════════════════════════

/**
 * Path-based представление позиции курсора/выделения
 * @description Не изменяет DOM, переживает нормализацию
 */
export interface SelectionPath {
  // ─────────────────────────────────────────────────────────────
  // Основной способ (через path в DOM-дереве)
  // ─────────────────────────────────────────────────────────────

  /** Путь к startContainer в виде массива индексов
   * Пример: [0, 1, 0] означает root -> childNodes[0] -> childNodes[1] -> childNodes[0]
   */
  startContainerPath: number[];

  /** Путь к endContainer в виде массива индексов */
  endContainerPath: number[];

  /** Смещение внутри startContainer (позиция символа) */
  startOffset: number;

  /** Смещение внутри endContainer (позиция символа) */
  endOffset: number;

  // ─────────────────────────────────────────────────────────────
  // Fallback (абсолютная позиция в тексте)
  // ─────────────────────────────────────────────────────────────

  /** Абсолютное количество символов от начала контента до начала выделения */
  absoluteStart: number;

  /** Абсолютное количество символов от начала контента до конца выделения */
  absoluteEnd: number;
}

// ═══════════════════════════════════════════════════════════════
// TOOLBAR
// ═══════════════════════════════════════════════════════════════

/**
 * Группы кнопок в тулбаре (для визуальной группировки)
 */
export type ToolbarGroup =
  | 'format' // Форматирование: bold, italic, underline, strikethrough
  | 'block' // Блоки: headings (H1-H6), paragraph
  | 'list' // Списки: UL, OL, indent, outdent
  | 'align' // Выравнивание: left, center, right, justify
  | 'insert' // Вставка: link, image
  | 'history' // История: undo, redo
  | 'view'; // Вид: fullscreen, source code

/**
 * Кнопка тулбара
 */
export interface ToolbarButton {
  /** Уникальный ID кнопки (для unregisterButton) */
  id: string;

  /** Команда, которая будет выполнена при клике */
  command: string;

  /** Название иконки (должна быть зарегистрирована в IconComponent) */
  icon: string;

  /** Ключ для i18n (переводы) */
  titleKey: string;

  /** Группа для визуальной организации */
  group: ToolbarGroup;

  /** Порядок внутри группы (для сортировки) */
  order: number;

  /** Опциональный dropdown (для headings, alignment и т.д.) */
  dropdown?: ToolbarDropdownItem[];

  /** Опциональная tooltip-подсказка */
  tooltip?: string;

  /** Опциональный keyboard shortcut для отображения */
  shortcut?: string;
}

/**
 * Элемент dropdown меню
 */
export interface ToolbarDropdownItem {
  /** Отображаемый текст (может быть i18n ключом) */
  label: string;

  /** Значение, передаваемое в команду */
  value: any;

  /** Опциональная иконка */
  icon?: string;

  /** Опциональная tooltip */
  tooltip?: string;
}

// ═══════════════════════════════════════════════════════════════
// EDITOR CONFIG
// ═══════════════════════════════════════════════════════════════

/**
 * Режимы вставки из буфера обмена
 */
export type PasteMode =
  | 'html' // Вставить HTML как есть (с санитизацией)
  | 'text' // Вставить только текст (без форматирования)
  | 'smart'; // Умная вставка (HTML если из редактора, текст если извне)

/**
 * Языки интерфейса
 */
export type EditorLanguage = 'ru' | 'en';

/**
 * Конфигурация редактора Aurora Editor
 */
export interface AuroraConfig {
  // ─────────────────────────────────────────────────────────────
  // Основные настройки
  // ─────────────────────────────────────────────────────────────

  /** Язык интерфейса (по умолчанию: 'ru') */
  language?: EditorLanguage;

  /** Режим только для чтения */
  readonly?: boolean;

  /** Placeholder-текст для пустого редактора */
  placeholder?: string;

  // ─────────────────────────────────────────────────────────────
  // Paste настройки
  // ─────────────────────────────────────────────────────────────

  /** Режим вставки из буфера обмена (по умолчанию: 'smart') */
  pasteMode?: PasteMode;

  // ─────────────────────────────────────────────────────────────
  // Изображения
  // ─────────────────────────────────────────────────────────────

  /** Callback для загрузки изображений (возвращает URL) */
  onImageUpload?: (file: File) => Promise<string>;

  /** Максимальный размер изображения в байтах (по умолчанию: 5MB) */
  maxImageSize?: number;

  /** Разрешённые MIME-типы изображений */
  allowedImageTypes?: string[];

  // ─────────────────────────────────────────────────────────────
  // Производительность
  // ─────────────────────────────────────────────────────────────

  /** Debounce для CVA onChange в миллисекундах (по умолчанию: 300) */
  updateDelay?: number;

  /** Максимальный размер истории (количество снимков, по умолчанию: 30) */
  maxHistorySize?: number;

  // ─────────────────────────────────────────────────────────────
  // Дополнительные настройки
  // ─────────────────────────────────────────────────────────────

  /** Разрешить полноэкранный режим (по умолчанию: true) */
  allowFullscreen?: boolean;

  /** Разрешить режим исходного кода (по умолчанию: true) */
  allowSourceMode?: boolean;

  /** Кастомные CSS классы для редактора */
  customClass?: string;

  /** Минимальная высота редактора (в px) */
  minHeight?: number;

  /** Максимальная высота редактора (в px) */
  maxHeight?: number;

  /** ARIA-label для доступности (по умолчанию: 'Редактор текста') */
  ariaLabel?: string;
}

// ═══════════════════════════════════════════════════════════════
// PLUGIN
// ═══════════════════════════════════════════════════════════════

/**
 * Базовый интерфейс для плагинов (опционально)
 * @description Плагины могут реализовывать этот интерфейс для единообразия
 */
export interface Plugin {
  /** Уникальный ID плагина */
  id: string;

  /** Название плагина */
  name: string;

  /** Версия плагина */
  version: string;

  /** Инициализация плагина (регистрация кнопок и обработчиков) */
  init(): void;

  /** Очистка плагина (вызывается при destroy) */
  destroy(): void;
}

// ═══════════════════════════════════════════════════════════════
// IMAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Данные изображения для вставки
 */
export interface ImageData {
  /** URL изображения (может быть data:// или http(s)://) */
  url: string;

  /** Alt текст для accessibility */
  alt: string;

  /** Ширина изображения в пикселях (опционально) */
  width?: number;

  /** Высота изображения в пикселях (опционально) */
  height?: number;

  /** Дополнительные CSS классы */
  cssClass?: string;

  /** Title атрибут (tooltip) */
  title?: string;
}

// ═══════════════════════════════════════════════════════════════
// LINK
// ═══════════════════════════════════════════════════════════════

/**
 * Данные ссылки для вставки
 */
export interface LinkData {
  /** URL ссылки */
  url: string;

  /** Текст ссылки (если не указан, используется URL) */
  text?: string;

  /** Открывать в новом окне (по умолчанию: true) */
  openInNewWindow?: boolean;

  /** Title атрибут (tooltip) */
  title?: string;

  /** Rel атрибут (по умолчанию: 'noopener noreferrer' для безопасности) */
  rel?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════

/**
 * Тип обработчика команды
 * @description Функция, которая выполняется при вызове кастомной команды
 */
export type CommandHandler = (payload?: any) => void;

// ═══════════════════════════════════════════════════════════════
// SANITIZE OPTIONS (для DOMPurify)
// ═══════════════════════════════════════════════════════════════

/**
 * Опции для санитизации HTML (используется с DOMPurify)
 */
export interface SanitizeOptions {
  /** Разрешённые HTML теги */
  ALLOWED_TAGS?: string[];

  /** Разрешённые атрибуты */
  ALLOWED_ATTR?: string[];

  /** Разрешить data-* атрибуты */
  ALLOW_DATA_ATTR?: boolean;

  /** Запрещённые теги (чёрный список) */
  FORBID_TAGS?: string[];

  /** Запрещённые атрибуты (чёрный список) */
  FORBID_ATTR?: string[];

  /** Возвращать DOM вместо строки */
  RETURN_DOM?: boolean;

  /** Возвращать DOM Fragment вместо строки */
  RETURN_DOM_FRAGMENT?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

/**
 * События редактора (для будущего расширения)
 */
export interface EditorEvents {
  /** Контент изменился */
  onContentChange?: (html: string) => void;

  /** Выделение изменилось */
  onSelectionChange?: (selection: SelectionPath | null) => void;

  /** Редактор получил фокус */
  onFocus?: () => void;

  /** Редактор потерял фокус */
  onBlur?: () => void;

  /** Выполнена команда */
  onCommand?: (command: string, payload?: any) => void;

  /** Ошибка в редакторе */
  onError?: (error: Error) => void;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Состояние кнопки тулбара
 */
export interface ButtonState {
  /** Команда активна (например, текст жирный) */
  active: boolean;

  /** Кнопка доступна для нажатия */
  enabled: boolean;

  /** Кнопка видима */
  visible: boolean;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  /** Валидация прошла успешно */
  valid: boolean;

  /** Сообщение об ошибке (если invalid) */
  error?: string;

  /** Дополнительные детали */
  details?: any;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/**
 * Константы по умолчанию
 */
export const EDITOR_DEFAULTS = {
  /** Максимальный размер истории (количество снимков) */
  MAX_HISTORY_SIZE: 30,

  /** Debounce для input в миллисекундах */
  INPUT_DEBOUNCE: 300,

  /** Максимальный размер изображения в байтах (5MB) */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,

  /** Разрешённые типы изображений */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  /** Timeout для загрузки изображения (30 секунд) */
  IMAGE_UPLOAD_TIMEOUT: 30000,

  /** Placeholder по умолчанию */
  DEFAULT_PLACEHOLDER: 'Начните печатать...',

  /** Язык по умолчанию */
  DEFAULT_LANGUAGE: 'ru' as EditorLanguage,

  /** Режим paste по умолчанию */
  DEFAULT_PASTE_MODE: 'smart' as PasteMode,
} as const;

/**
 * Нативные команды (через execCommand)
 */
export const NATIVE_COMMANDS = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'insertUnorderedList',
  'insertOrderedList',
  'indent',
  'outdent',
  'justifyLeft',
  'justifyCenter',
  'justifyRight',
  'justifyFull',
  'formatBlock',
  'removeFormat',
  'unlink',
] as const;

/**
 * Тип нативной команды
 */
export type NativeCommand = (typeof NATIVE_COMMANDS)[number];

/**
 * Разрешённые HTML теги (базовый набор)
 */
export const ALLOWED_TAGS = [
  'p',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'a',
  'img',
  'figure',
  'figcaption',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'br',
  'hr',
  'blockquote',
  'code',
  'pre',
] as const;

/**
 * Разрешённые HTML атрибуты (базовый набор)
 */
export const ALLOWED_ATTRIBUTES = [
  'href',
  'src',
  'alt',
  'class',
  'id',
  'style',
  'target',
  'rel',
  'width',
  'height',
  'title',
] as const;

// ═══════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════

/**
 * Проверка, является ли команда нативной
 */
export function isNativeCommand(command: string): command is NativeCommand {
  return NATIVE_COMMANDS.includes(command as NativeCommand);
}

/**
 * Проверка, является ли объект SelectionPath
 */
export function isSelectionPath(obj: any): obj is SelectionPath {
  return (
    obj &&
    Array.isArray(obj.startContainerPath) &&
    Array.isArray(obj.endContainerPath) &&
    typeof obj.startOffset === 'number' &&
    typeof obj.endOffset === 'number' &&
    typeof obj.absoluteStart === 'number' &&
    typeof obj.absoluteEnd === 'number'
  );
}

/**
 * Проверка, является ли объект ImageData
 */
export function isImageData(obj: any): obj is ImageData {
  return obj && typeof obj.url === 'string' && typeof obj.alt === 'string';
}

/**
 * Проверка, является ли объект LinkData
 */
export function isLinkData(obj: any): obj is LinkData {
  return obj && typeof obj.url === 'string';
}
