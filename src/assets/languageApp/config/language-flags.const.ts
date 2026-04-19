/**
 * Хардкод SVG-кода флагов для мгновенной загрузки.
 * Без HTTP, без ассетов, без 404.
 */
export const HARDCODED_FLAGS: Record<string, string> = {
  // 🇩🇪 Германия (DE)
  'av_l_germany-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="85" y="0" fill="#000000"/><rect width="256" height="85" y="85" fill="#DD0000"/><rect width="256" height="86" y="170" fill="#FFCE00"/></svg>',

  // 🇷🇺 Россия (RU)
  'av_l_ru-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="85" y="0" fill="#FFFFFF"/><rect width="256" height="85" y="85" fill="#0039A6"/><rect width="256" height="86" y="170" fill="#D52B1E"/></svg>',

  // 🇬🇧 Великобритания (EN)
  'av_l_en-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#012169"/><path d="M0 0L256 256M256 0L0 256" stroke="#FFF" stroke-width="40"/><path d="M0 0L256 256M256 0L0 256" stroke="#C8102E" stroke-width="20"/><rect x="108" width="40" height="256" fill="#FFF"/><rect y="108" width="256" height="40" fill="#FFF"/><rect x="118" width="20" height="256" fill="#C8102E"/><rect y="118" width="256" height="20" fill="#C8102E"/></svg>',

  // 🇺🇸 США (US)
  'av_l_us-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#3C3B6E"/><path d="M0 21.3h256M0 64h256M0 106.6h256M0 149.3h256M0 192h256M0 234.6h256" stroke="#B22234" stroke-width="21.3"/><rect width="115" height="106" fill="#3C3B6E"/><circle cx="20" cy="20" r="3" fill="#FFF"/><circle cx="40" cy="20" r="3" fill="#FFF"/><circle cx="60" cy="20" r="3" fill="#FFF"/><circle cx="80" cy="20" r="3" fill="#FFF"/><circle cx="100" cy="20" r="3" fill="#FFF"/><circle cx="30" cy="40" r="3" fill="#FFF"/><circle cx="50" cy="40" r="3" fill="#FFF"/><circle cx="70" cy="40" r="3" fill="#FFF"/><circle cx="90" cy="40" r="3" fill="#FFF"/><circle cx="20" cy="60" r="3" fill="#FFF"/><circle cx="40" cy="60" r="3" fill="#FFF"/><circle cx="60" cy="60" r="3" fill="#FFF"/><circle cx="80" cy="60" r="3" fill="#FFF"/><circle cx="100" cy="60" r="3" fill="#FFF"/></svg>',

  // 🇪🇸 Испания (ES)
  'av_l_spain-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="64" fill="#AA151B"/><rect width="256" height="128" y="64" fill="#F1BF00"/><rect width="256" height="64" y="192" fill="#AA151B"/><circle cx="64" cy="128" r="20" fill="#AA151B" opacity="0.8"/></svg>',

  // 🇫🇷 Франция (FR)
  'av_l_france-flag':
    '<svg viewBox="0 0 256 256"><rect width="85" height="256" fill="#002395"/><rect width="86" height="256" x="85" fill="#FFFFFF"/><rect width="85" height="256" x="171" fill="#ED2939"/></svg>',

  // 🇧🇷 Бразилия (BR)
  'av_l_brazil-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#009739"/><path d="M128 32L224 128L128 224L32 128Z" fill="#FEDD00"/><circle cx="128" cy="128" r="40" fill="#012169"/><path d="M88 128C88 128 128 110 168 128" stroke="#FFFFFF" stroke-width="4" fill="none"/></svg>',

  // 🇨🇳 Китай (CN)
  'av_l_china-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#EE1C25"/><path d="M48 48L53 64L68 64L56 74L60 90L48 80L36 90L40 74L28 64L43 64Z" fill="#FFFF00"/><circle cx="80" cy="30" r="5" fill="#FFFF00"/><circle cx="95" cy="45" r="5" fill="#FFFF00"/><circle cx="95" cy="70" r="5" fill="#FFFF00"/><circle cx="80" cy="85" r="5" fill="#FFFF00"/></svg>',

  // 🇯🇵 Япония (JP)
  'av_l_japan-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#FFFFFF"/><circle cx="128" cy="128" r="60" fill="#BC002D"/></svg>',

  // 🇸🇦 Саудовская Аравия (SA)
  'av_l_saudi-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#006C35"/><path d="M64 160H192M128 80L140 120H116Z" stroke="#FFFFFF" stroke-width="8" fill="none"/></svg>',

  // 🇹🇷 Турция (TR)
  'av_l_turkey-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#E30A17"/><circle cx="100" cy="128" r="45" fill="#FFFFFF"/><circle cx="115" cy="128" r="35" fill="#E30A17"/><path d="M165 128L175 140L190 128L175 116Z" fill="#FFFFFF"/></svg>',
};
