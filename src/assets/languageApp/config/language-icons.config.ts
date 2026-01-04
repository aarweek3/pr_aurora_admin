/**
 * Конфигурация соответствия ключей иконок языков (из БД) и имен файлов SVG иконок.
 *
 * Ключ (слева): значение поля iconKey из модели AppLanguage
 * Значение (справа): имя файла иконки в системе (обычно в папке flags/ или languages/)
 *
 * @example
 * 'australia': 'flags/av_l_australia-flag'
 */
export const LANGUAGE_ICONS_MAP: Record<string, string> = {
  // Реальные ключи из БД (iconKey) -> Имя иконки в БД (без .svg)

  // Germany: в БД av_l_germany.svg
  flag_de: 'av_l_germany-flag',
  de: 'av_l_germany-flag',

  // Russia: в БД av_l_ru-flag.svg
  flag_ru: 'av_l_ru-flag',
  ru: 'av_l_ru-flag',

  // English: в БД av_l_en-flag.svg
  flag_en: 'av_l_en-flag',
  en: 'av_l_en-flag',

  // USA: в БД av_l_us-flag.svg
  flag_us: 'av_l_us-flag',
  us: 'av_l_us-flag',

  // Примеры
  australia: 'av_l_australia-flag',
  flag_australia: 'av_l_australia-flag',

  // Fallback
  default: 'av_l_en-flag',
};
