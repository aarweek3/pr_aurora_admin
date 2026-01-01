import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ImageConfig,
  ImageMetadata,
  ImageUploadConfig,
  ImageUploadRequest,
  ImageUploadResponse,
  ImageUploadResult,
  ValidationResult,
} from '../interfaces/image.interfaces';

/**
 * Aurora Image Service
 * Сервис для работы с изображениями в Aurora Editor
 */
@Injectable({
  providedIn: 'root',
})
export class AuroraImageService {
  private apiUrl = 'https://localhost:7233/api/editor/images';

  // Настройки валидации по умолчанию
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private http: HttpClient) {}

  /**
   * Загружает изображение на сервер
   */
  uploadImage(config: ImageConfig): Observable<ImageUploadResult> {
    // Преобразуем конфигурацию в запрос
    return new Observable((observer) => {
      if (config.source === 'url' && config.url) {
        // Загрузка по URL
        this.uploadFromUrl(config.url).subscribe({
          next: (result) => observer.next(result),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      } else if (config.file) {
        // Загрузка файла
        this.fileToBase64(config.file)
          .then((base64) => {
            const request: ImageUploadRequest = {
              base64Data: base64,
              fileName: config.file!.name,
              fileFormat: config.file!.type,
            };

            this.uploadToServer(request).subscribe({
              next: (result) => observer.next(result),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
          })
          .catch((err) => observer.error(err));
      } else if (config.base64) {
        // Загрузка base64
        const request: ImageUploadRequest = {
          base64Data: config.base64,
          fileName: 'image.png',
          fileFormat: 'image/png',
        };

        this.uploadToServer(request).subscribe({
          next: (result) => observer.next(result),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      } else {
        observer.error(new Error('Некорректная конфигурация изображения'));
      }
    });
  }

  /**
   * Загружает изображение по URL
   */
  private uploadFromUrl(url: string): Observable<ImageUploadResult> {
    // Для URL просто возвращаем его
    // В production версии можно скачать изображение и загрузить на свой сервер
    return of({
      success: true,
      imageUrl: url,
      message: 'Изображение загружено по URL',
    });
  }

  /**
   * Отправляет изображение на сервер
   */
  private uploadToServer(request: ImageUploadRequest): Observable<ImageUploadResult> {
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, request).pipe(
      map((response) => ({
        success: response.success,
        imageUrl: response.imageUrl,
        imageId: response.relativePath,
        fileSize: response.fileSize,
        message: response.message,
      })),
      catchError(this.handleError),
    );
  }

  /**
   * Конвертирует File в Base64 строку
   */
  fileToBase64(file: File): Promise<string> {
    console.log('🔷 AuroraImageService.fileToBase64 called', file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log('✅ FileReader.onload triggered');
        if (typeof reader.result === 'string') {
          console.log('✅ Result is string, length:', reader.result.length);
          resolve(reader.result);
        } else {
          console.log('❌ Result is not a string:', typeof reader.result);
          reject(new Error('Ошибка чтения файла'));
        }
      };
      reader.onerror = (error) => {
        console.log('❌ FileReader.onerror triggered:', error);
        reject(error);
      };
    });
  }

  /**
   * Валидирует файл изображения
   */
  validateFile(file: File): ValidationResult {
    console.log('🔷 AuroraImageService.validateFile called', {
      name: file.name,
      size: file.size,
      type: file.type,
      maxSize: this.MAX_FILE_SIZE,
      allowedFormats: this.ALLOWED_FORMATS
    });

    // Проверка размера
    if (file.size > this.MAX_FILE_SIZE) {
      console.log('❌ File size exceeds limit:', file.size, '>', this.MAX_FILE_SIZE);
      return {
        valid: false,
        error: `Размер файла превышает ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Проверка формата
    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      console.log('❌ File type not allowed:', file.type);
      return {
        valid: false,
        error: 'Неподдерживаемый формат изображения. Разрешены: JPEG, PNG, GIF, WebP',
      };
    }

    console.log('✅ File validation passed');
    return { valid: true };
  }

  /**
   * Валидирует URL изображения
   */
  validateUrl(url: string): ValidationResult {
    try {
      const parsedUrl = new URL(url);

      // Проверка протокола
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: 'URL должен начинаться с http:// или https://',
        };
      }

      // Проверка расширения файла
      const ext = parsedUrl.pathname.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      if (!ext || !validExtensions.includes(ext)) {
        return {
          valid: false,
          error: 'URL должен указывать на файл изображения (.jpg, .png, .gif, .webp)',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Некорректный URL',
      };
    }
  }

  /**
   * Получает метаданные изображения
   */
  getImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      this.fileToBase64(file)
        .then((base64) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height,
              format: file.type.split('/')[1],
              fileSize: file.size,
              mimeType: file.type,
            });
          };
          img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
          img.src = base64;
        })
        .catch(reject);
    });
  }

  /**
   * Создает превью изображения с заданными размерами
   */
  createImagePreview(
    base64Data: string,
    maxWidth: number = 800,
    maxHeight: number = 600,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Рассчитываем новые размеры с сохранением пропорций
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          reject(new Error('Не удалось создать контекст canvas'));
        }
      };
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.src = base64Data;
    });
  }

  /**
   * Применяет фильтры к изображению (Client-side)
   */
  applyFilters(
    base64Data: string,
    brightness: number = 0,
    contrast: number = 0,
    saturation: number = 0,
    grayscale: boolean = false,
    blur: number = 0,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось создать контекст canvas'));
          return;
        }

        // Применяем фильтры через CSS filters
        let filterString = '';

        if (brightness !== 0) {
          filterString += `brightness(${100 + brightness}%) `;
        }

        if (contrast !== 0) {
          filterString += `contrast(${100 + contrast}%) `;
        }

        if (saturation !== 0) {
          filterString += `saturate(${100 + saturation}%) `;
        }

        if (grayscale) {
          filterString += 'grayscale(100%) ';
        }

        if (blur > 0) {
          filterString += `blur(${blur}px) `;
        }

        ctx.filter = filterString.trim();
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.src = base64Data;
    });
  }

  /**
   * Получает конфигурацию загрузки изображений с сервера
   */
  getConfiguration(): Observable<ImageUploadConfig> {
    return this.http
      .get<{ success: boolean; data: ImageUploadConfig }>(`${this.apiUrl}/config`)
      .pipe(
        map((response) => response.data),
        catchError(() => {
          // Возвращаем дефолтную конфигурацию в случае ошибки
          return of({
            maxFileSizeBytes: this.MAX_FILE_SIZE,
            supportedFormats: this.ALLOWED_FORMATS,
            uploadBaseUrl: 'https://localhost:7233/uploads',
          });
        }),
      );
  }

  /**
   * Удаляет изображение с сервера
   */
  deleteImage(filename: string): Observable<boolean> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${filename}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * Обрабатывает ошибки HTTP запросов
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Неизвестная ошибка';

    if (error.error instanceof ErrorEvent) {
      // Ошибка на стороне клиента
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      // Ошибка на стороне сервера
      errorMessage = error.error?.message || `Ошибка сервера: ${error.status}`;
    }

    console.error('Ошибка загрузки изображения:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
