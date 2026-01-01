import { Injectable } from '@angular/core';

/**
 * Позиция водяного знака на изображении
 */
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Конфигурация водяного знака (v2)
 */
export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image'; // Тип водяного знака (v2)
  text: string;
  imageUrl?: string; // Data URL логотипа (v2)
  imageFile?: File; // Файл логотипа (v2)
  position: WatermarkPosition;
  fontSize: number; // 0 = автоматический расчет, 12-72px для ручного
  fontFamily: string;
  color: string; // hex или rgba
  opacity: number; // 0-100%
  rotation: number; // -180 до 180
  offsetX: number;
  offsetY: number;
  imageWidth?: number; // Ширина логотипа в px (v2)
  imageHeight?: number; // Высота логотипа в px (v2)
  tilePattern?: boolean; // Повторяющийся узор (v2)
}

/**
 * Сервис для работы с водяными знаками
 *
 * Отвечает за:
 * - Наложение текстовых водяных знаков на изображения
 * - Вычисление позиций (9 предустановленных точек)
 * - Адаптивный расчет размера шрифта
 * - Работу с цветом и прозрачностью
 * - Валидацию конфигурации
 */
@Injectable({
  providedIn: 'root',
})
export class WatermarkService {
  /**
   * Применить водяной знак к изображению (Data URL) - v2
   *
   * @param dataUrl - Data URL исходного изображения
   * @param config - Конфигурация водяного знака
   * @returns Promise<string> - Data URL изображения с водяным знаком
   * @throws Error если изображение не загружается
   *
   * @example
   * const watermarkedImage = await watermarkService.applyWatermark(
   *   originalDataUrl,
   *   { type: 'text', text: '© 2025', position: 'bottom-right', ... }
   * );
   */
  async applyWatermark(dataUrl: string, config: WatermarkConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        // Создаем временный canvas для операции
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Рисуем исходное изображение
        ctx.drawImage(img, 0, 0);

        try {
          // Накладываем водяной знак (текст или изображение)
          if (config.type === 'image') {
            await this.drawImageWatermark(ctx, config, img.width, img.height);
          } else {
            this.drawWatermark(ctx, config, img.width, img.height);
          }

          // Возвращаем результат как Data URL
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  /**
   * Нарисовать водяной знак на canvas контексте
   *
   * @param ctx - Canvas 2D context
   * @param config - Конфигурация водяного знака
   * @param width - Ширина изображения
   * @param height - Высота изображения
   *
   * @example
   * const ctx = canvas.getContext('2d');
   * watermarkService.drawWatermark(ctx, config, 1920, 1080);
   */
  drawWatermark(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    width: number,
    height: number,
  ): void {
    // Рассчитать размер шрифта (адаптивный или заданный)
    const fontSize = config.fontSize || this.calculateAdaptiveFontSize(width);
    ctx.font = `${fontSize}px ${config.fontFamily}`;

    // Применить прозрачность к цвету
    const opacity = config.opacity / 100;
    const color = this.applyOpacity(config.color, opacity);
    ctx.fillStyle = color;
    ctx.textBaseline = 'bottom';

    // Измерить текст
    const textMetrics = ctx.measureText(config.text);
    const textWidth = textMetrics.width;
    const margin = 20;

    // Вычислить позицию
    const { x, y } = this.calculatePosition(
      config.position,
      width,
      height,
      textWidth,
      fontSize,
      margin,
      config.offsetX,
      config.offsetY,
    );

    // Применить трансформации если есть rotation
    if (config.rotation && config.rotation !== 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.fillText(config.text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(config.text, x, y);
    }
  }

  /**
   * Вычислить позицию водяного знака на изображении
   *
   * @param position - Предустановленная позиция (9 вариантов)
   * @param canvasWidth - Ширина canvas
   * @param canvasHeight - Высота canvas
   * @param textWidth - Ширина текста в пикселях
   * @param fontSize - Размер шрифта
   * @param margin - Отступ от краев
   * @param offsetX - Дополнительное смещение по X
   * @param offsetY - Дополнительное смещение по Y
   * @returns Координаты {x, y} для размещения текста
   *
   * @example
   * const { x, y } = watermarkService.calculatePosition(
   *   'bottom-right', 1920, 1080, 150, 32, 20, 0, 0
   * );
   */
  calculatePosition(
    position: WatermarkPosition,
    canvasWidth: number,
    canvasHeight: number,
    textWidth: number,
    fontSize: number,
    margin: number,
    offsetX: number = 0,
    offsetY: number = 0,
  ): { x: number; y: number } {
    let x: number, y: number;

    switch (position) {
      case 'top-left':
        x = margin;
        y = fontSize + margin;
        break;
      case 'top-center':
        x = (canvasWidth - textWidth) / 2;
        y = fontSize + margin;
        break;
      case 'top-right':
        x = canvasWidth - textWidth - margin;
        y = fontSize + margin;
        break;
      case 'center-left':
        x = margin;
        y = canvasHeight / 2;
        break;
      case 'center':
        x = (canvasWidth - textWidth) / 2;
        y = canvasHeight / 2;
        break;
      case 'center-right':
        x = canvasWidth - textWidth - margin;
        y = canvasHeight / 2;
        break;
      case 'bottom-left':
        x = margin;
        y = canvasHeight - margin;
        break;
      case 'bottom-center':
        x = (canvasWidth - textWidth) / 2;
        y = canvasHeight - margin;
        break;
      case 'bottom-right':
      default:
        x = canvasWidth - textWidth - margin;
        y = canvasHeight - margin;
        break;
    }

    // Применить пользовательское смещение
    x += offsetX;
    y += offsetY;

    return { x, y };
  }

  /**
   * Применить прозрачность к цвету
   *
   * Поддерживаемые форматы:
   * - HEX: #FFFFFF, #FFF
   * - RGB: rgb(255, 255, 255)
   * - RGBA: rgba(255, 255, 255, 0.5)
   *
   * @param color - Цвет в формате hex, rgb или rgba
   * @param opacity - Прозрачность (0.0 - 1.0)
   * @returns Цвет в формате rgba
   *
   * @example
   * const color1 = watermarkService.applyOpacity('#FFFFFF', 0.7);
   * // => 'rgba(255, 255, 255, 0.7)'
   *
   * const color2 = watermarkService.applyOpacity('rgb(255, 0, 0)', 0.5);
   * // => 'rgba(255, 0, 0, 0.5)'
   */
  applyOpacity(color: string, opacity: number): string {
    // Если цвет уже в rgba формате
    if (color.startsWith('rgba')) {
      return color;
    }

    // Конвертируем hex в rgba
    if (color.startsWith('#')) {
      // Обработка короткого формата (#FFF)
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map((char) => char + char)
          .join('');
      }

      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Если rgb формат
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }

    // Дефолтный белый цвет
    return `rgba(255, 255, 255, ${opacity})`;
  }

  /**
   * Рассчитать адаптивный размер шрифта на основе ширины изображения
   *
   * Формула: Math.max(24, Math.min(imageWidth / 20, 48))
   * - Минимальный размер: 24px
   * - Максимальный размер: 48px
   * - Адаптивный коэффициент: imageWidth / 20
   *
   * @param imageWidth - Ширина изображения в пикселях
   * @returns Размер шрифта в пикселях
   *
   * @example
   * const fontSize = watermarkService.calculateAdaptiveFontSize(1920);
   * // => 48 (1920 / 20 = 96, но max = 48)
   *
   * const fontSize2 = watermarkService.calculateAdaptiveFontSize(400);
   * // => 24 (400 / 20 = 20, но min = 24)
   */
  calculateAdaptiveFontSize(imageWidth: number): number {
    return Math.max(24, Math.min(imageWidth / 20, 48));
  }

  /**
   * Валидация конфигурации водяного знака
   *
   * Проверяет:
   * - Текст не пустой и не превышает 100 символов
   * - Размер шрифта в диапазоне 12-72px (если задан)
   * - Прозрачность в диапазоне 0-100%
   * - Поворот в диапазоне -180° до 180°
   *
   * @param config - Конфигурация водяного знака
   * @returns true если конфигурация валидна
   *
   * @example
   * const isValid = watermarkService.validateConfig({
   *   text: '© 2025',
   *   position: 'bottom-right',
   *   fontSize: 32,
   *   opacity: 70,
   *   // ...
   * });
   */
  validateConfig(config: WatermarkConfig): boolean {
    // Проверка текста
    if (!config.text || config.text.trim().length === 0) {
      return false;
    }
    if (config.text.length > 100) {
      return false;
    }

    // Проверка размера шрифта (если задан)
    if (config.fontSize && (config.fontSize < 12 || config.fontSize > 72)) {
      return false;
    }

    // Проверка прозрачности
    if (config.opacity < 0 || config.opacity > 100) {
      return false;
    }

    // Проверка поворота
    if (config.rotation < -180 || config.rotation > 180) {
      return false;
    }

    return true;
  }

  /**
   * Получить рекомендуемый размер шрифта для изображения
   *
   * @param imageWidth - Ширина изображения
   * @param imageHeight - Высота изображения
   * @returns Объект с рекомендуемым размером и обоснованием
   *
   * @example
   * const recommendation = watermarkService.getRecommendedFontSize(1920, 1080);
   * // => { size: 48, reason: 'Оптимальный для больших изображений' }
   */
  getRecommendedFontSize(
    imageWidth: number,
    imageHeight: number,
  ): { size: number; reason: string } {
    const calculatedSize = this.calculateAdaptiveFontSize(imageWidth);
    let reason = '';

    if (calculatedSize === 24) {
      reason = 'Минимальный размер для читаемости';
    } else if (calculatedSize === 48) {
      reason = 'Оптимальный для больших изображений';
    } else {
      reason = `Адаптирован под ширину ${imageWidth}px`;
    }

    return { size: calculatedSize, reason };
  }

  /**
   * Создать конфигурацию по умолчанию (v2)
   *
   * @returns Конфигурация водяного знака с дефолтными значениями
   */
  createDefaultConfig(): WatermarkConfig {
    return {
      enabled: false,
      type: 'text', // v2: по умолчанию текстовый
      text: '',
      position: 'bottom-right',
      fontSize: 0, // 0 = автоматический расчет
      fontFamily: 'Arial',
      color: '#FFFFFF',
      opacity: 70,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    };
  }

  /**
   * Получить все доступные позиции с описаниями
   *
   * @returns Массив объектов с позициями и их описаниями
   */
  getAvailablePositions(): Array<{ value: WatermarkPosition; label: string; icon: string }> {
    return [
      { value: 'top-left', label: 'Верхний левый угол', icon: '↖' },
      { value: 'top-center', label: 'Верхний центр', icon: '↑' },
      { value: 'top-right', label: 'Верхний правый угол', icon: '↗' },
      { value: 'center-left', label: 'Центр слева', icon: '←' },
      { value: 'center', label: 'По центру', icon: '●' },
      { value: 'center-right', label: 'Центр справа', icon: '→' },
      { value: 'bottom-left', label: 'Нижний левый угол', icon: '↙' },
      { value: 'bottom-center', label: 'Нижний центр', icon: '↓' },
      { value: 'bottom-right', label: 'Нижний правый угол', icon: '↘' },
    ];
  }

  /**
   * Получить список доступных шрифтов (v2)
   *
   * @returns Массив шрифтов с названиями
   */
  getAvailableFonts(): Array<{ value: string; label: string }> {
    return [
      { value: 'Arial', label: 'Arial' },
      { value: 'Times New Roman', label: 'Times New Roman' },
      { value: 'Verdana', label: 'Verdana' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Courier New', label: 'Courier New' },
    ];
  }

  /**
   * Загрузить изображение из File в Data URL (v2)
   *
   * @param file - Файл изображения
   * @returns Promise<string> - Data URL изображения
   * @throws Error если файл не является изображением или слишком большой
   */
  async loadImageFromFile(file: File): Promise<string> {
    // Валидация типа файла
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      throw new Error('Поддерживаются только PNG, JPEG и SVG');
    }

    // Валидация размера отключена - разрешаем файлы любого размера
    // if (file.size > 5 * 1024 * 1024) {
    //   throw new Error('Размер файла не должен превышать 5MB');
    // }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Вычислить размеры изображения с сохранением пропорций (v2)
   *
   * @param originalWidth - Оригинальная ширина
   * @param originalHeight - Оригинальная высота
   * @param maxWidth - Максимальная ширина
   * @param maxHeight - Максимальная высота
   * @returns Вычисленные размеры
   */
  calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.floor(originalWidth * ratio),
      height: Math.floor(originalHeight * ratio),
    };
  }

  /**
   * Получить рекомендуемый размер для логотипа (v2)
   *
   * @param canvasWidth - Ширина canvas
   * @param canvasHeight - Высота canvas
   * @returns Рекомендуемый размер
   */
  getRecommendedImageSize(
    canvasWidth: number,
    canvasHeight: number,
  ): { width: number; height: number } {
    // Рекомендуемый размер: 15% от меньшей стороны, но не более 500px
    const minSize = Math.min(canvasWidth, canvasHeight);
    const recommendedSize = Math.min(Math.floor(minSize * 0.15), 500);
    return {
      width: recommendedSize,
      height: recommendedSize,
    };
  }

  /**
   * Валидировать файл изображения (v2)
   *
   * @param file - Файл для валидации
   * @returns Результат валидации
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Проверка типа
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      return { valid: false, error: 'Поддерживаются только PNG, JPEG и SVG' };
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Размер файла не должен превышать 5MB' };
    }

    return { valid: true };
  }

  /**
   * Нарисовать изображение-водяной знак на canvas (v2)
   *
   * @param ctx - Контекст canvas
   * @param config - Конфигурация водяного знака
   * @param canvasWidth - Ширина canvas
   * @param canvasHeight - Высота canvas
   * @returns Promise<void>
   */
  async drawImageWatermark(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    if (!config.imageUrl) {
      throw new Error('Отсутствует URL изображения');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = config.imageWidth || img.width;
        const height = config.imageHeight || img.height;

        // Вычисляем позицию
        const { x, y } = this.calculatePosition(
          config.position,
          canvasWidth,
          canvasHeight,
          width,
          height,
          20, // margin
          config.offsetX || 0,
          config.offsetY || 0,
        );

        // Применяем прозрачность
        ctx.globalAlpha = (config.opacity || 100) / 100;

        // Применяем поворот если нужно
        if (config.rotation && config.rotation !== 0) {
          ctx.save();
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate((config.rotation * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, y, width, height);
        }

        // Восстанавливаем прозрачность
        ctx.globalAlpha = 1.0;

        resolve();
      };
      img.onerror = () => {
        reject(new Error('Ошибка загрузки изображения водяного знака'));
      };
      img.src = config.imageUrl!; // Проверено в начале метода
    });
  }

  /**
   * Отрендерить preview водяного знака на canvas
   * @param canvas - Canvas элемент для отрисовки
   * @param sourceDataUrl - Data URL исходного изображения
   * @param config - Конфигурация водяного знака
   * @returns Promise<void>
   */
  async renderWatermarkPreview(
    canvas: HTMLCanvasElement,
    sourceDataUrl: string,
    config: WatermarkConfig,
  ): Promise<void> {
    if (!sourceDataUrl) {
      console.warn('⚠️ renderWatermarkPreview: No source image');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ renderWatermarkPreview: No canvas context');
      return;
    }

    try {
      // Загружаем исходное изображение
      const img = await this.loadImage(sourceDataUrl);

      // Подгоняем canvas под размер изображения
      canvas.width = img.width;
      canvas.height = img.height;

      // Рисуем изображение
      ctx.drawImage(img, 0, 0);

      // Применяем водяной знак, если включен
      if (config.enabled) {
        if (config.type === 'image' && config.imageUrl) {
          await this.drawImageWatermark(ctx, config, img.width, img.height);
        } else if (config.type === 'text' && config.text) {
          this.drawWatermark(ctx, config, img.width, img.height);
        }
      }

      console.log('✅ Watermark preview rendered');
    } catch (error) {
      console.error('❌ Failed to render watermark preview:', error);
      throw error;
    }
  }

  /**
   * Загрузить изображение из Data URL
   * @param dataUrl - Data URL изображения
   * @returns Promise<HTMLImageElement>
   */
  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }
}
