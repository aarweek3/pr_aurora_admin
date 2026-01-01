/**
 * Конфигурация плагина "Создать стиль цитаты"
 *
 * Этот плагин предоставляет быстрый доступ к редактору стилей цитат
 * из панели инструментов редактора
 */

import { PluginConfig } from '../../../../examples/core/interfaces/plugin.interface';

export const CREATE_QUOTE_STYLE_CONFIG: PluginConfig = {
  id: 'createQuoteStyle',
  name: 'createQuoteStyle',
  category: 'insert',
  description: 'Создание кастомных стилей для цитат с live preview',
  icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/>
    <circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/>
    <circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    <circle cx="17.5" cy="15.5" r=".5"/>
  </svg>`,
  hotkey: 'Ctrl+Shift+S',
  showInToolbar: true,
  toolbarOrder: 51,
  requiresSelection: false,
  preservesContent: true,
};
