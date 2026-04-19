/**
 * Конфигурация соответствия ключей иконок языков (из БД) и имен файлов SVG иконок.
 */
export const LANGUAGE_ICONS_MAP: Record<string, string> = {
  // English
  flag_us: 'av_l_us-flag',
  en: 'av_l_en-flag',
  'en-US': 'av_l_us-flag',

  // Russian
  flag_ru: 'av_l_ru-flag',
  ru: 'av_l_ru-flag',
  'ru-RU': 'av_l_ru-flag',

  // Spain
  flag_es: 'av_l_spain-flag',
  es: 'av_l_spain-flag',
  'es-ES': 'av_l_spain-flag',

  // China
  flag_cn: 'av_l_china-flag',
  zh: 'av_l_china-flag',
  'zh-CN': 'av_l_china-flag',

  // Germany
  flag_de: 'av_l_germany-flag',
  de: 'av_l_germany-flag',
  'de-DE': 'av_l_germany-flag',

  // France
  flag_fr: 'av_l_france-flag',
  fr: 'av_l_france-flag',
  'fr-FR': 'av_l_france-flag',

  // Brazil / Portugal
  flag_br: 'av_l_brazil-flag',
  pt: 'av_l_brazil-flag',
  'pt-BR': 'av_l_brazil-flag',

  // Japan
  flag_jp: 'av_l_japan-flag',
  ja: 'av_l_japan-flag',
  'ja-JP': 'av_l_japan-flag',

  // Saudi Arabia / Arabic
  flag_sa: 'av_l_saudi-flag',
  ar: 'av_l_saudi-flag',
  'ar-SA': 'av_l_saudi-flag',

  // Turkey
  flag_tr: 'av_l_turkey-flag',
  tr: 'av_l_turkey-flag',
  'tr-TR': 'av_l_turkey-flag',

  // Fallback
  default: 'av_l_en-flag',
};
