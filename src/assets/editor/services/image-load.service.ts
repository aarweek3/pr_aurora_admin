import { ElementRef, Injectable } from '@angular/core';
import { ToastNotificationComponent } from '../components/toast-notification/toast-notification.component';
import { AuroraImageService } from './aurora-image.service';
import { ImageFileService } from './image-file.service';
import { ImageHistoryService } from './image-history.service';
import { ImageProcessingService } from './image-processing.service';

/**
 * Результат загрузки изображения
 */
export interface LoadResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    width: number;
    height: number;
    format: string;
    source: 'file' | 'url';
    sourceUrl?: string;
    alt?: string;
    title?: string;
    caption?: string;
  };
}

/**
 * Результат валидации файла или URL
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Параметры для загрузки изображения
 */
export interface LoadImageParams {
  dataUrl: string;
  metadata: {
    fileName: string;
    fileSize: number;
    source: 'file' | 'url';
    sourceUrl?: string;
    alt?: string;
    title?: string;
    caption?: string;
  };
}

/**
 * Сервис для загрузки изображений из различных источников
 * Инкапсулирует логику файлов, URL, drag&drop, валидации и canvas отрисовки
 */
@Injectable({
  providedIn: 'root',
})
export class ImageLoadService {
  constructor(
    private imageService: AuroraImageService,
    private imageFileService: ImageFileService,
    private imageHistoryService: ImageHistoryService,
    private imageProcessingService: ImageProcessingService,
  ) {}

  /**
   * Валидация файла
   */
  validateFile(file: File): ValidationResult {
    return this.imageService.validateFile(file);
  }

  /**
   * Валидация URL
   */
  validateUrl(url: string): ValidationResult {
    return this.imageService.validateUrl(url);
  }

  /**
   * Преобразовать File в Base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Обработать выбранный файл (из input или drag&drop)
   */
  async processSelectedFile(file: File, source: 'file' = 'file'): Promise<LoadResult> {
    // Валидация
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Неверный файл',
      };
    }

    try {
      // Преобразование в Base64
      const base64 = await this.fileToBase64(file);

      // Создание метаданных
      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        source,
        alt: '',
        title: file.name,
        caption: '',
      };

      return {
        success: true,
        dataUrl: base64,
        metadata: {
          ...metadata,
          width: 0, // Будет заполнено в loadImageData
          height: 0, // Будет заполнено в loadImageData
          format: '', // Будет заполнено в loadImageData
        },
      };
    } catch (error) {
      console.error('File processing failed:', error);
      return {
        success: false,
        error: 'Ошибка при чтении файла',
      };
    }
  }

  /**
   * Загрузить изображение по URL
   */
  async loadFromUrl(imageUrl: string): Promise<LoadResult> {
    if (!imageUrl.trim()) {
      return {
        success: false,
        error: 'Введите URL изображения',
      };
    }

    // Валидация
    const validation = this.validateUrl(imageUrl);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Неверный URL',
      };
    }

    try {
      // Загрузка через ImageFileService
      const imageResult = await this.imageFileService.loadImageFromUrl(imageUrl);

      // Создание метаданных
      const metadata = {
        fileName: imageResult.fileName,
        fileSize: imageResult.fileSize,
        source: 'url' as const,
        sourceUrl: imageUrl,
        alt: '',
        title: '',
        caption: '',
      };

      return {
        success: true,
        dataUrl: imageResult.dataUrl,
        metadata: {
          ...metadata,
          width: 0, // Будет заполнено в loadImageData
          height: 0, // Будет заполнено в loadImageData
          format: '', // Будет заполнено в loadImageData
        },
      };
    } catch (error) {
      console.error('URL loading failed:', error);
      return {
        success: false,
        error: 'Не удалось загрузить изображение',
      };
    }
  }

  /**
   * Обработать событие выбора файла из input
   */
  async handleFileInputChange(event: Event): Promise<LoadResult> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return {
        success: false,
        error: 'Файл не выбран',
      };
    }

    return this.processSelectedFile(input.files[0], 'file');
  }

  /**
   * Обработать событие drop
   */
  async handleDrop(event: DragEvent): Promise<LoadResult> {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'Файлы не найдены',
      };
    }

    return this.processSelectedFile(files[0], 'file');
  }

  /**
   * Загрузить изображение в систему imageData
   * Создаёт временный Image для получения размеров и сохраняет через ImageHistoryService
   */
  async loadImageData(params: LoadImageParams): Promise<LoadResult> {
    const { dataUrl, metadata } = params;

    try {
      // Создать временный Image для получения размеров
      const tempImg = await this.createImageElement(dataUrl);

      // Определить формат из Data URL
      const format = this.getImageFormatFromDataUrl(dataUrl);

      // Создать полные метаданные
      const fullMetadata = {
        // Обязательные поля
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        width: tempImg.width,
        height: tempImg.height,
        format: format,
        source: metadata.source,

        // Опциональные поля
        sourceUrl: metadata.sourceUrl,

        // Атрибуты для вставки (значения по умолчанию)
        alt: metadata.alt || '',
        title: metadata.title || '',
        caption: metadata.caption || '',
        clickable: false,
        openInNewWindow: false,
      };

      // Сохранить в imageData через сервис
      await this.imageHistoryService.loadImageData(dataUrl, fullMetadata);

      console.log('✅ Image data loaded via ImageLoadService:', {
        width: tempImg.width,
        height: tempImg.height,
        metadata: fullMetadata,
      });

      return {
        success: true,
        dataUrl,
        metadata: {
          fileName: fullMetadata.fileName,
          fileSize: fullMetadata.fileSize,
          width: fullMetadata.width,
          height: fullMetadata.height,
          format: fullMetadata.format,
          source: fullMetadata.source,
          sourceUrl: fullMetadata.sourceUrl,
          alt: fullMetadata.alt,
          title: fullMetadata.title,
          caption: fullMetadata.caption,
        },
      };
    } catch (error) {
      console.error('Failed to load image data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Отрисовать изображение на upload canvas
   * Масштабирует изображение под размер контейнера с сохранением пропорций
   */
  async drawImageOnCanvas(
    imageDataUrl: string,
    canvas: ElementRef<HTMLCanvasElement>,
    containerRef?: ElementRef<HTMLElement>,
  ): Promise<boolean> {
    if (!canvas?.nativeElement) {
      console.warn('Canvas element not available');
      return false;
    }

    try {
      // Создать Image элемент
      const img = await this.createImageElement(imageDataUrl);
      const canvasElement = canvas.nativeElement;

      // Получить размеры контейнера (если указан) или использовать размеры canvas
      let containerWidth = canvasElement.width;
      let containerHeight = canvasElement.height;

      if (containerRef?.nativeElement) {
        containerWidth = containerRef.nativeElement.clientWidth;
        containerHeight = containerRef.nativeElement.clientHeight;
      }

      // Вычислить размеры для fit-inside
      const { width: drawWidth, height: drawHeight } = this.calculateFitInsideDimensions(
        img.width,
        img.height,
        containerWidth,
        containerHeight,
      );

      // Установить размеры canvas
      canvasElement.width = drawWidth;
      canvasElement.height = drawHeight;

      // Отрисовать изображение
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawWidth, drawHeight);
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

        console.log('🎨 Image drawn on canvas:', {
          original: { width: img.width, height: img.height },
          container: { width: containerWidth, height: containerHeight },
          canvas: { width: drawWidth, height: drawHeight },
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to draw image on canvas:', error);
      return false;
    }
  }

  /**
   * Открыть диалог выбора файла
   */
  openFileDialog(fileInput: ElementRef<HTMLInputElement>): void {
    fileInput?.nativeElement?.click();
  }

  /**
   * Создать HTMLImageElement из Data URL
   */
  private async createImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return this.imageProcessingService.createImageElement(dataUrl);
  }

  /**
   * Определить формат изображения из Data URL
   */
  private getImageFormatFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/data:image\/([^;]+)/);
    if (match) {
      return `image/${match[1]}`;
    }
    return 'image/png'; // Default fallback
  }

  /**
   * Вычислить размеры для fit-inside (вписывание в контейнер с сохранением пропорций)
   */
  private calculateFitInsideDimensions(
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number,
  ): { width: number; height: number } {
    const imageAspect = imageWidth / imageHeight;
    const containerAspect = containerWidth / containerHeight;

    let width: number;
    let height: number;

    if (imageAspect > containerAspect) {
      // Изображение шире контейнера - ограничиваем по ширине
      width = containerWidth;
      height = width / imageAspect;
    } else {
      // Изображение выше контейнера - ограничиваем по высоте
      height = containerHeight;
      width = height * imageAspect;
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    };
  }

  /**
   * Показать сообщение об успехе
   */
  showSuccessMessage(message: string): void {
    ToastNotificationComponent.show({
      type: 'success',
      message,
    });
  }

  /**
   * Показать сообщение об ошибке
   */
  showErrorMessage(message: string): void {
    ToastNotificationComponent.show({
      type: 'error',
      message,
    });
  }
}
