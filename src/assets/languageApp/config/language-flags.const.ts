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
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve"><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"><path d="M 2.571 30 l 84.859 0 C 81.254 12.534 64.611 0.015 45.034 0 l -0.068 0 C 25.389 0.015 8.745 12.534 2.571 30 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(243,244,245); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><path d="M 87.429 60 L 2.571 60 C 8.75 77.476 25.408 90 45 90 S 81.25 77.476 87.429 60 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(213,43,30); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/><path d="M 87.429 60 C 89.088 55.307 90 50.261 90 45 c 0 -5.261 -0.911 -10.307 -2.571 -15 L 2.571 30 C 0.911 34.693 0 39.739 0 45 c 0 5.261 0.912 10.308 2.571 15 L 87.429 60 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,57,166); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/></g></svg>',

  // 🇬🇧 Великобритания (EN)
  'av_l_en-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#012169"/><path d="M0 0L256 256M256 0L0 256" stroke="#FFF" stroke-width="40"/><path d="M0 0L256 256M256 0L0 256" stroke="#C8102E" stroke-width="20"/><rect x="108" width="40" height="256" fill="#FFF"/><rect y="108" width="256" height="40" fill="#FFF"/><rect x="118" width="20" height="256" fill="#C8102E"/><rect y="118" width="256" height="20" fill="#C8102E"/></svg>',

  // 🇺🇸 США (US)
  'av_l_us-flag':
    '<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="#3C3B6E"/><rect width="256" height="21" y="100" fill="#B22234"/><rect width="256" height="21" y="140" fill="#B22234"/></svg>',
};
