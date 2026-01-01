/**
 * ════════════════════════════════════════════════════════════════════════════
 * WORD COUNT PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин статистики текста для писателей и редакторов.
 * Подсчитывает слова, символы, параграфы и время чтения.
 * Горячая клавиша: Ctrl+Shift+W
 *
 * @module WordCountPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Статистика текста
 */
export interface TextStatistics {
  words: number; // Количество слов
  characters: number; // Символы с пробелами
  charactersNoSpaces: number; // Символы без пробелов
  paragraphs: number; // Количество параграфов
  sentences: number; // Количество предложений
  readingTime: number; // Время чтения в минутах
}

/**
 * Плагин подсчёта слов и статистики
 */
export class WordCountPlugin implements AuroraPlugin {
  name = 'wordCount';
  title = 'Статистика текста';
  icon = '📝'; // Блокнот
  shortcut = 'Ctrl+Shift+W';
  isDropdown = false;

  /**
   * Ссылка на модальное окно (устанавливается из компонента редактора)
   */
  modalComponent?: any;

  /**
   * Средняя скорость чтения (слов в минуту)
   * Средний показатель для русского языка: 200-250 слов/мин
   */
  private readonly READING_SPEED_WPM = 200;

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[WordCountPlugin] Initialized');
  }

  /**
   * Установить ссылку на модальное окно
   */
  setModalComponent(modalComponent: any): void {
    this.modalComponent = modalComponent;
  }

  /**
   * Выполнить команду показа статистики
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      // Получаем статистику
      const stats = this.calculateStatistics(editorElement);

      // Если есть модальное окно, открываем его
      if (this.modalComponent) {
        this.modalComponent.open(stats);
      } else {
        // Fallback: показываем alert со статистикой
        this.showStatisticsAlert(stats);
      }

      return true;
    } catch (error) {
      console.error('[WordCountPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Рассчитать статистику текста
   */
  calculateStatistics(editorElement: HTMLElement): TextStatistics {
    const text = this.extractText(editorElement);
    const cleanText = text.trim();

    return {
      words: this.countWords(cleanText),
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      paragraphs: this.countParagraphs(editorElement),
      sentences: this.countSentences(cleanText),
      readingTime: this.calculateReadingTime(cleanText),
    };
  }

  /**
   * Извлечь текст из редактора (без HTML тегов)
   */
  private extractText(editorElement: HTMLElement): string {
    // Используем textContent для получения чистого текста
    return editorElement.textContent || '';
  }

  /**
   * Подсчитать количество слов
   */
  private countWords(text: string): number {
    if (!text.trim()) {
      return 0;
    }

    // Разбиваем по пробельным символам и фильтруем пустые строки
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return words.length;
  }

  /**
   * Подсчитать количество параграфов
   */
  private countParagraphs(editorElement: HTMLElement): number {
    // Считаем блочные элементы как параграфы
    const blockElements = editorElement.querySelectorAll(
      'p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre'
    );

    // Фильтруем пустые параграфы
    let count = 0;
    blockElements.forEach((element) => {
      const text = (element.textContent || '').trim();
      if (text.length > 0) {
        count++;
      }
    });

    return count || 1; // Минимум 1 параграф
  }

  /**
   * Подсчитать количество предложений
   */
  private countSentences(text: string): number {
    if (!text.trim()) {
      return 0;
    }

    // Разбиваем по знакам препинания: . ! ?
    const sentences = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);

    return sentences.length;
  }

  /**
   * Рассчитать время чтения (в минутах)
   */
  private calculateReadingTime(text: string): number {
    const wordCount = this.countWords(text);

    if (wordCount === 0) {
      return 0;
    }

    // Время чтения = количество слов / скорость чтения
    const minutes = wordCount / this.READING_SPEED_WPM;

    // Округляем до 1 знака после запятой
    return Math.round(minutes * 10) / 10;
  }

  /**
   * Показать статистику в alert (fallback)
   */
  private showStatisticsAlert(stats: TextStatistics): void {
    const message = `
📊 Статистика текста:

🔢 Слов: ${stats.words}
📏 Символов (с пробелами): ${stats.characters}
📏 Символов (без пробелов): ${stats.charactersNoSpaces}
📄 Параграфов: ${stats.paragraphs}
📝 Предложений: ${stats.sentences}
⏱️ Время чтения: ${this.formatReadingTime(stats.readingTime)}
    `.trim();

    alert(message);
  }

  /**
   * Форматировать время чтения
   */
  formatReadingTime(minutes: number): string {
    if (minutes === 0) {
      return 'меньше минуты';
    }

    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds} сек`;
    }

    if (minutes < 60) {
      return `${Math.round(minutes)} мин`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (remainingMinutes === 0) {
      return `${hours} ч`;
    }

    return `${hours} ч ${remainingMinutes} мин`;
  }

  /**
   * Получить краткую статистику для статус-бара
   */
  getStatusBarText(editorElement: HTMLElement): string {
    const stats = this.calculateStatistics(editorElement);
    return `${stats.words} слов | ${stats.characters} символов`;
  }

  /**
   * Проверить, активен ли плагин
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[WordCountPlugin] Destroyed');
  }
}
