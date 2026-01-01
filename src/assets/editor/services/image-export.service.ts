import { Injectable } from '@angular/core';
import { ImageApiService } from './image-api.service';
import { firstValueFrom } from 'rxjs';

export interface ExportImageConfig {
  fileName: string;
  format: 'jpg' | 'png' | 'webp';
  quality: number; // 0-100
  imageData: string; // base64 data URL
  width: number;
  height: number;
}

export interface ExportImageResult {
  fileName: string;
  format: string;
  quality: number;
  width: number;
  height: number;
  estimatedSize: number; // в байтах
  blob: Blob;
  dataUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageExportService {
  constructor(private imageApiService: ImageApiService) {}

  /**
   * Конвертирует изображение в нужный формат с заданным качеством
   */
  async convertImage(config: ExportImageConfig): Promise<ExportImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Создаем canvas
          const canvas = document.createElement('canvas');
          canvas.width = config.width;
          canvas.height = config.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Рисуем изображение
          ctx.drawImage(img, 0, 0, config.width, config.height);

          // Конвертируем в нужный формат
          const mimeType = this.getMimeType(config.format);
          const quality = config.quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Создаем data URL для предпросмотра
              const dataUrl = canvas.toDataURL(mimeType, quality);

              const result: ExportImageResult = {
                fileName: this.ensureFileExtension(config.fileName, config.format),
                format: config.format,
                quality: config.quality,
                width: config.width,
                height: config.height,
                estimatedSize: blob.size,
                blob: blob,
                dataUrl: dataUrl,
              };

              resolve(result);
            },
            mimeType,
            quality,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = config.imageData;
    });
  }

  /**
   * Получить MIME тип по формату
   */
  private getMimeType(format: 'jpg' | 'png' | 'webp'): string {
    const mimeTypes = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    return mimeTypes[format];
  }

  /**
   * Добавить расширение к имени файла если его нет
   */
  private ensureFileExtension(fileName: string, format: string): string {
    const extension = `.${format}`;
    if (!fileName.toLowerCase().endsWith(extension)) {
      // Удаляем старое расширение если есть
      const withoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      return `${withoutExt}${extension}`;
    }
    return fileName;
  }

  /**
   * Форматировать размер файла в человекочитаемый вид
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`;
    return `~${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Генерировать имя файла по умолчанию
   */
  generateDefaultFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `edited-image-${year}-${month}-${day}-${hours}${minutes}${seconds}`;
  }

  /**
   * Отправить файл на сервер
   */
  async uploadToServer(result: ExportImageResult): Promise<{
    success: boolean;
    imageUrl: string;
    relativePath: string;
    fileSize: number;
  }> {
    try {
      // Конвертируем dataUrl в формат, который ожидает сервер
      const base64Data = result.dataUrl;

      // Формируем запрос в формате, который ожидает EditorImageUploadController
      const uploadRequest = {
        fileName: result.fileName,
        fileFormat: result.format,
        base64Data: base64Data
      };

      console.log('📤 Отправка файла на сервер:', {
        fileName: result.fileName,
        format: result.format,
        quality: `${result.quality}%`,
        size: `${result.width} × ${result.height} px`,
        fileSize: this.formatFileSize(result.estimatedSize),
      });

      // Отправляем на сервер через ImageApiService
      const response = await firstValueFrom(
        this.imageApiService.uploadImage(uploadRequest)
      );

      console.log('✅ Файл успешно загружен на сервер:', response);

      return response;
    } catch (error) {
      console.error('❌ Ошибка загрузки на сервер:', error);
      throw error;
    }
  }
}
