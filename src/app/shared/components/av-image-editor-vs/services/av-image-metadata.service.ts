import { Injectable } from '@angular/core';

/**
 * Сервис для работы с метаданными изображений (SEO, имена файлов).
 * Помогает автоматизировать заполнение полей и валидацию.
 */
@Injectable({
  providedIn: 'root',
})
export class AvImageMetadataService {
  /**
   * Генерирует URL-friendly слаг из текста.
   * "Моя Картинка!" -> "moya-kartinka"
   */
  slugify(text: string): string {
    if (!text) return '';

    const trans: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'g',
      д: 'd',
      е: 'e',
      ё: 'yo',
      ж: 'zh',
      з: 'z',
      и: 'i',
      й: 'j',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'h',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ъ: '',
      ы: 'y',
      ь: '',
      э: 'e',
      ю: 'yu',
      я: 'ya',
    };

    const result = text
      .toLowerCase()
      .split('')
      .map((char) => trans[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '-') // Заменяем спецсимволы на дефис
      .replace(/[\s-]+/g, '-') // Схлопываем множественные дефисы
      .replace(/^-+|-+$/g, ''); // Убираем дефисы по краям

    return result;
  }

  /**
   * Генерирует читаемый Alt-текст из имени файла.
   * "img-2024-new-year.jpg" -> "Img 2024 New Year"
   */
  generateAltFromFile(fileName: string): string {
    if (!fileName) return '';
    // Убираем расширение
    const name = fileName.replace(/\.[^/.]+$/, '');
    // Заменяем разделители на пробелы и делаем Capitalize
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
