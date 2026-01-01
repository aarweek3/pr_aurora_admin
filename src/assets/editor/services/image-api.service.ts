import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Модели Request/Response для API загрузки изображений
 */
export interface ImageUploadRequest {
  fileName: string;
  fileFormat: string;
  base64Data: string;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  relativePath: string;
  fileSize: number;
}

export interface ImageValidationRequest {
  base64Data: string;
  fileFormat: string;
}

export interface ImageValidationResponse {
  isValid: boolean;
  message: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export interface ImageMetadataRequest {
  base64Data: string;
}

export interface ImageMetadataResponse {
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: string;
  isAnimated: boolean;
  durationMs: number;
}

export interface ConfigResponse {
  maxFileSizeBytes: number;
  supportedFormats: string[];
  uploadBaseUrl: string;
  cropConfig: {
    predefinedSizes: Array<{
      name: string;
      width: number;
      height: number;
    }>;
  };
  compressionConfig: {
    enabled: boolean;
    quality: number;
  };
}

export interface ApiError {
  message: string;
  errors?: string[];
}

/**
 * Сервис для взаимодействия с EditorImageUploadController
 * Эндпоинт: /api/editor/images
 */
@Injectable({
  providedIn: 'root'
})
export class ImageApiService {
  private readonly apiUrl = `${environment.apiUrl}/api/editor/images`;

  constructor(private http: HttpClient) {}

  /**
   * Загружает изображение на сервер
   * POST /api/editor/images/upload
   */
  uploadImage(request: ImageUploadRequest): Observable<ImageUploadResponse> {
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Валидирует изображение перед загрузкой
   * POST /api/editor/images/validate
   */
  validateImage(request: ImageValidationRequest): Observable<ImageValidationResponse> {
    return this.http.post<ImageValidationResponse>(`${this.apiUrl}/validate`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получает метаданные изображения
   * POST /api/editor/images/metadata
   */
  getImageMetadata(request: ImageMetadataRequest): Observable<ImageMetadataResponse> {
    return this.http.post<ImageMetadataResponse>(`${this.apiUrl}/metadata`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получает конфигурацию сервера
   * GET /api/editor/images/config
   */
  getConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.apiUrl}/config`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получает список поддерживаемых форматов
   * GET /api/editor/images/supported-formats
   */
  getSupportedFormats(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/supported-formats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Проверяет здоровье API
   * GET /api/editor/images/health
   */
  checkHealth(): Observable<{ status: string; timestamp: string; apiVersion: string }> {
    return this.http.get<{ status: string; timestamp: string; apiVersion: string }>(`${this.apiUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Удаляет изображение с сервера
   * DELETE /api/editor/images/{filename}
   */
  deleteImage(filename: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${encodeURIComponent(filename)}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Очищает старые изображения
   * POST /api/editor/images/cleanup
   */
  cleanupOldImages(daysOld: number): Observable<{
    deletedCount: number;
    freedSpaceBytes: number;
    message: string;
  }> {
    return this.http.post<{
      deletedCount: number;
      freedSpaceBytes: number;
      message: string;
    }>(`${this.apiUrl}/cleanup`, { daysOld }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Обрабатывает ошибки HTTP запросов
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Неизвестная ошибка сервера';

    if (error.error instanceof ErrorEvent) {
      // Ошибка на стороне клиента или сети
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // Ошибка на стороне сервера
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Нет соединения с сервером';
      } else if (error.status === 400) {
        errorMessage = 'Неверный запрос';
      } else if (error.status === 404) {
        errorMessage = 'Ресурс не найден';
      } else if (error.status === 500) {
        errorMessage = 'Внутренняя ошибка сервера';
      } else {
        errorMessage = `Ошибка сервера: ${error.status}`;
      }
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Вспомогательные методы
   */

  /**
   * Конвертирует File в Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Ошибка чтения файла'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Извлекает чистые base64 данные из data URL
   */
  extractBase64Data(dataUrl: string): string {
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : dataUrl;
  }

  /**
   * Определяет MIME тип из data URL
   */
  getMimeTypeFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/^data:([^;]+);/);
    return match ? match[1] : 'image/jpeg';
  }

  /**
   * Конвертирует формат в расширение файла
   */
  formatToExtension(format: 'jpg' | 'png' | 'webp'): string {
    const map: Record<string, string> = {
      jpg: 'jpg',
      png: 'png',
      webp: 'webp'
    };
    return map[format] || 'jpg';
  }

  /**
   * Конвертирует формат в MIME тип
   */
  formatToMimeType(format: 'jpg' | 'png' | 'webp'): string {
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    };
    return map[format] || 'image/jpeg';
  }
}
