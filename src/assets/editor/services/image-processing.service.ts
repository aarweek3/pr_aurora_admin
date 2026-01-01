import { Injectable } from '@angular/core';

export type ImageFilterType = 'grayscale' | 'sepia' | 'vintage' | 'cold' | 'warm';

export interface BrightnessContrastParams {
  brightness: number;
  contrast: number;
}

export interface CropParams {
  width: number;
  height: number;
}

export interface RotateParams {
  angle: number;
}

export interface FlipParams {
  direction: 'horizontal' | 'vertical';
}

export interface FilterParams {
  filter: ImageFilterType;
}

@Injectable({
  providedIn: 'root',
})
export class ImageProcessingService {
  constructor() {}

  /**
   * Повернуть изображение на указанный угол
   */
  async rotateImage(dataUrl: string, angle: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Определить размеры canvas в зависимости от угла поворота
        if (angle === 90 || angle === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Повернуть изображение
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for rotation'));
      img.src = dataUrl;
    });
  }

  /**
   * Отразить изображение по горизонтали или вертикали
   */
  async flipImage(dataUrl: string, direction: 'horizontal' | 'vertical'): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.save();

        if (direction === 'horizontal') {
          ctx.scale(-1, 1);
          ctx.drawImage(img, -img.width, 0);
        } else {
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, -img.height);
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for flip'));
      img.src = dataUrl;
    });
  }

  /**
   * Обрезать изображение от центра до указанных размеров
   */
  async cropImageFromCenter(dataUrl: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Вычисляем координаты центральной области в исходном изображении
        const cropWidth = Math.min(width, img.width);
        const cropHeight = Math.min(height, img.height);

        const sourceX = (img.width - cropWidth) / 2;
        const sourceY = (img.height - cropHeight) / 2;

        // Если запрашиваемые размеры больше исходного изображения,
        // центрируем исходное изображение на canvas
        const destX = (width - cropWidth) / 2;
        const destY = (height - cropHeight) / 2;

        // Очищаем canvas (заполняем белым для больших размеров)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Копируем центральную область исходного изображения
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          cropWidth,
          cropHeight,
          destX,
          destY,
          cropWidth,
          cropHeight,
        );

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for crop'));
      img.src = dataUrl;
    });
  }

  /**
   * Применить настройки яркости и контрастности
   */
  async applyBrightnessContrast(
    dataUrl: string,
    brightness: number,
    contrast: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const brightnessFactor = brightness;
        const contrastFactor = (contrast + 100) / 100;

        // Применяем яркость и контрастность к каждому пикселю
        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            // RGB каналы (пропускаем альфа-канал)
            let value = data[i + j];
            value = (value - 128) * contrastFactor + 128;
            value += brightnessFactor;
            data[i + j] = Math.max(0, Math.min(255, value));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for brightness/contrast'));
      img.src = dataUrl;
    });
  }

  /**
   * Применить предустановленный фильтр
   */
  async applyFilter(dataUrl: string, filter: ImageFilterType): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Применяем CSS фильтры через canvas context
        switch (filter) {
          case 'grayscale':
            ctx.filter = 'grayscale(100%)';
            break;
          case 'sepia':
            ctx.filter = 'sepia(100%)';
            break;
          case 'vintage':
            ctx.filter = 'sepia(50%) contrast(1.2) brightness(0.9)';
            break;
          case 'cold':
            ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.3) hue-rotate(180deg)';
            break;
          case 'warm':
            ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.3) hue-rotate(20deg)';
            break;
          default:
            ctx.filter = 'none';
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for filter'));
      img.src = dataUrl;
    });
  }

  /**
   * Применить комплексные фильтры с настройками
   */
  async applyAdvancedFilters(
    dataUrl: string,
    filters: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hueRotate?: number;
      blur?: number;
      grayscale?: number;
      sepia?: number;
      invert?: number;
    },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Строим строку CSS фильтров
        const filterParts: string[] = [];

        if (filters.brightness !== undefined && filters.brightness !== 0) {
          filterParts.push(`brightness(${(100 + filters.brightness) / 100})`);
        }

        if (filters.contrast !== undefined && filters.contrast !== 0) {
          filterParts.push(`contrast(${(100 + filters.contrast) / 100})`);
        }

        if (filters.saturation !== undefined && filters.saturation !== 0) {
          filterParts.push(`saturate(${(100 + filters.saturation) / 100})`);
        }

        if (filters.hueRotate !== undefined && filters.hueRotate !== 0) {
          filterParts.push(`hue-rotate(${filters.hueRotate}deg)`);
        }

        if (filters.blur !== undefined && filters.blur > 0) {
          filterParts.push(`blur(${filters.blur}px)`);
        }

        if (filters.grayscale !== undefined && filters.grayscale > 0) {
          filterParts.push(`grayscale(${filters.grayscale}%)`);
        }

        if (filters.sepia !== undefined && filters.sepia > 0) {
          filterParts.push(`sepia(${filters.sepia}%)`);
        }

        if (filters.invert !== undefined && filters.invert > 0) {
          filterParts.push(`invert(${filters.invert}%)`);
        }

        ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image for advanced filters'));
      img.src = dataUrl;
    });
  }

  /**
   * Создать HTMLImageElement из Data URL
   */
  async createImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  /**
   * Получить формат изображения из Data URL
   */
  getImageFormatFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/^data:image\/([^;]+)/);
    return match ? match[1] : 'png';
  }

  /**
   * Вычислить размер Data URL в байтах (приблизительно)
   */
  calculateDataUrlSize(dataUrl: string): number {
    // Убираем заголовок data:image/...;base64,
    const base64Data = dataUrl.split(',')[1] || '';

    // Каждый символ Base64 представляет 6 бит данных
    // Но нужно учесть padding (=)
    const padding = (base64Data.match(/=/g) || []).length;
    const sizeInBits = base64Data.length * 6 - padding * 2;

    return Math.round(sizeInBits / 8);
  }

  /**
   * Валидация параметров обрезки
   */
  validateCropParams(width: number, height: number): { valid: boolean; error?: string } {
    if (width < 1 || width > 4000) {
      return { valid: false, error: 'Ширина должна быть от 1 до 4000 пикселей' };
    }

    if (height < 1 || height > 4000) {
      return { valid: false, error: 'Высота должна быть от 1 до 4000 пикселей' };
    }

    return { valid: true };
  }

  /**
   * Валидация параметров поворота
   */
  validateRotationAngle(angle: number): { valid: boolean; error?: string } {
    const validAngles = [90, 180, 270, -90, -180, -270];
    if (!validAngles.includes(angle)) {
      return { valid: false, error: 'Допустимые углы поворота: 90, 180, 270 градусов' };
    }

    return { valid: true };
  }

  /**
   * Нормализовать угол поворота к положительному значению
   */
  normalizeRotationAngle(angle: number): number {
    const normalized = ((angle % 360) + 360) % 360;
    return normalized;
  }
}
