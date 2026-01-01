/**
 * Frame Utilities for Aurora Editor
 * Утилиты для работы с рамками изображений
 */

import { FRAME_CONSTRAINTS, FrameConfig, GradientConfig, ShadowConfig } from '../frame.types';

/**
 * Класс утилит для работы с рамками
 */
export class FrameUtils {
  /**
   * Применяет рамку к изображению на Canvas
   */
  static applyFrameToCanvas(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    config: FrameConfig,
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    console.log('🖼️ applyFrameToCanvas called:', {
      imageSize: { width: image.width, height: image.height },
      config: {
        padding: config.padding,
        thickness: config.thickness,
        type: config.type,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // РЕЖИМЫ ПРИМЕНЕНИЯ РАМКИ (автоматически по padding)
    // ═══════════════════════════════════════════════════════════════
    // padding = 0  → "ПОВЕРХ" - размер сохраняется, изображение в полном размере
    // padding > 0  → "ВОКРУГ" - размер увеличивается, рамка снаружи
    // ═══════════════════════════════════════════════════════════════

    let canvasWidth: number;
    let canvasHeight: number;
    let imageX: number;
    let imageY: number;
    let imageWidth: number;
    let imageHeight: number;

    if (config.padding > 0) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // РЕЖИМ "ВОКРУГ" - canvas увеличивается, изображение внутри
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const totalPadding = config.padding * 2;
      const totalFrameSize = config.thickness * 2;
      canvasWidth = image.width + totalPadding + totalFrameSize;
      canvasHeight = image.height + totalPadding + totalFrameSize;
      imageX = config.thickness + config.padding;
      imageY = config.thickness + config.padding;
      imageWidth = image.width; // ✅ Изображение в ПОЛНОМ размере
      imageHeight = image.height;

      console.log('🖼️ Mode: AROUND (вокруг) - canvas enlarged', {
        originalSize: { width: image.width, height: image.height },
        newCanvasSize: { width: canvasWidth, height: canvasHeight },
        sizeIncrease: {
          width: canvasWidth - image.width,
          height: canvasHeight - image.height,
        },
      });
    } else {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // РЕЖИМ "ПОВЕРХ" - размер сохраняется, изображение в полном размере
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      canvasWidth = image.width; // ✅ Размер canvas = размеру изображения
      canvasHeight = image.height;
      imageX = 0;
      imageY = 0;
      imageWidth = image.width; // ✅ Изображение в ПОЛНОМ размере
      imageHeight = image.height;

      console.log('🖼️ Mode: OVERLAY (поверх) - size preserved', {
        canvasSize: { width: canvasWidth, height: canvasHeight },
        imageSize: { width: imageWidth, height: imageHeight },
        sizeChange: 'NONE - размер сохранен',
      });
    }

    // Устанавливаем размер canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем изображение (уменьшенное если padding=0)
    ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);

    console.log('🖼️ Image drawn:', {
      position: { x: imageX, y: imageY },
      size: { width: imageWidth, height: imageHeight },
    });

    // Применяем рамку ПОВЕРХ
    this.drawFrame(ctx, config, canvasWidth, canvasHeight);

    console.log('🖼️ Frame drawn on canvas');
  }

  /**
   * Рисует рамку на контексте
   */
  private static drawFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    width: number,
    height: number,
  ): void {
    ctx.save();

    // Устанавливаем базовые свойства
    ctx.globalAlpha = config.opacity;
    ctx.lineWidth = config.thickness;

    // Координаты рамки
    const frameX = config.thickness / 2;
    const frameY = config.thickness / 2;
    const frameWidth = width - config.thickness;
    const frameHeight = height - config.thickness;

    // Применяем тень если есть
    if (config.shadow) {
      this.applyShadow(ctx, config.shadow);
    }

    // Выбираем тип рамки
    switch (config.type) {
      case 'solid':
        this.drawSolidFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'dashed':
        this.drawDashedFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'dotted':
        this.drawDottedFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'double':
        this.drawDoubleFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'gradient':
        this.drawGradientFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'shadow':
        this.drawShadowFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      case 'rounded':
        this.drawRoundedFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
        break;
      default:
        this.drawSolidFrame(ctx, config, frameX, frameY, frameWidth, frameHeight);
    }

    ctx.restore();
  }

  /**
   * Рисует сплошную рамку
   */
  private static drawSolidFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.strokeStyle = config.color;

    if (config.borderRadius > 0) {
      this.drawRoundedRect(ctx, x, y, width, height, config.borderRadius, false, true);
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Рисует пунктирную рамку
   */
  private static drawDashedFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.strokeStyle = config.color;
    ctx.setLineDash([config.thickness * 2, config.thickness]);

    if (config.borderRadius > 0) {
      this.drawRoundedRect(ctx, x, y, width, height, config.borderRadius, false, true);
    } else {
      ctx.strokeRect(x, y, width, height);
    }

    ctx.setLineDash([]); // Сброс
  }

  /**
   * Рисует точечную рамку
   */
  private static drawDottedFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.strokeStyle = config.color;
    ctx.setLineDash([config.thickness, config.thickness]);

    if (config.borderRadius > 0) {
      this.drawRoundedRect(ctx, x, y, width, height, config.borderRadius, false, true);
    } else {
      ctx.strokeRect(x, y, width, height);
    }

    ctx.setLineDash([]);
  }

  /**
   * Рисует двойную рамку
   */
  private static drawDoubleFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const innerThickness = Math.max(1, config.thickness / 3);
    const gap = innerThickness;

    ctx.strokeStyle = config.color;

    // Внешняя рамка
    ctx.lineWidth = innerThickness;
    ctx.strokeRect(x, y, width, height);

    // Внутренняя рамка
    const innerX = x + innerThickness + gap;
    const innerY = y + innerThickness + gap;
    const innerWidth = width - (innerThickness + gap) * 2;
    const innerHeight = height - (innerThickness + gap) * 2;

    ctx.strokeRect(innerX, innerY, innerWidth, innerHeight);
  }

  /**
   * Рисует градиентную рамку
   */
  private static drawGradientFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    if (!config.gradient) return;

    const gradient = this.createGradient(ctx, config.gradient, x, y, width, height);
    ctx.strokeStyle = gradient;

    if (config.borderRadius > 0) {
      this.drawRoundedRect(ctx, x, y, width, height, config.borderRadius, false, true);
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Рисует рамку с тенью
   */
  private static drawShadowFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Основная рамка
    ctx.strokeStyle = config.color;
    ctx.strokeRect(x, y, width, height);

    // Дополнительная тень
    const shadowOffset = config.thickness;
    ctx.globalAlpha = config.opacity * 0.3;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(x + shadowOffset, y + shadowOffset, width, height);
  }

  /**
   * Рисует скругленную рамку
   */
  private static drawRoundedFrame(
    ctx: CanvasRenderingContext2D,
    config: FrameConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.strokeStyle = config.color;
    this.drawRoundedRect(ctx, x, y, width, height, config.borderRadius, false, true);
  }

  /**
   * Рисует скругленный прямоугольник
   */
  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: boolean = false,
    stroke: boolean = true,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Создает градиент
   */
  private static createGradient(
    ctx: CanvasRenderingContext2D,
    gradientConfig: GradientConfig,
    x: number,
    y: number,
    width: number,
    height: number,
  ): CanvasGradient {
    let gradient: CanvasGradient;

    switch (gradientConfig.direction) {
      case 'to-right':
        gradient = ctx.createLinearGradient(x, y, x + width, y);
        break;
      case 'to-left':
        gradient = ctx.createLinearGradient(x + width, y, x, y);
        break;
      case 'to-bottom':
        gradient = ctx.createLinearGradient(x, y, x, y + height);
        break;
      case 'to-top':
        gradient = ctx.createLinearGradient(x, y + height, x, y);
        break;
      case 'to-bottom-right':
        gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        break;
      case 'to-bottom-left':
        gradient = ctx.createLinearGradient(x + width, y, x, y + height);
        break;
      case 'radial':
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        break;
      default:
        gradient = ctx.createLinearGradient(x, y, x + width, y);
    }

    // Добавляем цвета
    const colors = gradientConfig.colors;
    const stops = gradientConfig.stops || this.generateEvenStops(colors.length);

    colors.forEach((color: string, index: number) => {
      gradient.addColorStop(stops[index] / 100, color);
    });

    return gradient;
  }

  /**
   * Применяет тень к контексту
   */
  private static applyShadow(ctx: CanvasRenderingContext2D, shadow: ShadowConfig): void {
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowColor = shadow.color;
  }

  /**
   * Генерирует равномерные остановки градиента
   */
  private static generateEvenStops(count: number): number[] {
    if (count <= 1) return [0];
    if (count === 2) return [0, 100];

    const step = 100 / (count - 1);
    return Array.from({ length: count }, (_, i) => i * step);
  }

  /**
   * Валидирует конфигурацию рамки
   */
  static validateConfig(config: FrameConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Проверка толщины
    if (
      config.thickness < FRAME_CONSTRAINTS.thickness.min ||
      config.thickness > FRAME_CONSTRAINTS.thickness.max
    ) {
      errors.push(
        `Толщина должна быть от ${FRAME_CONSTRAINTS.thickness.min} до ${FRAME_CONSTRAINTS.thickness.max}px`,
      );
    }

    // Проверка прозрачности
    if (
      config.opacity < FRAME_CONSTRAINTS.opacity.min ||
      config.opacity > FRAME_CONSTRAINTS.opacity.max
    ) {
      errors.push(
        `Прозрачность должна быть от ${FRAME_CONSTRAINTS.opacity.min} до ${FRAME_CONSTRAINTS.opacity.max}`,
      );
    }

    // Проверка отступов
    if (
      config.padding < FRAME_CONSTRAINTS.padding.min ||
      config.padding > FRAME_CONSTRAINTS.padding.max
    ) {
      errors.push(
        `Отступ должен быть от ${FRAME_CONSTRAINTS.padding.min} до ${FRAME_CONSTRAINTS.padding.max}px`,
      );
    }

    // Проверка скругления
    if (
      config.borderRadius < FRAME_CONSTRAINTS.borderRadius.min ||
      config.borderRadius > FRAME_CONSTRAINTS.borderRadius.max
    ) {
      errors.push(
        `Скругление должно быть от ${FRAME_CONSTRAINTS.borderRadius.min} до ${FRAME_CONSTRAINTS.borderRadius.max}px`,
      );
    }

    // Проверка цвета
    if (!this.isValidColor(config.color)) {
      errors.push('Некорректный цвет');
    }

    // Проверка тени
    if (config.shadow) {
      const shadow = config.shadow;
      if (
        shadow.offsetX < FRAME_CONSTRAINTS.shadow.offset.min ||
        shadow.offsetX > FRAME_CONSTRAINTS.shadow.offset.max
      ) {
        errors.push('Некорректное смещение тени по X');
      }
      if (
        shadow.offsetY < FRAME_CONSTRAINTS.shadow.offset.min ||
        shadow.offsetY > FRAME_CONSTRAINTS.shadow.offset.max
      ) {
        errors.push('Некорректное смещение тени по Y');
      }
      if (
        shadow.blur < FRAME_CONSTRAINTS.shadow.blur.min ||
        shadow.blur > FRAME_CONSTRAINTS.shadow.blur.max
      ) {
        errors.push('Некорректное размытие тени');
      }
    }

    // Проверка градиента
    if (config.gradient) {
      if (!config.gradient.colors || config.gradient.colors.length < 2) {
        errors.push('Градиент должен содержать минимум 2 цвета');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Проверяет валидность цвета
   */
  static isValidColor(color: string): boolean {
    // Проверка hex
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }

    // Проверка rgb
    if (
      /^rgb\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*\)$/.test(
        color,
      )
    ) {
      return true;
    }

    // Проверка rgba
    if (
      /^rgba\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*((0\.[0-9]+)|[01])\s*\)$/.test(
        color,
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Конвертирует цвет в hex формат
   */
  static colorToHex(color: string): string {
    if (color.startsWith('#')) {
      return color;
    }

    // Простая конвертация для основных цветов
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return color;

    ctx.fillStyle = color;
    return ctx.fillStyle as string;
  }

  /**
   * Генерирует превью рамки
   */
  static generateFramePreview(config: FrameConfig, size: number = 100): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = size;
    canvas.height = size;

    // Создаем мини-изображение для превью
    const imageSize = size * 0.6;
    const imageX = (size - imageSize) / 2;
    const imageY = (size - imageSize) / 2;

    // Рисуем серый квадрат как изображение
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(imageX, imageY, imageSize, imageSize);

    // Создаем временное изображение
    const tempImage = new Image();
    tempImage.width = imageSize;
    tempImage.height = imageSize;

    // Применяем рамку (упрощенная версия)
    const frameThickness = Math.max(1, config.thickness * (size / 300));
    const frameX = imageX - frameThickness;
    const frameY = imageY - frameThickness;
    const frameWidth = imageSize + frameThickness * 2;
    const frameHeight = imageSize + frameThickness * 2;

    ctx.save();
    ctx.globalAlpha = config.opacity;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = frameThickness;

    if (config.borderRadius > 0) {
      const radius = config.borderRadius * (size / 300);
      this.drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, radius, false, true);
    } else {
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
    }

    ctx.restore();

    return canvas.toDataURL();
  }

  /**
   * Рассчитывает оптимальный размер Canvas для изображения с рамкой
   */
  static calculateCanvasSize(
    imageWidth: number,
    imageHeight: number,
    config: FrameConfig,
  ): { width: number; height: number } {
    const totalPadding = config.padding * 2;
    const totalFrameSize = config.thickness * 2;

    return {
      width: imageWidth + totalPadding + totalFrameSize,
      height: imageHeight + totalPadding + totalFrameSize,
    };
  }
}
