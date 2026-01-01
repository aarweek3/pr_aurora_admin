/* ============================================================================
YOUTUBE DIALOG COMPONENT
============================================================================

Компонент диалогового окна для вставки YouTube видео.

Особенности:
- Ввод URL YouTube видео
- Предпросмотр видео
- Настройки встраивания (размер, autoplay, loop и т.д.)
- Адаптивный или фиксированный размер

============================================================================ */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Интерфейс настроек YouTube видео
 */
export interface YouTubeEmbedSettings {
  videoId: string;
  url: string;
  width: number;
  height: number;
  responsive: boolean;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  mute: boolean;
  startTime?: number;
  title?: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
}

/**
 * Компонент диалога вставки YouTube видео
 */
@Component({
  selector: 'aurora-youtube-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './youtube-dialog.component.html',
  styleUrl: './youtube-dialog.component.scss',
})
export class YouTubeDialogComponent implements OnInit {
  /**
   * Событие закрытия диалога
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Событие вставки видео
   */
  @Output() insert = new EventEmitter<YouTubeEmbedSettings>();

  /**
   * URL YouTube видео
   */
  youtubeUrl = '';

  /**
   * ID видео (извлечённый из URL)
   */
  videoId = '';

  /**
   * Настройки встраивания
   */
  settings: YouTubeEmbedSettings = {
    videoId: '',
    url: '',
    width: 560,
    height: 315,
    responsive: true,
    autoplay: false,
    controls: true,
    loop: false,
    mute: false,
    startTime: undefined,
    title: '',
    caption: '',
    alignment: 'center',
  };

  /**
   * Ошибка валидации
   */
  errorMessage = '';

  /**
   * Предустановленные размеры
   */
  sizePresets = [
    { name: 'small', width: 426, height: 240, label: 'Маленький (426×240)' },
    { name: 'default', width: 560, height: 315, label: 'Стандартный (560×315)' },
    { name: 'large', width: 640, height: 360, label: 'Большой (640×360)' },
    { name: 'hd', width: 853, height: 480, label: 'HD (853×480)' },
    { name: 'fullhd', width: 1280, height: 720, label: 'Full HD (1280×720)' },
  ];

  /**
   * Выбранный пресет размера
   */
  selectedPreset = 'default';

  ngOnInit(): void {
    // Устанавливаем размеры по умолчанию
    this.applyPreset('default');
  }

  /**
   * Обработчик изменения URL
   */
  onUrlChange(): void {
    this.errorMessage = '';
    this.videoId = this.extractVideoId(this.youtubeUrl);

    if (this.videoId) {
      this.settings.videoId = this.videoId;
      this.settings.url = this.youtubeUrl;
    } else if (this.youtubeUrl) {
      this.errorMessage = 'Не удалось распознать YouTube URL. Проверьте корректность ссылки.';
    }
  }

  /**
   * Извлечение ID видео из URL
   */
  private extractVideoId(url: string): string {
    if (!url) return '';

    // Регулярные выражения для разных форматов YouTube URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Если передан просто ID (11 символов)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    return '';
  }

  /**
   * Применение пресета размера
   */
  applyPreset(presetName: string): void {
    const preset = this.sizePresets.find((p) => p.name === presetName);
    if (preset) {
      this.settings.width = preset.width;
      this.settings.height = preset.height;
      this.selectedPreset = presetName;
    }
  }

  /**
   * Получение URL превью
   */
  getThumbnailUrl(): string {
    if (!this.videoId) return '';
    return `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
  }

  /**
   * Получение URL для embed
   */
  getEmbedUrl(): string {
    if (!this.videoId) return '';

    const params: string[] = [];

    if (this.settings.autoplay) params.push('autoplay=1');
    if (!this.settings.controls) params.push('controls=0');
    if (this.settings.loop) params.push(`loop=1&playlist=${this.videoId}`);
    if (this.settings.mute) params.push('mute=1');
    if (this.settings.startTime) params.push(`start=${this.settings.startTime}`);

    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    return `https://www.youtube.com/embed/${this.videoId}${queryString}`;
  }

  /**
   * Валидация настроек
   */
  isValid(): boolean {
    if (!this.videoId) {
      return false;
    }

    if (!this.settings.responsive) {
      if (this.settings.width < 200 || this.settings.width > 2000) {
        this.errorMessage = 'Ширина должна быть от 200 до 2000 пикселей';
        return false;
      }

      if (this.settings.height < 150 || this.settings.height > 1500) {
        this.errorMessage = 'Высота должна быть от 150 до 1500 пикселей';
        return false;
      }
    }

    return true;
  }

  /**
   * Обработчик отмены
   */
  onCancel(): void {
    this.close.emit();
  }

  /**
   * Обработчик вставки видео
   */
  onInsert(): void {
    if (!this.isValid()) {
      return;
    }

    this.insert.emit({ ...this.settings });
  }

  /**
   * Сохранение пропорций 16:9
   */
  maintainAspectRatio(): void {
    this.settings.height = Math.round((this.settings.width * 9) / 16);
  }
}
