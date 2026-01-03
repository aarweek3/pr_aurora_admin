/**
 * Центральный реестр иконок редактора.
 *
 * ❗ Принципы:
 * - Ключ = семантика (что делает кнопка)
 * - Значение = идентификатор SVG/иконки в твоей базе
 * - Реальные SVG можно менять без изменения кода редактора
 *
 * Используется:
 * - Toolbar
 * - Контекстные меню
 * - Плагины
 * - Mobile / Desktop UI
 * 🧠 Почему это правильная архитектура
✔ Семантика > внешний вид
✔ Плагины могут добавлять свои иконки
✔ Toolbar типобезопасен
✔ Можно заменить SVG-пак целиком
✔ Можно поддержать dark/light без изменений API
 */
/**
 * Центральный реестр иконок редактора
 * Все значения используют префикс: av_e_*
 */

// ======================================================
// ✍️ 1. ТЕКСТ / ФОРМАТИРОВАНИЕ
// ======================================================

export const TEXT_ICONS = {
  bold: 'av_e_bold',
  italic: 'av_e_italic',
  underline: 'av_e_underline',
  strikethrough: 'av_e_minus', // Used minus as strike alternative

  superscript: 'av_e_arrow-up',
  subscript: 'av_e_arrow-down',

  code: 'av_e_code',
  codeBlock: 'av_e_terminal',
  preformatted: 'av_e_type',

  removeFormat: 'av_e_trash',
} as const;

// ======================================================
// 📐 2. АБЗАЦЫ И СТРУКТУРА
// ======================================================

export const PARAGRAPH_ICONS = {
  paragraph: 'av_e_more-horizontal',

  heading1: 'av_e_type',
  heading2: 'av_e_type',
  heading3: 'av_e_type',
  heading4: 'av_e_type',
  heading5: 'av_e_type',
  heading6: 'av_e_type',

  blockquote: 'av_e_message-square',
  horizontalRule: 'av_e_minus',
} as const;

// ======================================================
// 📋 3. СПИСКИ
// ======================================================

export const LIST_ICONS = {
  orderedList: 'av_e_list',
  unorderedList: 'av_e_menu',
  checklist: 'av_e_check-square',

  indent: 'av_e_chevrons-right',
  outdent: 'av_e_chevrons-left',
} as const;

// ======================================================
// 🎨 4. ЦВЕТА И СТИЛИ
// ======================================================

export const STYLE_ICONS = {
  textColor: 'av_e_droplet',
  backgroundColor: 'av_e_box',

  highlight: 'av_e_sun',
  clearColor: 'av_e_x-circle',
} as const;

// ======================================================
// 🔗 5. ССЫЛКИ И ВСТАВКИ
// ======================================================

export const INSERT_ICONS = {
  link: 'av_e_link',
  unlink: 'av_e_link-2',
  anchor: 'av_e_anchor',

  image: 'av_e_image',
  imageUpload: 'av_e_upload-cloud',
  gallery: 'av_e_grid',

  video: 'av_e_video',
  audio: 'av_e_music',

  file: 'av_e_file',
  attachment: 'av_e_paperclip',

  table: 'av_e_table',
} as const;

// ======================================================
// 📊 6. ТАБЛИЦЫ
// ======================================================

export const TABLE_ICONS = {
  tableInsert: 'av_e_table_insert',

  rowAddAbove: 'av_e_row_add_above',
  rowAddBelow: 'av_e_row_add_below',
  rowDelete: 'av_e_row_delete',

  columnAddLeft: 'av_e_column_add_left',
  columnAddRight: 'av_e_column_add_right',
  columnDelete: 'av_e_column_delete',

  cellMerge: 'av_e_cell_merge',
  cellSplit: 'av_e_cell_split',

  tableDelete: 'av_e_table_delete',
} as const;

// ======================================================
// 🧭 7. ВЫРАВНИВАНИЕ
// ======================================================

export const ALIGN_ICONS = {
  alignLeft: 'av_e_align-left',
  alignCenter: 'av_e_align-center',
  alignRight: 'av_e_align-right',
  alignJustify: 'av_e_align-justify',

  verticalTop: 'av_e_arrow-up',
  verticalMiddle: 'av_e_more-horizontal',
  verticalBottom: 'av_e_arrow-down',
} as const;

// ======================================================
// 🧠 8. ИСТОРИЯ / РЕДАКТИРОВАНИЕ
// ======================================================

export const HISTORY_ICONS = {
  undo: 'av_e_rotate-ccw',
  redo: 'av_e_rotate-cw',

  copy: 'av_e_copy',
  cut: 'av_e_scissors',
  paste: 'av_e_clipboard',

  selectAll: 'av_e_maximize',
} as const;

// ======================================================
// 🔍 9. ПОИСК И НАВИГАЦИЯ
// ======================================================

export const SEARCH_ICONS = {
  search: 'av_e_search',
  replace: 'av_e_repeat',

  zoomIn: 'av_e_zoom-in',
  zoomOut: 'av_e_zoom-out',
} as const;

// ======================================================
// 🧩 10. КОД / РАЗРАБОТЧИК
// ======================================================

export const DEV_ICONS = {
  html: 'av_e_html',
  sourceCode: 'av_e_source_code',

  preview: 'av_e_preview',
  fullscreen: 'av_e_fullscreen',
  exitFullscreen: 'av_e_exit_fullscreen',
} as const;

// ======================================================
// ⚙️ 11. СИСТЕМНЫЕ
// ======================================================

export const SYSTEM_ICONS = {
  settings: 'av_e_settings',
  preferences: 'av_e_sliders',

  help: 'av_e_help-circle',
  info: 'av_e_info',

  warning: 'av_e_alert-triangle',
  error: 'av_e_alert-circle',

  lock: 'av_e_lock',
  unlock: 'av_e_unlock',
} as const;

// ======================================================
// 🧪 12. ПЛАГИНЫ
// ======================================================

export const PLUGIN_ICONS = {
  emoji: 'av_e_emoji',
  mention: 'av_e_mention',
  hashtag: 'av_e_hashtag',

  comment: 'av_e_comment',
  comments: 'av_e_comments',

  spellcheck: 'av_e_spellcheck',
  dictionary: 'av_e_dictionary',
} as const;

// ======================================================
// 📱 13. МОБИЛЬНЫЕ
// ======================================================

export const MOBILE_ICONS = {
  mobile: 'av_e_mobile',
  tablet: 'av_e_tablet',
  desktop: 'av_e_desktop',

  rotate: 'av_e_rotate',
} as const;

// ======================================================
// 🧠 14. ГЛОБАЛЬНЫЙ РЕЕСТР
// ======================================================

export const EDITOR_ICONS = {
  ...TEXT_ICONS,
  ...PARAGRAPH_ICONS,
  ...LIST_ICONS,
  ...STYLE_ICONS,
  ...INSERT_ICONS,
  ...TABLE_ICONS,
  ...ALIGN_ICONS,
  ...HISTORY_ICONS,
  ...SEARCH_ICONS,
  ...DEV_ICONS,
  ...SYSTEM_ICONS,
  ...PLUGIN_ICONS,
  ...MOBILE_ICONS,
} as const;

// ======================================================
// 🔒 ТИПЫ
// ======================================================

export type EditorIconName = keyof typeof EDITOR_ICONS;
export type EditorIconValue = (typeof EDITOR_ICONS)[EditorIconName];
