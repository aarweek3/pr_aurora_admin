/**
 * Frame Presets for Aurora Editor
 * Предустановленные стили рамок
 */

import { FramePreset } from '../frame.types';

/**
 * Коллекция встроенных пресетов рамок
 */
export class FramePresets {
  /**
   * Получает все встроенные пресеты
   */
  static getAllPresets(): FramePreset[] {
    return [
      ...this.getClassicPresets(),
      ...this.getModernPresets(),
      ...this.getArtisticPresets(),
      ...this.getDecorativePresets(),
    ];
  }

  /**
   * Классические рамки
   */
  static getClassicPresets(): FramePreset[] {
    return [
      {
        id: 'classic-black-thin',
        name: 'Тонкая черная',
        description: 'Классическая тонкая черная рамка 1px',
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
        id: 'classic-black-medium',
        name: 'Черная средняя',
        description: 'Черная рамка средней толщины 3px',
        category: 'classic',
        config: {
          type: 'solid',
          thickness: 3,
          color: '#000000',
          opacity: 1,
          padding: 2,
          borderRadius: 0,
        },
      },
      {
        id: 'classic-gray-medium',
        name: 'Серая средняя',
        description: 'Серая рамка средней толщины с отступом',
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
        description: 'Толстая белая рамка с большим отступом',
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
      {
        id: 'classic-silver',
        name: 'Серебряная',
        description: 'Классическая серебряная рамка',
        category: 'classic',
        config: {
          type: 'solid',
          thickness: 4,
          color: '#c0c0c0',
          opacity: 1,
          padding: 6,
          borderRadius: 0,
        },
      },
    ];
  }

  /**
   * Современные рамки
   */
  static getModernPresets(): FramePreset[] {
    return [
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
        id: 'modern-gradient-rainbow',
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
        id: 'modern-gradient-sunset',
        name: 'Закат градиент',
        description: 'Градиент в цветах заката',
        category: 'modern',
        config: {
          type: 'gradient',
          thickness: 5,
          color: '#ff6b35',
          opacity: 1,
          padding: 6,
          borderRadius: 10,
          gradient: {
            direction: 'to-bottom-right',
            colors: ['#ff6b35', '#ff8e53', '#ff6b9d', '#c44569'],
          },
        },
      },
      {
        id: 'modern-rounded-blue',
        name: 'Голубая скругленная',
        description: 'Современная голубая рамка со скругленными углами',
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
      {
        id: 'modern-neon',
        name: 'Неоновое свечение',
        description: 'Яркая неоновая рамка с эффектом свечения',
        category: 'modern',
        config: {
          type: 'solid',
          thickness: 2,
          color: '#00ffff',
          opacity: 1,
          padding: 10,
          borderRadius: 6,
          shadow: {
            offsetX: 0,
            offsetY: 0,
            blur: 15,
            spread: 3,
            color: '#00ffff',
          },
        },
      },
      {
        id: 'modern-minimal',
        name: 'Минимализм',
        description: 'Минималистичная тонкая рамка',
        category: 'modern',
        config: {
          type: 'solid',
          thickness: 1,
          color: '#9e9e9e',
          opacity: 0.8,
          padding: 15,
          borderRadius: 2,
        },
      },
    ];
  }

  /**
   * Художественные рамки
   */
  static getArtisticPresets(): FramePreset[] {
    return [
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
        id: 'artistic-gold-ornate',
        name: 'Золотая орнамент',
        description: 'Роскошная золотая рамка с двойной линией',
        category: 'artistic',
        config: {
          type: 'double',
          thickness: 10,
          color: '#daa520',
          opacity: 1,
          padding: 18,
          borderRadius: 0,
        },
      },
      {
        id: 'artistic-vintage-brown',
        name: 'Винтаж коричневый',
        description: 'Винтажная коричневая рамка',
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
      {
        id: 'artistic-bronze',
        name: 'Бронзовая',
        description: 'Классическая бронзовая рамка',
        category: 'artistic',
        config: {
          type: 'solid',
          thickness: 7,
          color: '#cd7f32',
          opacity: 1,
          padding: 14,
          borderRadius: 0,
        },
      },
      {
        id: 'artistic-mahogany',
        name: 'Красное дерево',
        description: 'Рамка под красное дерево',
        category: 'artistic',
        config: {
          type: 'solid',
          thickness: 12,
          color: '#c04000',
          opacity: 1,
          padding: 20,
          borderRadius: 0,
        },
      },
      {
        id: 'artistic-antique',
        name: 'Антикварная',
        description: 'Антикварная рамка с патиной',
        category: 'artistic',
        config: {
          type: 'groove',
          thickness: 9,
          color: '#696969',
          opacity: 0.9,
          padding: 16,
          borderRadius: 0,
        },
      },
    ];
  }

  /**
   * Декоративные рамки
   */
  static getDecorativePresets(): FramePreset[] {
    return [
      {
        id: 'decorative-dashed-black',
        name: 'Пунктирная черная',
        description: 'Черная пунктирная рамка',
        category: 'decorative',
        config: {
          type: 'dashed',
          thickness: 2,
          color: '#000000',
          opacity: 1,
          padding: 4,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-dotted-gray',
        name: 'Точечная серая',
        description: 'Серая точечная рамка',
        category: 'decorative',
        config: {
          type: 'dotted',
          thickness: 3,
          color: '#666666',
          opacity: 1,
          padding: 6,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-groove-silver',
        name: 'Вдавленная серебро',
        description: 'Серебряная вдавленная рамка',
        category: 'decorative',
        config: {
          type: 'groove',
          thickness: 6,
          color: '#c0c0c0',
          opacity: 1,
          padding: 8,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-ridge-gold',
        name: 'Выпуклая золото',
        description: 'Золотая выпуклая рамка',
        category: 'decorative',
        config: {
          type: 'ridge',
          thickness: 8,
          color: '#ffd700',
          opacity: 1,
          padding: 10,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-inset-dark',
        name: 'Внутренняя темная',
        description: 'Темная внутренняя рамка',
        category: 'decorative',
        config: {
          type: 'inset',
          thickness: 5,
          color: '#333333',
          opacity: 1,
          padding: 7,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-outset-light',
        name: 'Внешняя светлая',
        description: 'Светлая внешняя рамка',
        category: 'decorative',
        config: {
          type: 'outset',
          thickness: 5,
          color: '#e0e0e0',
          opacity: 1,
          padding: 7,
          borderRadius: 0,
        },
      },
      {
        id: 'decorative-ocean-gradient',
        name: 'Океан градиент',
        description: 'Градиент в цветах океана',
        category: 'decorative',
        config: {
          type: 'gradient',
          thickness: 6,
          color: '#006994',
          opacity: 1,
          padding: 8,
          borderRadius: 15,
          gradient: {
            direction: 'radial',
            colors: ['#006994', '#0891b2', '#66d9ef', '#8ee4af'],
          },
        },
      },
      {
        id: 'decorative-fire-gradient',
        name: 'Огонь градиент',
        description: 'Градиент в цветах пламени',
        category: 'decorative',
        config: {
          type: 'gradient',
          thickness: 5,
          color: '#ff4757',
          opacity: 1,
          padding: 7,
          borderRadius: 8,
          gradient: {
            direction: 'to-top',
            colors: ['#ff4757', '#ff6348', '#ff7675', '#fdcb6e'],
          },
        },
      },
    ];
  }

  /**
   * Получает пресет по ID
   */
  static getPresetById(id: string): FramePreset | undefined {
    return this.getAllPresets().find((preset) => preset.id === id);
  }

  /**
   * Получает пресеты по категории
   */
  static getPresetsByCategory(category: string): FramePreset[] {
    return this.getAllPresets().filter((preset) => preset.category === category);
  }

  /**
   * Получает список всех категорий
   */
  static getCategories(): string[] {
    const categories = new Set(this.getAllPresets().map((preset) => preset.category));
    return Array.from(categories);
  }

  /**
   * Генерирует превью для пресета
   */
  static generatePresetPreview(preset: FramePreset, size: number = 80): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = size;
    canvas.height = size;

    // Создаем мини-изображение
    const imageSize = size * 0.5;
    const imageX = (size - imageSize) / 2;
    const imageY = (size - imageSize) / 2;

    // Рисуем фон изображения
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(imageX, imageY, imageSize, imageSize);

    // Рисуем простую иконку изображения
    ctx.fillStyle = '#ccc';
    ctx.fillRect(imageX + 5, imageY + 5, imageSize - 10, imageSize - 20);
    ctx.fillStyle = '#999';
    ctx.fillRect(imageX + 8, imageY + imageSize - 12, imageSize - 16, 4);

    // Применяем упрощенную версию рамки
    const config = preset.config;
    const frameThickness = Math.max(1, config.thickness * (size / 200));
    const frameX = imageX - frameThickness - config.padding * (size / 200);
    const frameY = imageY - frameThickness - config.padding * (size / 200);
    const frameWidth = imageSize + (frameThickness + config.padding * (size / 200)) * 2;
    const frameHeight = imageSize + (frameThickness + config.padding * (size / 200)) * 2;

    ctx.save();
    ctx.globalAlpha = config.opacity;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = frameThickness;

    // Упрощенная отрисовка рамки для превью
    switch (config.type) {
      case 'dashed':
        ctx.setLineDash([frameThickness * 2, frameThickness]);
        break;
      case 'dotted':
        ctx.setLineDash([frameThickness, frameThickness]);
        break;
    }

    if (config.borderRadius && config.borderRadius > 0) {
      const radius = config.borderRadius * (size / 200);
      this.drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, radius);
    } else {
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
    }

    ctx.restore();

    return canvas.toDataURL();
  }

  /**
   * Вспомогательный метод для рисования скругленного прямоугольника
   */
  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
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
    ctx.stroke();
  }
}
