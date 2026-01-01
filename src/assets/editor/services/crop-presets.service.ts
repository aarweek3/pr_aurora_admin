/**
 * CropPresetsService - Управление пресетами обрезки
 * LocalStorage + Export/Import
 * Aurora Editor
 */

import { Injectable } from '@angular/core';
import { CropPreset } from './crop.types';

@Injectable({
  providedIn: 'root',
})
export class CropPresetsService {
  private readonly STORAGE_KEY = 'aurora-crop-presets';

  // Системные пресеты (не могут быть удалены)
  private readonly SOCIAL_PRESETS: CropPreset[] = [
    // Instagram
    { id: 'ig-post', name: 'Instagram Post', icon: '📷', width: 1080, height: 1080, isCustom: false },
    { id: 'ig-story', name: 'Instagram Story', icon: '📱', width: 1080, height: 1920, isCustom: false },
    { id: 'ig-reels', name: 'Instagram Reels', icon: '🎬', width: 1080, height: 1920, isCustom: false },
    { id: 'ig-carousel', name: 'Instagram Carousel', icon: '🖼️', width: 1080, height: 1350, isCustom: false },

    // Facebook
    { id: 'fb-post', name: 'Facebook Post', icon: '👥', width: 1200, height: 630, isCustom: false },
    { id: 'fb-cover', name: 'Facebook Cover', icon: '🖼️', width: 820, height: 312, isCustom: false },
    { id: 'fb-story', name: 'Facebook Story', icon: '📖', width: 1080, height: 1920, isCustom: false },

    // YouTube
    { id: 'yt-thumb', name: 'YouTube Thumbnail', icon: '▶️', width: 1280, height: 720, isCustom: false },
    { id: 'yt-banner', name: 'YouTube Banner', icon: '🎨', width: 2560, height: 1440, isCustom: false },

    // Twitter/X
    { id: 'tw-post', name: 'Twitter Post', icon: '🐦', width: 1200, height: 675, isCustom: false },
    { id: 'tw-header', name: 'Twitter Header', icon: '🎯', width: 1500, height: 500, isCustom: false },

    // LinkedIn
    { id: 'li-post', name: 'LinkedIn Post', icon: '💼', width: 1200, height: 627, isCustom: false },
    { id: 'li-cover', name: 'LinkedIn Cover', icon: '📊', width: 1584, height: 396, isCustom: false },

    // TikTok
    { id: 'tt-video', name: 'TikTok Video', icon: '🎵', width: 1080, height: 1920, isCustom: false },

    // Pinterest
    { id: 'pt-pin', name: 'Pinterest Pin', icon: '📌', width: 1000, height: 1500, isCustom: false },

    // Общие
    { id: 'hd-16-9', name: 'HD 16:9', icon: '🖥️', width: 1920, height: 1080, isCustom: false },
    { id: 'fhd', name: 'Full HD', icon: '📺', width: 1920, height: 1080, isCustom: false },
    { id: '4k', name: '4K UHD', icon: '🎬', width: 3840, height: 2160, isCustom: false },
  ];

  constructor() {}

  /**
   * Получить все собственные пресеты
   */
  getCustomPresets(): CropPreset[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      const presets = JSON.parse(stored) as CropPreset[];
      return presets.map((p) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      }));
    } catch (error) {
      console.error('Ошибка чтения пресетов из LocalStorage:', error);
      return [];
    }
  }

  /**
   * Получить системные пресеты
   */
  getSocialPresets(): CropPreset[] {
    return [...this.SOCIAL_PRESETS];
  }

  /**
   * Получить все пресеты (собственные + системные)
   */
  getAllPresets(): CropPreset[] {
    return [...this.getCustomPresets(), ...this.getSocialPresets()];
  }

  /**
   * Добавить собственный пресет
   */
  addPreset(preset: Omit<CropPreset, 'id' | 'isCustom' | 'createdAt'>): CropPreset {
    const newPreset: CropPreset = {
      ...preset,
      id: this.generateId(),
      isCustom: true,
      createdAt: new Date(),
    };

    const presets = this.getCustomPresets();
    presets.push(newPreset);
    this.saveToLocalStorage(presets);

    return newPreset;
  }

  /**
   * Удалить собственный пресет
   */
  deletePreset(id: string): boolean {
    const presets = this.getCustomPresets();
    const index = presets.findIndex((p) => p.id === id);

    if (index === -1) return false;

    presets.splice(index, 1);
    this.saveToLocalStorage(presets);
    return true;
  }

  /**
   * Экспортировать собственные пресеты в JSON файл
   */
  exportToJSON(): void {
    const presets = this.getCustomPresets();

    if (presets.length === 0) {
      alert('Нет собственных пресетов для экспорта');
      return;
    }

    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'aurora-crop-presets.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Импортировать пресеты из JSON файла
   */
  importFromJSON(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = JSON.parse(content) as CropPreset[];

          // Валидация
          if (!Array.isArray(imported)) {
            throw new Error('Файл должен содержать массив пресетов');
          }

          // Проверить обязательные поля
          for (const preset of imported) {
            if (!preset.name || !preset.width || !preset.height) {
              throw new Error('Пресет должен содержать name, width, height');
            }
          }

          // Добавить к существующим
          const existing = this.getCustomPresets();
          const merged = [...existing, ...imported.map((p) => ({
            ...p,
            id: this.generateId(), // Новый ID
            isCustom: true,
            createdAt: new Date(),
          }))];

          this.saveToLocalStorage(merged);
          alert(`Импортировано ${imported.length} пресетов`);
        } catch (error) {
          console.error('Ошибка импорта:', error);
          alert(`Ошибка импорта: ${(error as Error).message}`);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Очистить все собственные пресеты
   */
  clearCustomPresets(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ────────────────────────────────────────────────────────────────
  // Private Methods
  // ────────────────────────────────────────────────────────────────

  private saveToLocalStorage(presets: CropPreset[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Ошибка сохранения в LocalStorage:', error);
    }
  }

  private generateId(): string {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
