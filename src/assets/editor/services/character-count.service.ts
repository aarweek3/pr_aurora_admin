/**
 * ════════════════════════════════════════════════════════════════════════════
 * CHARACTER COUNT SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для подсчета символов и валидации лимитов в редакторе.
 *
 * Отвечает за:
 * - Подсчет символов в HTML контенте (исключая теги)
 * - Форматирование текста счетчика
 * - Проверку превышения лимитов
 * - Различные режимы подсчета (символы, слова, строки)
 *
 * @module CharacterCountService
 */

import { Injectable } from '@angular/core';

/**
 * Режимы подсчета
 */
export type CountMode = 'characters' | 'words' | 'lines' | 'paragraphs';

/**
 * Результат подсчета
 */
export interface CountResult {
  /** Количество символов (без HTML тегов) */
  characters: number;
  /** Количество слов */
  words: number;
  /** Количество строк */
  lines: number;
  /** Количество параграфов */
  paragraphs: number;
}

/**
 * Конфигурация счетчика
 */
export interface CounterConfig {
  /** Режим подсчета по умолчанию */
  mode: CountMode;
  /** Максимальное количество (для выбранного режима) */
  maxLimit?: number;
  /** Включать ли пробелы в подсчет символов */
  includeSpaces: boolean;
  /** Включать ли знаки препинания */
  includePunctuation: boolean;
}

/**
 * Сервис для подсчета символов
 */
@Injectable({
  providedIn: 'root',
})
export class CharacterCountService {
  /**
   * Конфигурация по умолчанию
   */
  private readonly defaultConfig: CounterConfig = {
    mode: 'characters',
    includeSpaces: true,
    includePunctuation: true,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ОСНОВНЫЕ МЕТОДЫ ПОДСЧЕТА
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Подсчитать символы в HTML контенте (основной метод)
   *
   * @param html - HTML строка для анализа
   * @param config - Конфигурация подсчета (опционально)
   * @returns Количество символов
   */
  countCharacters(html: string, config?: Partial<CounterConfig>): number {
    const finalConfig = { ...this.defaultConfig, ...config };
    const textContent = this.stripHtmlTags(html);

    return this.countInText(textContent, 'characters', finalConfig);
  }

  /**
   * Полный анализ контента с подсчетом всех метрик
   *
   * @param html - HTML строка для анализа
   * @param config - Конфигурация подсчета
   * @returns Объект с результатами всех видов подсчета
   */
  analyzeContent(html: string, config?: Partial<CounterConfig>): CountResult {
    const finalConfig = { ...this.defaultConfig, ...config };
    const textContent = this.stripHtmlTags(html);

    console.log('[CharacterCount] 📊 Analyzing content', {
      htmlLength: html.length,
      textLength: textContent.length,
      config: finalConfig,
    });

    const result: CountResult = {
      characters: this.countInText(textContent, 'characters', finalConfig),
      words: this.countInText(textContent, 'words', finalConfig),
      lines: this.countInText(textContent, 'lines', finalConfig),
      paragraphs: this.countParagraphs(html),
    };

    console.log('[CharacterCount] ✅ Analysis complete', result);
    return result;
  }

  /**
   * Проверить, превышен ли лимит
   *
   * @param count - Текущее количество
   * @param maxLimit - Максимальный лимит
   * @returns true, если лимит превышен
   */
  isOverLimit(count: number, maxLimit?: number): boolean {
    if (!maxLimit || maxLimit <= 0) return false;
    return count > maxLimit;
  }

  /**
   * Форматировать текст счетчика
   *
   * @param count - Текущее количество
   * @param mode - Режим подсчета
   * @param maxLimit - Максимальный лимит (опционально)
   * @returns Отформатированная строка
   */
  formatCountText(count: number, mode: CountMode = 'characters', maxLimit?: number): string {
    const modeLabels: { [key in CountMode]: string } = {
      characters: 'символов',
      words: 'слов',
      lines: 'строк',
      paragraphs: 'параграфов',
    };

    const label = modeLabels[mode];

    if (maxLimit && maxLimit > 0) {
      return `${count} / ${maxLimit} ${label}`;
    }

    return `${count} ${label}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ПОДСЧЕТА
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Подсчет в текстовом контенте (без HTML)
   */
  private countInText(text: string, mode: CountMode, config: CounterConfig): number {
    if (!text) return 0;

    switch (mode) {
      case 'characters':
        return this.countCharactersInText(text, config);

      case 'words':
        return this.countWordsInText(text);

      case 'lines':
        return this.countLinesInText(text);

      case 'paragraphs':
        // Для параграфов используется отдельный метод с HTML
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Подсчет символов в тексте
   */
  private countCharactersInText(text: string, config: CounterConfig): number {
    let processedText = text;

    // Исключаем пробелы, если нужно
    if (!config.includeSpaces) {
      processedText = processedText.replace(/\s+/g, '');
    }

    // Исключаем знаки препинания, если нужно
    if (!config.includePunctuation) {
      processedText = processedText.replace(/[.,;:!?'"()[\]{}\-—–]/g, '');
    }

    return processedText.length;
  }

  /**
   * Подсчет слов в тексте
   */
  private countWordsInText(text: string): number {
    if (!text.trim()) return 0;

    // Разбиваем по пробелам и фильтруем пустые строки
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }

  /**
   * Подсчет строк в тексте
   */
  private countLinesInText(text: string): number {
    if (!text) return 0;

    // Считаем переносы строк + 1
    const lines = text.split('\n');
    return lines.length;
  }

  /**
   * Подсчет параграфов в HTML
   */
  private countParagraphs(html: string): number {
    if (!html) return 0;

    // Создаем временный элемент для парсинга HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Считаем блочные элементы (p, div, h1-h6, blockquote, etc.)
    const blockElements = tempDiv.querySelectorAll(
      'p, div, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, li',
    );

    // Минимум 1 параграф, если есть текст
    const textContent = tempDiv.textContent || '';
    if (blockElements.length === 0 && textContent.trim()) {
      return 1;
    }

    return blockElements.length;
  }

  /**
   * Удаление HTML тегов из строки
   */
  private stripHtmlTags(html: string): string {
    if (!html) return '';

    // Создаем временный элемент для безопасного извлечения текста
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Получаем только текстовое содержимое
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Нормализуем пробелы (множественные → одинарные)
    return textContent.replace(/\s+/g, ' ').trim();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // УТИЛИТАРНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Получить статистику контента (для отладки/аналитики)
   */
  getContentStats(html: string): {
    htmlSize: number;
    textSize: number;
    tagCount: number;
    averageWordLength: number;
    readingTime: number; // в минутах
  } {
    const textContent = this.stripHtmlTags(html);
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Подсчет HTML тегов
    const tagMatches = html.match(/<[^>]+>/g) || [];

    // Средняя длина слова
    const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
    const averageWordLength = words.length > 0 ? totalWordLength / words.length : 0;

    // Время чтения (примерно 200 слов в минуту)
    const readingTime = Math.ceil(words.length / 200);

    return {
      htmlSize: html.length,
      textSize: textContent.length,
      tagCount: tagMatches.length,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      readingTime: readingTime || 1, // минимум 1 минута
    };
  }

  /**
   * Валидация лимитов
   */
  validateLimits(
    html: string,
    limits: { [mode in CountMode]?: number },
  ): {
    isValid: boolean;
    violations: { mode: CountMode; current: number; limit: number }[];
  } {
    const result = this.analyzeContent(html);
    const violations: { mode: CountMode; current: number; limit: number }[] = [];

    // Проверяем каждый лимит
    Object.entries(limits).forEach(([mode, limit]) => {
      const currentValue = result[mode as CountMode];
      if (limit && currentValue > limit) {
        violations.push({
          mode: mode as CountMode,
          current: currentValue,
          limit,
        });
      }
    });

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Создать краткий отчет о контенте
   */
  createContentReport(html: string): string {
    const analysis = this.analyzeContent(html);
    const stats = this.getContentStats(html);

    return `
📊 Анализ контента:
• Символов: ${analysis.characters}
• Слов: ${analysis.words}
• Строк: ${analysis.lines}
• Параграфов: ${analysis.paragraphs}
• Время чтения: ${stats.readingTime} мин
• HTML размер: ${stats.htmlSize} байт
• Тегов: ${stats.tagCount}
    `.trim();
  }
}
