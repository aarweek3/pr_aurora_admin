/**
 * ════════════════════════════════════════════════════════════════════════════
 * WORD COUNT MODAL COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Модальное окно для отображения детальной статистики текста.
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextStatistics } from '../../plugins/utility/word-count.plugin';

@Component({
  selector: 'app-word-count-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-count-modal.component.html',
  styleUrls: ['./word-count-modal.component.scss'],
})
export class WordCountModalComponent {
  @ViewChild('dialogRef', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  /**
   * Текущая статистика
   */
  statistics: TextStatistics = {
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    readingTime: 0,
  };

  /**
   * Открыть модальное окно
   */
  open(stats: TextStatistics): void {
    this.statistics = stats;
    this.dialogRef.nativeElement.showModal();
  }

  /**
   * Закрыть модальное окно
   */
  close(): void {
    this.dialogRef.nativeElement.close();
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
   * Получить среднюю длину слова
   */
  get averageWordLength(): number {
    if (this.statistics.words === 0) {
      return 0;
    }

    const avgLength = this.statistics.charactersNoSpaces / this.statistics.words;
    return Math.round(avgLength * 10) / 10;
  }

  /**
   * Получить среднюю длину предложения (в словах)
   */
  get averageSentenceLength(): number {
    if (this.statistics.sentences === 0) {
      return 0;
    }

    const avgLength = this.statistics.words / this.statistics.sentences;
    return Math.round(avgLength * 10) / 10;
  }

  /**
   * Получить плотность текста (слов на параграф)
   */
  get textDensity(): number {
    if (this.statistics.paragraphs === 0) {
      return 0;
    }

    const density = this.statistics.words / this.statistics.paragraphs;
    return Math.round(density * 10) / 10;
  }

  /**
   * Обработчик закрытия
   */
  onClose(): void {
    this.close();
  }
}
