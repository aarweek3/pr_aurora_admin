import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiEndpoints } from '../../../../../environments/api-endpoints';
import {
  DeleteImageResponse,
  ImageListResponse,
  ImageMetadata,
  LoadImageResponse,
  SaveImageRequest,
  SaveImageResponse,
} from '../models/image-modal.types';

/**
 * Сервис для работы с Advanced Image Processing API
 * Эндпоинт: /api/advanced-image
 *
 * Ответственность:
 * - HTTP коммуникация с сервером
 * - Retry логика (2 попытки)
 * - Обработка специфичных ошибок (413, 415)
 * - Валидация перед отправкой
 */
@Injectable({
  providedIn: 'root',
})
export class ImageModalService {
  constructor(private http: HttpClient) {}

  /**
   * Сохраняет изображение на сервере
   * POST /api/advanced-image/save
   *
   * @param dataUrl - Data URL изображения (base64 с префиксом)
   * @param metadata - Метаданные изображения (fileName, description)
   * @returns Observable с результатом сохранения
   */
  saveToServer(dataUrl: string, metadata: ImageMetadata): Observable<SaveImageResponse> {
    // Валидация перед отправкой
    const validationError = this.validateBeforeUpload(dataUrl, metadata.fileName);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const request: SaveImageRequest = {
      imageBase64: dataUrl, // Отправляем с префиксом data:image/...
      fileName: metadata.fileName,
      description: metadata.description,
    };

    return this.http.post<SaveImageResponse>(ApiEndpoints.ADVANCED_IMAGES.SAVE, request).pipe(
      // ✅ Retry логика: 2 повторные попытки с задержкой 1 секунда
      retry({
        count: 2,
        delay: 1000,
      }),
      catchError(this.handleError.bind(this)),
    );
  }

  /**
   * Загружает изображение с сервера
   * GET /api/advanced-image/load/{imageId}
   *
   * @param imageId - UUID изображения
   * @returns Observable с данными изображения
   */
  loadFromServer(imageId: string): Observable<LoadImageResponse> {
    return this.http
      .get<LoadImageResponse>(ApiEndpoints.ADVANCED_IMAGES.LOAD(imageId))
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Удаляет изображение с сервера
   * DELETE /api/advanced-image/delete/{imageId}
   *
   * @param imageId - UUID изображения
   * @returns Observable с результатом удаления
   */
  deleteFromServer(imageId: string): Observable<DeleteImageResponse> {
    return this.http
      .delete<DeleteImageResponse>(ApiEndpoints.ADVANCED_IMAGES.DELETE(imageId))
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Получает список всех изображений
   * GET /api/advanced-image/list
   *
   * @returns Observable со списком ID изображений
   */
  getImageList(): Observable<ImageListResponse> {
    return this.http
      .get<ImageListResponse>(ApiEndpoints.ADVANCED_IMAGES.LIST)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Валидация данных перед отправкой на сервер
   *
   * @param dataUrl - Data URL изображения
   * @param fileName - Имя файла
   * @returns Сообщение об ошибке или null если валидация пройдена
   */
  private validateBeforeUpload(dataUrl: string, fileName: string): string | null {
    // Проверка наличия данных
    if (!dataUrl || dataUrl.trim() === '') {
      return 'Изображение не может быть пустым';
    }

    if (!fileName || fileName.trim() === '') {
      return 'Имя файла обязательно';
    }

    // Проверка формата Data URL
    if (!dataUrl.startsWith('data:image/')) {
      return 'Неверный формат Data URL. Ожидается префикс data:image/';
    }

    // Проверка расширения файла
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const extension = this.getFileExtension(fileName);

    if (!extension || !allowedExtensions.includes(extension.toLowerCase())) {
      return `Неподдерживаемый формат файла. Разрешены: ${allowedExtensions.join(', ')}`;
    }

    // Проверка размера отключена - разрешаем файлы любого размера
    // const base64Data = this.extractBase64FromDataUrl(dataUrl);
    // const sizeBytes = this.estimateBase64Size(base64Data);
    // const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    // if (sizeBytes > maxSizeBytes) {
    //   const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    //   return `Изображение слишком большое (${sizeMB}MB). Максимум 5MB`;
    // }

    return null; // Валидация пройдена - размер не проверяется
  }

  /**
   * Обработчик ошибок HTTP запросов
   * Обрабатывает специфичные коды ошибок: 413, 415
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Неизвестная ошибка сервера';

    if (error.error instanceof ErrorEvent) {
      // ❌ Ошибка на стороне клиента или сети
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // ❌ Ошибка на стороне сервера
      switch (error.status) {
        case 0:
          errorMessage = 'Нет соединения с сервером';
          break;

        case 400:
          // Bad Request - ошибки валидации
          errorMessage = error.error?.message || 'Неверный запрос';
          break;

        case 413:
          // ✅ Payload Too Large - изображение слишком большое
          errorMessage = error.error?.message || 'Изображение слишком большое (макс 5MB)';
          break;

        case 415:
          // ✅ Unsupported Media Type - неподдерживаемый формат
          errorMessage = error.error?.message || 'Неподдерживаемый формат изображения';
          break;

        case 404:
          errorMessage = 'Изображение не найдено';
          break;

        case 500:
          errorMessage = 'Внутренняя ошибка сервера';
          break;

        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Ошибка сервера: ${error.status}`;
          }
      }
    }

    console.error('ImageModalService HTTP Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Извлекает чистые base64 данные из Data URL
   * Пример: "data:image/png;base64,iVBORw0KG..." → "iVBORw0KG..."
   */
  private extractBase64FromDataUrl(dataUrl: string): string {
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : dataUrl;
  }

  /**
   * Приблизительно оценивает размер файла по Base64 строке
   * Base64 увеличивает размер на ~33%, учитываем это при декодировании
   */
  private estimateBase64Size(base64: string): number {
    // Удаляем padding символы
    const paddingChars = (base64.match(/=/g) || []).length;
    // Формула: (длина_base64 * 3/4) - padding
    return (base64.length * 3) / 4 - paddingChars;
  }

  /**
   * Получает расширение файла из имени
   * Пример: "photo.png" → ".png"
   */
  private getFileExtension(fileName: string): string | null {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return null;
    }
    return fileName.substring(lastDotIndex);
  }

  /**
   * Определяет MIME тип из Data URL
   * Пример: "data:image/png;base64,..." → "image/png"
   */
  getMimeTypeFromDataUrl(dataUrl: string): string {
    const match = dataUrl.match(/^data:([^;]+);/);
    return match ? match[1] : 'image/jpeg';
  }

  /**
   * Конвертирует File в Data URL (base64)
   */
  fileToDataUrl(file: File): Promise<string> {
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
}
