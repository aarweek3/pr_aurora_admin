/**
 * Frame Service for Aurora Editor
 * Сервис для создания рамок изображений
 */

import { Injectable } from '@angular/core';
import {
  DEFAULT_FRAME_CONFIG,
  DEFAULT_FRAME_SERVICE_CONFIG,
  FrameConfig,
  FrameEvents,
  FramePreset,
  FrameResult,
  FrameServiceConfig,
  FrameState,
  IFrameService,
} from './frame.types';
import { FrameUtils } from './utils/frame.utils';

@Injectable({
  providedIn: 'root',
})
export class FrameService implements IFrameService {
  private state: FrameState = {
    isActive: false,
    currentConfig: { ...DEFAULT_FRAME_CONFIG },
    presets: [],
  };

  private serviceConfig: FrameServiceConfig = { ...DEFAULT_FRAME_SERVICE_CONFIG };
  private eventListeners: Map<keyof FrameEvents, Function[]> = new Map();

  constructor() {
    this.initializePresets();
    this.loadSavedConfig();
  }

  // ===== ОСНОВНЫЕ МЕТОДЫ =====

  /**
   * Активирует Frame сервис с изображением
   */
  async activate(image: HTMLImageElement, canvas: HTMLCanvasElement): Promise<void> {
    try {
      if (!image || !canvas) {
        console.error('🖼️ FrameService activate failed:', { image: !!image, canvas: !!canvas });
        throw new Error('Image и Canvas обязательны для активации');
      }

      console.log('🖼️ FrameService activate success - Canvas element:', {
        canvas: canvas,
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      });

      // Проверяем размер изображения
      const imageSizeMB = this.calculateImageSize(image);
      if (imageSizeMB > this.serviceConfig.maxImageSize) {
        throw new Error(`Размер изображения превышает лимит ${this.serviceConfig.maxImageSize}MB`);
      }

      this.state.originalImage = image;
      this.state.canvasElement = canvas;
      this.state.isActive = true;

      // Устанавливаем размер canvas
      const canvasSize = FrameUtils.calculateCanvasSize(
        image.width,
        image.height,
        this.state.currentConfig,
      );

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Генерируем начальный превью
      if (this.serviceConfig.autoPreview) {
        await this.generatePreview(this.state.currentConfig);
      }

      this.emit('onConfigChange', this.state.currentConfig);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка активации';
      this.emit('onError', errorMessage);
      throw error;
    }
  }

  /**
   * Деактивирует Frame сервис
   */
  deactivate(): void {
    this.state.isActive = false;
    this.state.originalImage = undefined;
    this.state.canvasElement = undefined;
    this.state.previewUrl = undefined;

    // Очищаем canvas
    if (this.state.canvasElement) {
      const canvas = this.state.canvasElement as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    this.emit('onReset');
  }

  // ===== ПРИМЕНЕНИЕ РАМКИ =====

  /**
   * Применяет рамку к изображению
   */
  async applyFrame(config: FrameConfig): Promise<FrameResult> {
    try {
      if (!this.state.isActive || !this.state.originalImage || !this.state.canvasElement) {
        throw new Error('Сервис не активен');
      }

      // Валидируем конфигурацию
      const validation = FrameUtils.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Некорректная конфигурация: ${validation.errors.join(', ')}`);
      }

      const image = this.state.originalImage;
      const canvas = this.state.canvasElement;

      // Применяем рамку
      FrameUtils.applyFrameToCanvas(canvas, image, config);

      // Получаем результат
      const dataUrl = canvas.toDataURL('image/png', this.serviceConfig.previewQuality);

      const result: FrameResult = {
        success: true,
        dataUrl,
        originalSize: {
          width: image.width,
          height: image.height,
        },
        resultSize: {
          width: canvas.width,
          height: canvas.height,
        },
      };

      // Сохраняем конфигурацию
      this.state.currentConfig = { ...config };
      if (this.serviceConfig.saveConfig) {
        this.saveConfig();
      }

      this.emit('onApply', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка применения рамки';
      const result: FrameResult = {
        success: false,
        error: errorMessage,
        originalSize: { width: 0, height: 0 },
        resultSize: { width: 0, height: 0 },
      };

      this.emit('onError', errorMessage);
      return result;
    }
  }

  /**
   * Генерирует превью рамки
   */
  async generatePreview(config: FrameConfig): Promise<string> {
    try {
      console.log('🖼️ generatePreview called with config:', config);

      if (!this.state.isActive || !this.state.originalImage || !this.state.canvasElement) {
        console.error('🖼️ generatePreview failed - service state:', {
          isActive: this.state.isActive,
          hasImage: !!this.state.originalImage,
          hasCanvas: !!this.state.canvasElement,
        });
        throw new Error('Сервис не активен');
      }

      // Создаем временный canvas для превью
      const tempCanvas = document.createElement('canvas');
      const image = this.state.originalImage;

      // Масштабируем для превью
      const maxSize = 400;
      const scale = Math.min(maxSize / image.width, maxSize / image.height);
      const previewWidth = image.width * scale;
      const previewHeight = image.height * scale;

      // Создаем масштабированное изображение
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = previewWidth;
      scaledCanvas.height = previewHeight;
      const scaledCtx = scaledCanvas.getContext('2d');
      if (!scaledCtx) throw new Error('Cannot create scaled canvas context');

      scaledCtx.drawImage(image, 0, 0, previewWidth, previewHeight);

      // Создаем изображение для превью
      const scaledImage = new Image();
      scaledImage.src = scaledCanvas.toDataURL();

      await new Promise<void>((resolve) => {
        scaledImage.onload = () => resolve();
      });

      // Масштабируем конфигурацию для превью
      const previewConfig: FrameConfig = {
        ...config,
        thickness: config.thickness * scale,
        padding: config.padding * scale,
        borderRadius: config.borderRadius * scale,
      };

      // Применяем рамку к превью
      FrameUtils.applyFrameToCanvas(tempCanvas, scaledImage, previewConfig);

      const previewUrl = tempCanvas.toDataURL('image/png', this.serviceConfig.previewQuality);
      this.state.previewUrl = previewUrl;

      this.emit('onPreviewUpdate', previewUrl);
      return previewUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка создания превью';
      this.emit('onError', errorMessage);
      throw error;
    }
  }

  // ===== УПРАВЛЕНИЕ КОНФИГУРАЦИЕЙ =====

  /**
   * Устанавливает конфигурацию рамки
   */
  setConfig(config: Partial<FrameConfig>): void {
    this.state.currentConfig = { ...this.state.currentConfig, ...config };

    if (this.serviceConfig.autoPreview && this.state.isActive) {
      this.generatePreview(this.state.currentConfig);
    }

    this.emit('onConfigChange', this.state.currentConfig);
  }

  /**
   * Получает текущую конфигурацию
   */
  getConfig(): FrameConfig {
    return { ...this.state.currentConfig };
  }

  /**
   * Сбрасывает конфигурацию к дефолтной
   */
  resetConfig(): void {
    this.state.currentConfig = { ...DEFAULT_FRAME_CONFIG };

    if (this.serviceConfig.autoPreview && this.state.isActive) {
      this.generatePreview(this.state.currentConfig);
    }

    this.emit('onConfigChange', this.state.currentConfig);
    this.emit('onReset');
  }

  /**
   * Валидирует конфигурацию
   */
  validateConfig(config: FrameConfig): boolean {
    return FrameUtils.validateConfig(config).valid;
  }

  // ===== УПРАВЛЕНИЕ ПРЕСЕТАМИ =====

  /**
   * Получает список пресетов
   */
  getPresets(): FramePreset[] {
    return [...this.state.presets];
  }

  /**
   * Добавляет пользовательский пресет
   */
  addCustomPreset(preset: FramePreset): void {
    if (!this.serviceConfig.customPresets) {
      throw new Error('Пользовательские пресеты отключены');
    }

    // Проверяем уникальность ID
    if (this.state.presets.some((p) => p.id === preset.id)) {
      throw new Error('Пресет с таким ID уже существует');
    }

    preset.isCustom = true;
    this.state.presets.push(preset);
    this.savePresets();
  }

  /**
   * Удаляет пользовательский пресет
   */
  removeCustomPreset(id: string): void {
    const presetIndex = this.state.presets.findIndex((p) => p.id === id && p.isCustom);
    if (presetIndex === -1) {
      throw new Error('Пресет не найден или не является пользовательским');
    }

    this.state.presets.splice(presetIndex, 1);
    this.savePresets();
  }

  /**
   * Применяет пресет
   */
  applyPreset(presetId: string): void {
    const preset = this.state.presets.find((p) => p.id === presetId);
    if (!preset) {
      throw new Error('Пресет не найден');
    }

    this.setConfig(preset.config);
  }

  // ===== СОБЫТИЯ =====

  /**
   * Подписка на события
   */
  on(event: keyof FrameEvents, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Отписка от событий
   */
  off(event: keyof FrameEvents, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Эмиссия события
   */
  private emit(event: keyof FrameEvents, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  // ===== СОСТОЯНИЕ =====

  /**
   * Получает текущее состояние
   */
  getState(): FrameState {
    return { ...this.state };
  }

  /**
   * Проверяет активность сервиса
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  // ===== ПРИВАТНЫЕ МЕТОДЫ =====

  /**
   * Инициализирует предустановленные пресеты
   */
  private initializePresets(): void {
    // Загружаем пресеты из файла presets
    this.loadPresets();
  }

  /**
   * Рассчитывает размер изображения в MB
   */
  private calculateImageSize(image: HTMLImageElement): number {
    // Приблизительный расчет: width * height * 4 (RGBA) / 1024 / 1024
    return (image.width * image.height * 4) / (1024 * 1024);
  }

  /**
   * Сохраняет конфигурацию в localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('aurora-frame-config', JSON.stringify(this.state.currentConfig));
    } catch (error) {
      console.warn('Не удалось сохранить конфигурацию Frame:', error);
    }
  }

  /**
   * Загружает сохраненную конфигурацию
   */
  private loadSavedConfig(): void {
    try {
      const saved = localStorage.getItem('aurora-frame-config');
      if (saved) {
        const config = JSON.parse(saved);
        if (this.validateConfig(config)) {
          this.state.currentConfig = { ...DEFAULT_FRAME_CONFIG, ...config };
        }
      }
    } catch (error) {
      console.warn('Не удалось загрузить сохраненную конфигурацию Frame:', error);
    }
  }

  /**
   * Сохраняет пресеты в localStorage
   */
  private savePresets(): void {
    try {
      const customPresets = this.state.presets.filter((p) => p.isCustom);
      localStorage.setItem('aurora-frame-presets', JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Не удалось сохранить пресеты Frame:', error);
    }
  }

  /**
   * Загружает пресеты
   */
  private loadPresets(): void {
    // Сначала загружаем встроенные пресеты
    this.state.presets = this.getBuiltInPresets();

    // Затем загружаем пользовательские из localStorage
    try {
      const saved = localStorage.getItem('aurora-frame-presets');
      if (saved) {
        const customPresets = JSON.parse(saved);
        this.state.presets.push(...customPresets);
      }
    } catch (error) {
      console.warn('Не удалось загрузить пользовательские пресеты Frame:', error);
    }
  }

  /**
   * Получает встроенные пресеты
   */
  private getBuiltInPresets(): FramePreset[] {
    return [
      // Классические рамки
      {
        id: 'classic-black-thin',
        name: 'Тонкая черная',
        description: 'Классическая тонкая черная рамка',
        category: 'classic',
        config: {
          type: 'solid',
          thickness: 1,
          color: '#000000',
          opacity: 1,
          padding: 0,
          borderRadius: 0,
        },
      },
      {
        id: 'classic-gray-medium',
        name: 'Серая средняя',
        description: 'Серая рамка средней толщины',
        category: 'classic',
        config: {
          type: 'solid',
          thickness: 3,
          color: '#808080',
          opacity: 1,
          padding: 5,
          borderRadius: 0,
        },
      },
      {
        id: 'classic-white-thick',
        name: 'Белая толстая',
        description: 'Толстая белая рамка с отступом',
        category: 'classic',
        config: {
          type: 'solid',
          thickness: 8,
          color: '#ffffff',
          opacity: 1,
          padding: 10,
          borderRadius: 0,
        },
      },

      // Современные рамки
      {
        id: 'modern-shadow',
        name: 'Материал тень',
        description: 'Современная рамка с тенью в стиле Material Design',
        category: 'modern',
        config: {
          type: 'shadow',
          thickness: 2,
          color: '#e0e0e0',
          opacity: 1,
          padding: 8,
          borderRadius: 4,
          shadow: {
            offsetX: 0,
            offsetY: 2,
            blur: 8,
            spread: 0,
            color: 'rgba(0,0,0,0.2)',
          },
        },
      },
      {
        id: 'modern-gradient',
        name: 'Радуга градиент',
        description: 'Градиентная рамка с радужными цветами',
        category: 'modern',
        config: {
          type: 'gradient',
          thickness: 4,
          color: '#ff0000',
          opacity: 1,
          padding: 5,
          borderRadius: 8,
          gradient: {
            direction: 'to-right',
            colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
          },
        },
      },
      {
        id: 'modern-rounded',
        name: 'Скругленная',
        description: 'Современная рамка со скругленными углами',
        category: 'modern',
        config: {
          type: 'solid',
          thickness: 3,
          color: '#2196f3',
          opacity: 1,
          padding: 8,
          borderRadius: 12,
        },
      },

      // Художественные рамки
      {
        id: 'artistic-gold',
        name: 'Золотая',
        description: 'Элегантная золотая рамка',
        category: 'artistic',
        config: {
          type: 'solid',
          thickness: 6,
          color: '#ffd700',
          opacity: 1,
          padding: 12,
          borderRadius: 0,
        },
      },
      {
        id: 'artistic-vintage',
        name: 'Винтаж',
        description: 'Винтажная рамка с двойной линией',
        category: 'artistic',
        config: {
          type: 'double',
          thickness: 8,
          color: '#8b4513',
          opacity: 1,
          padding: 15,
          borderRadius: 0,
        },
      },
    ];
  }
}
