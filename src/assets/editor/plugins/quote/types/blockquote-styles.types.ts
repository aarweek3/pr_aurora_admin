/**
 * Типы и интерфейсы для плагина цитат (Blockquote)
 *
 * @module BlockquoteStyles
 * @description Определяет структуру стилей для blockquote элементов
 */

// ═══════════════════════════════════════════════════════
// TYPE ALIASES (Типы-ограничители)
// ═══════════════════════════════════════════════════════

/** Стили границ */
export type BorderStyle =
  | 'none'
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset';

/** Стили шрифта */
export type FontStyle = 'normal' | 'italic' | 'oblique';

/** Толщина шрифта */
export type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

/** Выравнивание текста */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// ═══════════════════════════════════════════════════════
// ИНТЕРФЕЙСЫ ДЛЯ СТИЛЕЙ
// ═══════════════════════════════════════════════════════

/**
 * Позиция псевдоэлемента ::before (кавычки, иконки)
 */
export interface BeforePosition {
  /** Позиция слева (например: "0.5em", "-20px") */
  left?: string;
  /** Позиция справа */
  right?: string;
  /** Позиция сверху */
  top?: string;
  /** Позиция снизу */
  bottom?: string;
}

/**
 * Стили для blockquote элемента
 */
export interface QuoteStyles {
  // Основные стили
  /** Цвет фона (например: "#f5f5f5", "rgba(0, 0, 0, 0.05)") */
  backgroundColor?: string;

  /** Цвет границы */
  borderColor?: string;

  /** Толщина границы (например: "4px", "0 0 0 5px" - только слева) */
  borderWidth?: string;

  /** Стиль границы */
  borderStyle?: BorderStyle;

  /** Внутренний отступ */
  padding?: string;

  /** Внешний отступ */
  margin?: string;

  /** Скругление углов */
  borderRadius?: string;

  // Стили текста
  /** Стиль шрифта */
  fontStyle?: FontStyle;

  /** Размер шрифта */
  fontSize?: string;

  /** Цвет текста */
  color?: string;

  /** Высота строки */
  lineHeight?: string;

  // Эффекты
  /** Тень блока */
  boxShadow?: string;

  /** Прозрачность */
  opacity?: string;

  // Псевдоэлемент ::before (кавычки, иконки)
  /** Контент для ::before (например: "\\201C", "💬", "—") */
  beforeContent?: string;

  /** Размер шрифта для ::before */
  beforeFontSize?: string;

  /** Цвет для ::before */
  beforeColor?: string;

  /** Прозрачность для ::before */
  beforeOpacity?: string;

  /** Позиция для ::before */
  beforePosition?: BeforePosition;
}

/**
 * Стили для footer элемента (автор, источник)
 */
export interface FooterStyles {
  /** Размер шрифта */
  fontSize?: string;

  /** Цвет текста */
  color?: string;

  /** Стиль шрифта */
  fontStyle?: FontStyle;

  /** Толщина шрифта */
  fontWeight?: FontWeight;

  /** Выравнивание текста */
  textAlign?: TextAlign;

  /** Отступ сверху */
  marginTop?: string;

  /** Отступ снизу */
  marginBottom?: string;

  // Стили для cite элемента внутри footer
  /** Цвет для cite */
  citeColor?: string;

  /** Толщина шрифта для cite */
  citeFontWeight?: FontWeight;

  /** Стиль шрифта для cite */
  citeFontStyle?: FontStyle;
}

/**
 * Полный стиль blockquote
 */
export interface BlockquoteStyle {
  /** Уникальный идентификатор стиля */
  id: string;

  /** Название стиля (отображается в UI) */
  name: string;

  /** Флаг: пользовательский стиль или предустановленный */
  isCustom: boolean;

  /** Стили для blockquote */
  quote: QuoteStyles;

  /** Стили для footer */
  footer: FooterStyles;
}

// ═══════════════════════════════════════════════════════
// ИНТЕРФЕЙСЫ ДЛЯ ДАННЫХ
// ═══════════════════════════════════════════════════════

/**
 * Данные для вставки blockquote
 */
export interface BlockquoteData {
  /** Текст цитаты */
  text: string;

  /** Автор цитаты (опционально) */
  author?: string;

  /** Источник цитаты (опционально) */
  source?: string;

  /** ID выбранного стиля */
  styleId: string;
}

/**
 * Метаданные для хранения в IndexedDB
 */
export interface BlockquoteStyleRecord extends BlockquoteStyle {
  /** Дата создания */
  createdAt: Date;

  /** Дата последнего обновления */
  updatedAt: Date;

  /** Дата последней синхронизации с сервером */
  syncedAt?: Date;

  /** Флаг удаления (мягкое удаление) */
  deleted?: boolean;
}

/**
 * Результат импорта стилей
 */
export interface ImportResult {
  /** Успешно ли выполнен импорт */
  success: boolean;

  /** Количество импортированных стилей */
  count: number;

  /** Ошибки при импорте */
  errors: string[];
}

/**
 * Результат валидации стиля
 */
export interface ValidationResult {
  /** Валидный ли стиль */
  valid: boolean;

  /** Сообщение об ошибке (если invalid) */
  error?: string;
}

/**
 * Формат экспорта стилей
 */
export interface ExportedStylesData {
  /** Версия формата */
  version: string;

  /** Дата экспорта */
  exportedAt: string;

  /** Количество стилей */
  count: number;

  /** Массив стилей */
  styles: BlockquoteStyle[];
}
