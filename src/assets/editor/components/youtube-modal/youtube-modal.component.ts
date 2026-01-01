/**
 * ════════════════════════════════════════════════════════════════════════════
 * YOUTUBE MODAL COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Модальное окно для вставки YouTube видео в редактор.
 *
 * Особенности:
 * - Нативный <dialog> элемент
 * - Ввод URL YouTube видео
 * - Извлечение Video ID
 * - Настройка параметров встраивания (размер, autoplay, controls)
 * - Предпросмотр миниатюры
 * - Адаптивный режим
 *
 * @module YouTubeModalComponent
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Интерфейс настроек YouTube видео
 */
export interface YouTubeSettings {
  videoId: string;
  width: number;
  height: number;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  mute: boolean;
  responsive: boolean;
  alignment: 'left' | 'center' | 'right';
  title?: string;
  caption?: string;
}

/**
 * Компонент модального окна для вставки YouTube видео
 */
@Component({
  selector: 'aurora-youtube-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './youtube-modal.component.html',
  styleUrl: './youtube-modal.component.scss',
})
export class YouTubeModalComponent {
  /**
   * Ссылка на нативный dialog элемент
   */
  @ViewChild('dialog', { static: true })
  dialogRef!: ElementRef<HTMLDialogElement>;

  /**
   * Событие вставки видео
   */
  @Output() insert = new EventEmitter<YouTubeSettings>();

  /**
   * URL YouTube видео
   */
  url = '';

  /**
   * Настройки видео
   */
  settings: YouTubeSettings = {
    videoId: '',
    width: 560,
    height: 315,
    autoplay: false,
    controls: true,
    loop: false,
    mute: false,
    responsive: false,
    alignment: 'center',
    title: '',
    caption: '',
  };

  /**
   * Флаг ошибки парсинга URL
   */
  urlError = '';

  /**
   * Открыть модальное окно
   */
  open(): void {
    // Сбрасываем состояние
    this.url = '';
    this.urlError = '';
    this.settings = {
      videoId: '',
      width: 560,
      height: 315,
      autoplay: false,
      controls: true,
      loop: false,
      mute: false,
      responsive: false,
      alignment: 'center',
      title: '',
      caption: '',
    };

    this.dialogRef.nativeElement.showModal();
  }

  /**
   * Закрыть модальное окно
   */
  close(): void {
    this.dialogRef.nativeElement.close();
  }

  /**
   * Обработчик изменения URL
   */
  onUrlChange(): void {
    this.urlError = '';
    const videoId = this.extractVideoId(this.url);

    if (videoId) {
      this.settings.videoId = videoId;
      this.urlError = '';
    } else if (this.url) {
      this.urlError = 'Неверный URL YouTube видео';
      this.settings.videoId = '';
    }
  }

  /**
   * Извлечение Video ID из URL
   */
  private extractVideoId(url: string): string | null {
    if (!url) return null;

    // Регулярные выражения для различных форматов YouTube URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Прямой ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Получить URL для предпросмотра
   */
  getPreviewUrl(): string {
    if (!this.settings.videoId) {
      return '';
    }
    return `https://img.youtube.com/vi/${this.settings.videoId}/hqdefault.jpg`;
  }

  /**
   * Есть ли валидное видео
   */
  hasValidVideo(): boolean {
    return !!this.settings.videoId && !this.urlError;
  }

  /**
   * Обработчик отмены
   */
  onCancel(): void {
    this.close();
  }

  /**
   * Обработчик вставки видео
   */
  onInsert(): void {
    if (!this.settings.videoId) {
      console.error('[YouTubeModal] No video ID');
      alert('Введите корректный URL YouTube видео');
      return;
    }

    if (this.urlError) {
      console.error('[YouTubeModal] URL error:', this.urlError);
      alert('Исправьте ошибки перед вставкой');
      return;
    }

    this.insert.emit({ ...this.settings });
    this.close();
  }
}
