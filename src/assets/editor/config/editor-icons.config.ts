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
  strikethrough: 'av_e_strikethrough',

  superscript: 'av_e_superscript',
  subscript: 'av_e_subscript',

  code: 'av_e_code',
  codeBlock: 'av_e_code_block',
  preformatted: 'av_e_preformatted',

  removeFormat: 'av_e_remove_format',
} as const;

// ======================================================
// 📐 2. АБЗАЦЫ И СТРУКТУРА
// ======================================================

export const PARAGRAPH_ICONS = {
  paragraph: 'av_e_paragraph',

  heading1: 'av_e_heading_1',
  heading2: 'av_e_heading_2',
  heading3: 'av_e_heading_3',
  heading4: 'av_e_heading_4',
  heading5: 'av_e_heading_5',
  heading6: 'av_e_heading_6',

  blockquote: 'av_e_blockquote',
  horizontalRule: 'av_e_horizontal_rule',
} as const;

// ======================================================
// 📋 3. СПИСКИ
// ======================================================

export const LIST_ICONS = {
  orderedList: 'av_e_list_ordered',
  unorderedList: 'av_e_list_unordered',
  checklist: 'av_e_list_check',

  indent: 'av_e_indent',
  outdent: 'av_e_outdent',
} as const;

// ======================================================
// 🎨 4. ЦВЕТА И СТИЛИ
// ======================================================

export const STYLE_ICONS = {
  textColor: 'av_e_text_color',
  backgroundColor: 'av_e_background_color',

  highlight: 'av_e_highlight',
  clearColor: 'av_e_clear_color',
} as const;

// ======================================================
// 🔗 5. ССЫЛКИ И ВСТАВКИ
// ======================================================

export const INSERT_ICONS = {
  link: 'av_e_link',
  unlink: 'av_e_unlink',
  anchor: 'av_e_anchor',

  image: 'av_e_image',
  imageUpload: 'av_e_image_upload',
  gallery: 'av_e_gallery',

  video: 'av_e_video',
  audio: 'av_e_audio',

  file: 'av_e_file',
  attachment: 'av_e_attachment',

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
  alignLeft: 'av_e_align_left',
  alignCenter: 'av_e_align_center',
  alignRight: 'av_e_align_right',
  alignJustify: 'av_e_align_justify',

  verticalTop: 'av_e_vertical_top',
  verticalMiddle: 'av_e_vertical_middle',
  verticalBottom: 'av_e_vertical_bottom',
} as const;

// ======================================================
// 🧠 8. ИСТОРИЯ / РЕДАКТИРОВАНИЕ
// ======================================================

export const HISTORY_ICONS = {
  undo: 'av_e_undo',
  redo: 'av_e_redo',

  copy: 'av_e_copy',
  cut: 'av_e_cut',
  paste: 'av_e_paste',

  selectAll: 'av_e_select_all',
} as const;

// ======================================================
// 🔍 9. ПОИСК И НАВИГАЦИЯ
// ======================================================

export const SEARCH_ICONS = {
  search: 'av_e_search',
  replace: 'av_e_replace',

  zoomIn: 'av_e_zoom_in',
  zoomOut: 'av_e_zoom_out',
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
  preferences: 'av_e_preferences',

  help: 'av_e_help',
  info: 'av_e_info',

  warning: 'av_e_warning',
  error: 'av_e_error',

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
