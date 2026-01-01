import { Injectable, signal } from '@angular/core';

export type ImageOperationType =
  | 'load'
  | 'rotate'
  | 'flip'
  | 'crop'
  | 'frame'
  | 'brightness-contrast'
  | 'filter'
  | 'advanced-filters'
  | 'watermark';

export interface ImageOperation {
  id: string;
  type: ImageOperationType;
  params: any;
  timestamp: number;
  resultDataUrl: string;
}

export interface ImageMetadata {
  // Обязательные поля
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  format: string;
  source: 'file' | 'url' | 'unsplash';

  // Опциональные поля (оригинальные размеры)
  originalWidth?: number;
  originalHeight?: number;
  originalFileSize?: number;
  sourceUrl?: string;

  // Атрибуты для вставки в редактор
  alt: string;
  title: string;
  caption: string;
  clickable: boolean;
  openInNewWindow: boolean;
}

export interface ImageData {
  original: string; // Оригинальный Data URL
  current: string; // Текущий Data URL (после операций)
  metadata: ImageMetadata;
  history: ImageOperation[];
  historyIndex: number; // Индекс текущей операции в истории
}

export interface ImageDimensions {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageHistoryService {
  // Реактивные сигналы для состояния
  imageData = signal<ImageData | null>(null);

  constructor() {}

  /**
   * Загрузить изображение и создать начальную запись в истории
   */
  async loadImageData(dataUrl: string, metadata: Partial<ImageMetadata>): Promise<void> {
    // Создать временный Image для получения размеров
    const tempImg = await this.createImageElement(dataUrl);

    // Определить формат из Data URL
    const format = this.getImageFormatFromDataUrl(dataUrl);

    // Создать полные метаданные
    const fullMetadata: ImageMetadata = {
      // Обязательные поля
      fileName: metadata.fileName || 'image.png',
      fileSize: metadata.fileSize || this.calculateDataUrlSize(dataUrl),
      width: tempImg.width,
      height: tempImg.height,
      format: format,
      source: metadata.source || 'file',

      // Опциональные поля
      sourceUrl: metadata.sourceUrl,

      // Атрибуты для вставки (значения по умолчанию)
      alt: metadata.alt || '',
      title: metadata.title || '',
      caption: metadata.caption || '',
      clickable: metadata.clickable ?? false,
      openInNewWindow: metadata.openInNewWindow ?? false,
    };

    // Создать начальную операцию загрузки
    const loadOperation: ImageOperation = {
      id: this.generateOperationId(),
      type: 'load',
      params: { source: fullMetadata.source },
      timestamp: Date.now(),
      resultDataUrl: dataUrl,
    };

    // Сохранить в imageData
    const newImageData: ImageData = {
      original: dataUrl,
      current: dataUrl,
      metadata: fullMetadata,
      history: [loadOperation],
      historyIndex: 0,
    };

    this.imageData.set(newImageData);

    console.log('✅ Image data loaded:', {
      width: tempImg.width,
      height: tempImg.height,
      metadata: fullMetadata,
    });
  }

  /**
   * Применить операцию к изображению и добавить в историю
   */
  async applyOperation(
    type: ImageOperationType,
    params: any,
    processor: (dataUrl: string) => Promise<string>,
  ): Promise<void> {
    const currentImageData = this.imageData();
    if (!currentImageData?.current) {
      throw new Error('No image loaded');
    }

    // Применить операцию
    const resultDataUrl = await processor(currentImageData.current);

    // Создать операцию
    const operation: ImageOperation = {
      id: this.generateOperationId(),
      type,
      params,
      timestamp: Date.now(),
      resultDataUrl,
    };

    // Создать обновленную копию imageData
    const updatedHistory = [...currentImageData.history];
    let updatedHistoryIndex = currentImageData.historyIndex;

    // Если мы не в конце истории (был Undo), удаляем "будущие" операции
    if (updatedHistoryIndex < updatedHistory.length - 1) {
      updatedHistory.splice(updatedHistoryIndex + 1);
    }

    // Добавить операцию в историю
    updatedHistory.push(operation);
    updatedHistoryIndex++;

    // Обновить метаданные после операции
    const updatedMetadata = { ...currentImageData.metadata };
    if (updatedMetadata) {
      const tempImg = await this.createImageElement(resultDataUrl);

      // Сохранить оригинальные размеры при первой операции (если еще не сохранены)
      if (!updatedMetadata.originalWidth && !updatedMetadata.originalHeight) {
        updatedMetadata.originalWidth = updatedMetadata.width;
        updatedMetadata.originalHeight = updatedMetadata.height;
        updatedMetadata.originalFileSize = updatedMetadata.fileSize;
      }

      // Обновить текущие размеры
      updatedMetadata.width = tempImg.width;
      updatedMetadata.height = tempImg.height;

      // Обновить формат и размер файла
      updatedMetadata.format = this.getImageFormatFromDataUrl(resultDataUrl);
      updatedMetadata.fileSize = this.calculateDataUrlSize(resultDataUrl);
    }

    // Обновить состояние
    const updatedImageData: ImageData = {
      ...currentImageData,
      current: resultDataUrl,
      metadata: updatedMetadata,
      history: updatedHistory,
      historyIndex: updatedHistoryIndex,
    };

    this.imageData.set(updatedImageData);

    console.log('✅ Operation applied:', {
      type,
      params,
      historyLength: updatedHistory.length,
      historyIndex: updatedHistoryIndex,
    });
  }

  /**
   * Отменить последнюю операцию (Undo)
   */
  async undo(): Promise<{ success: boolean; operation?: ImageOperation; message?: string }> {
    const currentImageData = this.imageData();
    if (!currentImageData || !this.canUndo()) {
      return { success: false, message: 'Cannot undo: at start of history' };
    }

    const newHistoryIndex = currentImageData.historyIndex - 1;
    const operation = currentImageData.history[newHistoryIndex];

    // Обновить метаданные размеров
    const updatedMetadata = { ...currentImageData.metadata };
    const tempImg = await this.createImageElement(operation.resultDataUrl);
    updatedMetadata.width = tempImg.width;
    updatedMetadata.height = tempImg.height;
    updatedMetadata.format = this.getImageFormatFromDataUrl(operation.resultDataUrl);
    updatedMetadata.fileSize = this.calculateDataUrlSize(operation.resultDataUrl);

    // Обновить состояние
    const updatedImageData: ImageData = {
      ...currentImageData,
      current: operation.resultDataUrl,
      metadata: updatedMetadata,
      historyIndex: newHistoryIndex,
    };

    this.imageData.set(updatedImageData);

    console.log('↶ Undo to:', {
      type: operation.type,
      historyIndex: newHistoryIndex,
    });

    return {
      success: true,
      operation,
      message: `Отменено: ${this.getOperationName(operation.type)}`,
    };
  }

  /**
   * Повторить отмененную операцию (Redo)
   */
  async redo(): Promise<{ success: boolean; operation?: ImageOperation; message?: string }> {
    const currentImageData = this.imageData();
    if (!currentImageData || !this.canRedo()) {
      return { success: false, message: 'Cannot redo: at end of history' };
    }

    const newHistoryIndex = currentImageData.historyIndex + 1;
    const operation = currentImageData.history[newHistoryIndex];

    // Обновить метаданные размеров
    const updatedMetadata = { ...currentImageData.metadata };
    const tempImg = await this.createImageElement(operation.resultDataUrl);
    updatedMetadata.width = tempImg.width;
    updatedMetadata.height = tempImg.height;
    updatedMetadata.format = this.getImageFormatFromDataUrl(operation.resultDataUrl);
    updatedMetadata.fileSize = this.calculateDataUrlSize(operation.resultDataUrl);

    // Обновить состояние
    const updatedImageData: ImageData = {
      ...currentImageData,
      current: operation.resultDataUrl,
      metadata: updatedMetadata,
      historyIndex: newHistoryIndex,
    };

    this.imageData.set(updatedImageData);

    console.log('↷ Redo to:', {
      type: operation.type,
      historyIndex: newHistoryIndex,
    });

    return {
      success: true,
      operation,
      message: `Повторено: ${this.getOperationName(operation.type)}`,
    };
  }

  /**
   * Сбросить к оригинальному изображению
   */
  async resetToOriginal(): Promise<{ success: boolean; message: string }> {
    const currentImageData = this.imageData();
    if (!currentImageData?.original) {
      return { success: false, message: 'No original image to reset to' };
    }

    // Обновить метаданные размеров через временный Image
    const updatedMetadata = { ...currentImageData.metadata };
    const tempImg = await this.createImageElement(currentImageData.original);
    updatedMetadata.width = tempImg.width;
    updatedMetadata.height = tempImg.height;
    updatedMetadata.format = this.getImageFormatFromDataUrl(currentImageData.original);
    updatedMetadata.fileSize = this.calculateDataUrlSize(currentImageData.original);

    // Сбросить к начальному состоянию
    const updatedImageData: ImageData = {
      ...currentImageData,
      current: currentImageData.original,
      metadata: updatedMetadata,
      history: [currentImageData.history[0]], // Оставить только операцию загрузки
      historyIndex: 0,
    };

    this.imageData.set(updatedImageData);

    return { success: true, message: 'Сброшено к оригиналу' };
  }

  /**
   * Можно ли выполнить Undo
   */
  canUndo(): boolean {
    const currentImageData = this.imageData();
    return currentImageData ? currentImageData.historyIndex > 0 : false;
  }

  /**
   * Можно ли выполнить Redo
   */
  canRedo(): boolean {
    const currentImageData = this.imageData();
    return currentImageData
      ? currentImageData.historyIndex < currentImageData.history.length - 1
      : false;
  }

  /**
   * Получить текущее изображение
   */
  getCurrentImage(): string | null {
    return this.imageData()?.current || null;
  }

  /**
   * Получить оригинальное изображение
   */
  getOriginalImage(): string | null {
    return this.imageData()?.original || null;
  }

  /**
   * Получить метаданные изображения
   */
  getImageMetadata(): ImageMetadata | null {
    return this.imageData()?.metadata || null;
  }

  /**
   * Получить историю операций
   */
  getHistory(): ImageOperation[] {
    return this.imageData()?.history || [];
  }

  /**
   * Получить текущий индекс истории
   */
  getHistoryIndex(): number {
    return this.imageData()?.historyIndex || 0;
  }

  /**
   * Получить информацию об изменении размера изображения
   */
  getImageSizeChangePercent(): number {
    const metadata = this.getImageMetadata();
    if (!metadata || !metadata.originalWidth || !metadata.originalHeight) {
      return 0;
    }

    const originalSize = metadata.originalWidth * metadata.originalHeight;
    const currentSize = metadata.width * metadata.height;

    return Math.round(((currentSize - originalSize) / originalSize) * 100);
  }

  /**
   * Получить информацию об изменении размера файла
   */
  getFileSizeChangePercent(): number {
    const metadata = this.getImageMetadata();
    if (!metadata || !metadata.originalFileSize) {
      return 0;
    }

    return Math.round(
      ((metadata.fileSize - metadata.originalFileSize) / metadata.originalFileSize) * 100,
    );
  }

  /**
   * Очистить историю и сбросить состояние
   */
  clear(): void {
    this.imageData.set(null);
  }

  /**
   * Обновить метаданные изображения (alt, title, caption и т.д.)
   */
  updateImageMetadata(updates: Partial<ImageMetadata>): void {
    const currentImageData = this.imageData();
    if (!currentImageData) return;

    const updatedMetadata = { ...currentImageData.metadata, ...updates };
    const updatedImageData: ImageData = {
      ...currentImageData,
      metadata: updatedMetadata,
    };

    this.imageData.set(updatedImageData);
  }

  // ═══════════════════════════════════════════════════════════════
  // Private Helper Methods
  // ═══════════════════════════════════════════════════════════════

  /**
   * Создать HTMLImageElement из Data URL
   */
  private async createImageElement(dataUrl: string): Promise<HTMLImageElement> {
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
  private getImageFormatFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/^data:image\/([^;]+)/);
    return match ? match[1] : 'png';
  }

  /**
   * Вычислить размер Data URL в байтах
   */
  private calculateDataUrlSize(dataUrl: string): number {
    const base64Data = dataUrl.split(',')[1] || '';
    const padding = (base64Data.match(/=/g) || []).length;
    const sizeInBits = base64Data.length * 6 - padding * 2;
    return Math.round(sizeInBits / 8);
  }

  /**
   * Генерировать уникальный ID операции
   */
  generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получить читаемое название операции
   */
  getOperationName(type: ImageOperationType): string {
    const names: Record<ImageOperationType, string> = {
      load: 'Загрузка',
      rotate: 'Поворот',
      flip: 'Отражение',
      crop: 'Обрезка',
      frame: 'Рамка',
      'brightness-contrast': 'Яркость/Контрастность',
      filter: 'Фильтр',
      'advanced-filters': 'Сложные фильтры',
      watermark: 'Водяной знак',
    };

    return names[type] || type;
  }
}
