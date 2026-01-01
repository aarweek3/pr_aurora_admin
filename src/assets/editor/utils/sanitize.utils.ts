/**
 * ════════════════════════════════════════════════════════════════════════════
 * SANITIZE UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Утилиты для санитизации HTML контента с использованием DOMPurify.
 *
 * Две функции санитизации:
 * - quickSanitize() - быстрая очистка для команд форматирования
 * - fullSanitize() - полная очистка для paste и getContent/setContent
 *
 * @module SanitizeUtils
 */

import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';
import { ALLOWED_ATTRIBUTES, ALLOWED_TAGS } from '../types/editor.types';

// ════════════════════════════════════════════════════════════════════════════
// КОНСТАНТЫ КОНФИГУРАЦИИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Базовая конфигурация DOMPurify для быстрой санитизации
 * Используется после команд форматирования
 */
const QUICK_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_TAGS] as string[],
  ALLOWED_ATTR: [...ALLOWED_ATTRIBUTES] as string[],
  ALLOW_DATA_ATTR: true, // Разрешаем data-* атрибуты для изображений
  KEEP_CONTENT: true, // Сохраняем текстовое содержимое недопустимых тегов
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Полная конфигурация DOMPurify для глубокой санитизации
 * Используется для paste, getContent, setContent
 */
const FULL_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_TAGS, 'iframe'] as string[], // Добавляем iframe для YouTube
  ALLOWED_ATTR: [...ALLOWED_ATTRIBUTES, 'frameborder', 'allowfullscreen', 'allow'] as string[], // Атрибуты для iframe
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,

  // Дополнительные настройки безопасности
  ALLOW_DATA_ATTR: true, // Разрешаем data-* атрибуты для изображений (data-image-id, data-align, data-width)
  ALLOW_UNKNOWN_PROTOCOLS: false, // Запрещаем неизвестные протоколы
  SAFE_FOR_TEMPLATES: true, // Безопасность для template движков

  // Удаляем опасные элементы (убрали iframe из списка)
  FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],

  // Защита от DOM Clobbering
  SANITIZE_DOM: true,

  // Добавляем rel="noopener noreferrer" к ссылкам с target="_blank"
  ADD_ATTR: ['target'],

  // Hooks для дополнительной обработки
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: null,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// БЫСТРАЯ САНИТИЗАЦИЯ (после команд)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Быстрая санитизация HTML (базовая очистка)
 *
 * Используется после команд форматирования (bold, italic, etc.)
 * для удаления только самых опасных элементов.
 *
 * Минимальная нагрузка на производительность.
 *
 * @param html - HTML строка для очистки
 * @returns Очищенный HTML
 *
 * @example
 * const cleanHtml = quickSanitize('<p>Hello <script>alert("XSS")</script></p>');
 * // Результат: '<p>Hello </p>'
 */
export function quickSanitize(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Используем DOMPurify с базовой конфигурацией
    const sanitized = DOMPurify.sanitize(html, QUICK_SANITIZE_CONFIG);

    console.log('[Sanitize] Quick sanitize performed', {
      original: html.substring(0, 50) + '...',
      cleaned: sanitized.substring(0, 50) + '...',
    });

    return sanitized;
  } catch (error) {
    console.error('[Sanitize] Error in quickSanitize:', error);
    // В случае ошибки возвращаем пустую строку для безопасности
    return '';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ПОЛНАЯ САНИТИЗАЦИЯ (paste, getContent, setContent)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Полная санитизация HTML (глубокая очистка)
 *
 * Используется при:
 * - Вставке контента (paste)
 * - Получении контента (getContent)
 * - Установке контента (setContent)
 *
 * Применяет все правила безопасности и нормализует HTML.
 *
 * @param html - HTML строка для очистки
 * @returns Очищенный и нормализованный HTML
 *
 * @example
 * const cleanHtml = fullSanitize('<p onclick="alert()">Text</p>');
 * // Результат: '<p>Text</p>'
 */
export function fullSanitize(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Используем DOMPurify с полной конфигурацией
    const sanitized = DOMPurify.sanitize(html, FULL_SANITIZE_CONFIG) as string;

    // Дополнительная обработка: добавляем rel="noopener noreferrer" к внешним ссылкам
    let processed = addSecurityAttributesToLinks(sanitized);

    // Нормализация пробелов
    processed = normalizeWhitespace(processed);

    console.log('[Sanitize] Full sanitize performed', {
      original: html.substring(0, 100) + '...',
      cleaned: processed.substring(0, 100) + '...',
      originalLength: html.length,
      cleanedLength: processed.length,
    });

    return processed;
  } catch (error) {
    console.error('[Sanitize] Error in fullSanitize:', error);
    // В случае ошибки возвращаем пустую строку для безопасности
    return '';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Добавляет атрибуты безопасности к внешним ссылкам
 *
 * Для всех ссылок с target="_blank" добавляет rel="noopener noreferrer"
 * для защиты от tabnabbing атак.
 *
 * @param html - HTML строка
 * @returns HTML с добавленными атрибутами безопасности
 */
function addSecurityAttributesToLinks(html: string): string {
  // Создаём временный DOM для обработки ссылок
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const links = tempDiv.querySelectorAll('a[target="_blank"]');

  links.forEach((link) => {
    const currentRel = link.getAttribute('rel') || '';
    const relValues = new Set(currentRel.split(' ').filter(Boolean));

    // Добавляем noopener и noreferrer
    relValues.add('noopener');
    relValues.add('noreferrer');

    link.setAttribute('rel', Array.from(relValues).join(' '));
  });

  return tempDiv.innerHTML;
}

/**
 * Нормализует пробелы в HTML
 *
 * - Удаляет лишние пробелы между тегами
 * - Заменяет множественные пробелы на один
 * - Удаляет пробелы в начале и конце
 *
 * @param html - HTML строка
 * @returns Нормализованный HTML
 */
function normalizeWhitespace(html: string): string {
  return html
    .replace(/>\s+</g, '><') // Удаляем пробелы между тегами
    .replace(/\s{2,}/g, ' ') // Заменяем множественные пробелы на один
    .trim(); // Удаляем пробелы по краям
}

// ════════════════════════════════════════════════════════════════════════════
// УТИЛИТЫ ДЛЯ ПРОВЕРКИ БЕЗОПАСНОСТИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Проверяет, содержит ли HTML потенциально опасные элементы
 *
 * @param html - HTML строка для проверки
 * @returns true если HTML содержит опасные элементы
 *
 * @example
 * const isDangerous = containsDangerousElements('<script>alert()</script>');
 * // Результат: true
 */
export function containsDangerousElements(html: string): boolean {
  // Проверяем наличие опасных элементов
  const dangerousPatterns = [
    /<script/i,
    /<object/i,
    /<embed/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /javascript:/i,
    /data:text\/html/i,
  ];

  // Проверяем iframe, но разрешаем YouTube
  if (/<iframe/i.test(html)) {
    // Если есть iframe, проверяем что это YouTube
    const iframeMatch = html.match(/<iframe[^>]*src="([^"]*)"[^>]*>/i);
    if (iframeMatch && iframeMatch[1]) {
      const src = iframeMatch[1];
      // Разрешаем только YouTube iframe
      if (!src.match(/^https:\/\/(www\.)?youtube\.com\/embed\//)) {
        return true; // Это опасный iframe (не YouTube)
      }
    } else {
      return true; // iframe без src - опасно
    }
  }

  return dangerousPatterns.some((pattern) => pattern.test(html));
}

/**
 * Проверяет, является ли URL безопасным
 *
 * @param url - URL для проверки
 * @returns true если URL безопасен
 *
 * @example
 * const isSafe = isSafeUrl('https://example.com');
 * // Результат: true
 *
 * const isUnsafe = isSafeUrl('javascript:alert()');
 * // Результат: false
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Разрешённые протоколы
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

  try {
    const urlObj = new URL(url, window.location.href);
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    // Относительные URL считаем безопасными
    return !url.match(/^(javascript:|data:|vbscript:)/i);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ ДЛЯ ТЕСТИРОВАНИЯ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Получает текущую конфигурацию быстрой санитизации
 * (для тестирования и отладки)
 *
 * @returns Копия конфигурации
 */
export function getQuickSanitizeConfig(): DOMPurifyConfig {
  return { ...QUICK_SANITIZE_CONFIG };
}

/**
 * Получает текущую конфигурацию полной санитизации
 * (для тестирования и отладки)
 *
 * @returns Копия конфигурации
 */
export function getFullSanitizeConfig(): DOMPurifyConfig {
  return { ...FULL_SANITIZE_CONFIG };
}
