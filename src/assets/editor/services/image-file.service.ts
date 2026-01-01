import { Injectable } from '@angular/core';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

export interface ImageExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality?: number; // Только для JPEG и WebP (0.0-1.0)
  fileName?: string;
}

export interface ImageLoadResult {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  format: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageFileService {
  // Максимальные ограничения
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_IMAGE_DIMENSION = 8000; // 8000px
  private readonly SUPPORTED_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
  ];

  constructor() {}

  // ═══════════════════════════════════════════════════════════════
  // Валидация файлов
  // ═══════════════════════════════════════════════════════════════

  /**
   * Валидация изображения из File объекта
   */
  async validateImageFile(file: File): Promise<FileValidationResult> {
    // Проверка типа файла
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Неподдерживаемый формат. Поддерживаются: ${this.getSupportedFormatsText()}`,
      };
    }

    // Проверка размера файла
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Файл слишком большой. Максимальный размер: ${this.formatFileSize(
          this.MAX_FILE_SIZE,
        )}`,
      };
    }

    try {
      // Проверка размеров изображения
      const dimensions = await this.getImageDimensionsFromFile(file);

      if (
        dimensions.width > this.MAX_IMAGE_DIMENSION ||
        dimensions.height > this.MAX_IMAGE_DIMENSION
      ) {
        return {
          valid: false,
          error: `Изображение слишком большое. Максимальные размеры: ${this.MAX_IMAGE_DIMENSION}x${this.MAX_IMAGE_DIMENSION}px`,
        };
      }

      return {
        valid: true,
        fileSize: file.size,
        dimensions: dimensions,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Не удалось обработать изображение. Файл может быть поврежден.',
      };
    }
  }

  /**
   * Валидация URL изображения
   */
  validateImageUrl(url: string): { valid: boolean; error?: string } {
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Некорректный URL' };
    }

    // Проверка расширения файла в URL
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const urlLower = url.toLowerCase();
    const hasValidExtension = supportedExtensions.some(
      (ext) => urlLower.includes(`.${ext}`) || urlLower.includes(`format=${ext}`),
    );

    if (!hasValidExtension) {
      console.warn('⚠️ URL может не содержать изображение, но попробуем загрузить');
    }

    return { valid: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // Загрузка изображений
  // ═══════════════════════════════════════════════════════════════

  /**
   * Загрузить изображение из File объекта
   */
  async loadImageFromFile(file: File): Promise<ImageLoadResult> {
    // Валидация
    const validation = await this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Конвертация в Data URL
    const dataUrl = await this.fileToDataUrl(file);

    // Получение размеров
    const dimensions = await this.getImageDimensionsFromDataUrl(dataUrl);

    return {
      dataUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      width: dimensions.width,
      height: dimensions.height,
      format: this.getFormatFromMimeType(file.type),
    };
  }

  /**
   * Загрузить изображение по URL
   */
  async loadImageFromUrl(url: string): Promise<ImageLoadResult> {
    // Валидация URL
    const validation = this.validateImageUrl(url);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Загрузить изображение
      const img = await this.createImageElementFromUrl(url);

      // Конвертировать в Data URL
      const dataUrl = await this.imageElementToDataUrl(img);

      // Получить размеры
      const dimensions = { width: img.width, height: img.height };

      return {
        dataUrl: dataUrl,
        fileName: this.extractFileNameFromUrl(url),
        fileSize: 0, // Неизвестно для URL
        width: dimensions.width,
        height: dimensions.height,
        format: 'png', // По умолчанию после конвертации
      };
    } catch (error) {
      throw new Error(`Не удалось загрузить изображение по URL: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Сохранение и экспорт
  // ═══════════════════════════════════════════════════════════════

  /**
   * Экспортировать изображение с указанными параметрами
   */
  async exportImage(dataUrl: string, options: ImageExportOptions): Promise<string> {
    const img = await this.createImageElementFromDataUrl(dataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Для JPEG формата нужен белый фон
    if (options.format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    // Экспорт в нужном формате
    const mimeType = this.getMimeTypeFromFormat(options.format);
    const quality = options.quality || 0.9;

    return canvas.toDataURL(mimeType, quality);
  }

  /**
   * Скачать изображение как файл
   */
  downloadImage(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Скопировать изображение в буфер обмена
   */
  async copyImageToClipboard(dataUrl: string): Promise<void> {
    try {
      // Конвертируем Data URL в Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Копируем в буфер обмена
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch (error) {
      throw new Error('Не удалось скопировать в буфер обмена');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Утилитарные методы для работы с изображениями
  // ═══════════════════════════════════════════════════════════════

  /**
   * Конвертировать File в Data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Создать Image элемент из Data URL
   */
  private createImageElementFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image from Data URL'));
      img.src = dataUrl;
    });
  }

  /**
   * Создать Image элемент из URL
   */
  private createImageElementFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image from URL'));
      img.src = url;
    });
  }

  /**
   * Конвертировать Image элемент в Data URL
   */
  private imageElementToDataUrl(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    });
  }

  /**
   * Получить размеры изображения из File
   */
  private getImageDimensionsFromFile(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Получить размеры изображения из Data URL
   */
  getImageDimensionsFromDataUrl(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Форматирование и конвертация
  // ═══════════════════════════════════════════════════════════════

  /**
   * Форматировать размер файла в читаемый вид
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Получить читаемое название формата
   */
  getFormatDisplayName(format: string): string {
    const formatNames: Record<string, string> = {
      png: 'PNG',
      jpg: 'JPEG',
      jpeg: 'JPEG',
      gif: 'GIF',
      webp: 'WebP',
      bmp: 'BMP',
      svg: 'SVG',
    };

    return formatNames[format.toLowerCase()] || format.toUpperCase();
  }

  /**
   * Получить MIME тип из формата
   */
  private getMimeTypeFromFormat(format: string): string {
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp',
      bmp: 'image/bmp',
      gif: 'image/gif',
    };

    return mimeTypes[format.toLowerCase()] || 'image/png';
  }

  /**
   * Получить формат из MIME типа
   */
  private getFormatFromMimeType(mimeType: string): string {
    const formats: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpeg',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };

    return formats[mimeType.toLowerCase()] || 'png';
  }

  /**
   * Извлечь имя файла из URL
   */
  private extractFileNameFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const fileName = pathname.split('/').pop() || 'image.png';
      return fileName;
    } catch {
      return 'image.png';
    }
  }

  /**
   * Получить список поддерживаемых форматов как строку
   */
  private getSupportedFormatsText(): string {
    return this.SUPPORTED_FORMATS.map((mime) => mime.replace('image/', '').toUpperCase()).join(
      ', ',
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Публичные геттеры для ограничений
  // ═══════════════════════════════════════════════════════════════

  /**
   * Получить максимальный размер файла
   */
  getMaxFileSize(): number {
    return this.MAX_FILE_SIZE;
  }

  /**
   * Получить максимальные размеры изображения
   */
  getMaxImageDimension(): number {
    return this.MAX_IMAGE_DIMENSION;
  }

  /**
   * Получить список поддерживаемых MIME типов
   */
  getSupportedFormats(): string[] {
    return [...this.SUPPORTED_FORMATS];
  }

  /**
   * Проверить, поддерживается ли формат
   */
  isFormatSupported(mimeType: string): boolean {
    return this.SUPPORTED_FORMATS.includes(mimeType.toLowerCase());
  }
}
