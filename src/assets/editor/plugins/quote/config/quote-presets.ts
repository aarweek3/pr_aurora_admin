/**
 * Предустановленные стили для blockquote
 *
 * @module QuotePresets
 * @description 5 готовых стилей для различных типов цитат
 */

import { BlockquoteStyle } from '../types/blockquote-styles.types';

// ═══════════════════════════════════════════════════════
// ПРЕДУСТАНОВЛЕННЫЕ СТИЛИ
// ═══════════════════════════════════════════════════════

/**
 * Стиль 1: Классический
 * Традиционный стиль с левой границей и кавычками
 */
const CLASSIC_STYLE: BlockquoteStyle = {
  id: 'preset-classic',
  name: 'Классический',
  isCustom: false,
  quote: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: '0 0 0 10px',
    borderStyle: 'solid',
    padding: '1em 1.5em',
    margin: '1.5em 0',
    fontStyle: 'italic',
    fontSize: '1.1em',
    color: '#555',
    lineHeight: '1.6',
    borderRadius: '0',
    boxShadow: 'none',
    beforeContent: '"\\201C"', // Левая кавычка "
    beforeFontSize: '4em',
    beforeColor: '#ccc',
    beforeOpacity: '0.3',
    beforePosition: {
      left: '-0.4em',
      top: '-0.2em',
    },
  },
  footer: {
    fontSize: '0.9em',
    color: '#666',
    fontStyle: 'normal',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: '1em',
    citeColor: '#444',
    citeFontWeight: '600',
    citeFontStyle: 'normal',
  },
};

/**
 * Стиль 2: Современный
 * Яркий стиль с градиентом и тенью
 */
const MODERN_STYLE: BlockquoteStyle = {
  id: 'preset-modern',
  name: 'Современный',
  isCustom: false,
  quote: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: 'transparent',
    borderWidth: '0',
    borderStyle: 'none',
    padding: '2em 2.5em',
    margin: '2em 0',
    fontStyle: 'normal',
    fontSize: '1.15em',
    color: '#ffffff',
    lineHeight: '1.7',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
    beforeContent: '"💬"',
    beforeFontSize: '3em',
    beforeColor: '#ffffff',
    beforeOpacity: '0.2',
    beforePosition: {
      right: '1em',
      top: '0.5em',
    },
  },
  footer: {
    fontSize: '0.95em',
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: '1.2em',
    citeColor: '#ffffff',
    citeFontWeight: 'bold',
    citeFontStyle: 'normal',
  },
};

/**
 * Стиль 3: Минималистичный
 * Простой стиль с прозрачным фоном и тонкой границей
 */
const MINIMAL_STYLE: BlockquoteStyle = {
  id: 'preset-minimal',
  name: 'Минималистичный',
  isCustom: false,
  quote: {
    backgroundColor: 'transparent',
    borderColor: '#e0e0e0',
    borderWidth: '1px 0 1px 0',
    borderStyle: 'solid',
    padding: '1em 0',
    margin: '2em 0',
    fontStyle: 'italic',
    fontSize: '1.05em',
    color: '#333',
    lineHeight: '1.6',
    borderRadius: '0',
    boxShadow: 'none',
    beforeContent: '"—"',
    beforeFontSize: '1.5em',
    beforeColor: '#999',
    beforeOpacity: '1',
    beforePosition: {
      left: '-1.5em',
      top: '0',
    },
  },
  footer: {
    fontSize: '0.85em',
    color: '#777',
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'left',
    marginTop: '0.8em',
    citeColor: '#555',
    citeFontWeight: '500',
    citeFontStyle: 'italic',
  },
};

/**
 * Стиль 4: Акцентный
 * Яркий жёлтый стиль с эмодзи
 */
const ACCENT_STYLE: BlockquoteStyle = {
  id: 'preset-accent',
  name: 'Акцентный',
  isCustom: false,
  quote: {
    backgroundColor: '#fff9c4',
    borderColor: '#fbc02d',
    borderWidth: '0 0 0 8px',
    borderStyle: 'solid',
    padding: '1.5em 2em',
    margin: '2em 0',
    fontStyle: 'normal',
    fontSize: '1.1em',
    color: '#333',
    lineHeight: '1.7',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(251, 192, 45, 0.2)',
    beforeContent: '"💡"',
    beforeFontSize: '2.5em',
    beforeColor: '#fbc02d',
    beforeOpacity: '1',
    beforePosition: {
      left: '0.5em',
      top: '0.3em',
    },
  },
  footer: {
    fontSize: '0.9em',
    color: '#555',
    fontStyle: 'normal',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: '1em',
    citeColor: '#333',
    citeFontWeight: '600',
    citeFontStyle: 'normal',
  },
};

/**
 * Стиль 5: Элегантный
 * Утончённый стиль с двойной рамкой
 */
const ELEGANT_STYLE: BlockquoteStyle = {
  id: 'preset-elegant',
  name: 'Элегантный',
  isCustom: false,
  quote: {
    backgroundColor: '#fafafa',
    borderColor: '#8b7355',
    borderWidth: '3px',
    borderStyle: 'double',
    padding: '2em 2.5em',
    margin: '2em 0',
    fontStyle: 'italic',
    fontSize: '1.2em',
    color: '#4a4a4a',
    lineHeight: '1.8',
    borderRadius: '4px',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
    beforeContent: '"\\275D"', // Heavy Double Turned Comma Quotation Mark ❝
    beforeFontSize: '3em',
    beforeColor: '#8b7355',
    beforeOpacity: '0.4',
    beforePosition: {
      left: '0.2em',
      top: '-0.1em',
    },
  },
  footer: {
    fontSize: '1em',
    color: '#666',
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: '1.5em',
    citeColor: '#8b7355',
    citeFontWeight: '600',
    citeFontStyle: 'italic',
  },
};

// ═══════════════════════════════════════════════════════
// ЭКСПОРТ
// ═══════════════════════════════════════════════════════

/**
 * Массив всех предустановленных стилей
 */
export const BLOCKQUOTE_PRESETS: BlockquoteStyle[] = [
  CLASSIC_STYLE,
  MODERN_STYLE,
  MINIMAL_STYLE,
  ACCENT_STYLE,
  ELEGANT_STYLE,
];

/**
 * Получить стиль по умолчанию (Классический)
 */
export const getDefaultStyle = (): BlockquoteStyle => CLASSIC_STYLE;

/**
 * Получить стиль по ID из пресетов
 */
export const getPresetById = (id: string): BlockquoteStyle | undefined => {
  return BLOCKQUOTE_PRESETS.find((style) => style.id === id);
};

/**
 * Проверить, является ли ID пресетом
 */
export const isPresetId = (id: string): boolean => {
  return BLOCKQUOTE_PRESETS.some((style) => style.id === id);
};
