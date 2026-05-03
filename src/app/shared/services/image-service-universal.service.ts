import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { from, Observable, switchMap } from 'rxjs';

/**
 * Интерфейс ответа при загрузке медиа
 */
export interface MediaUploadResponse {
  fileName: string;
  relativePath: string;
  fullUrl: string;
  folder: string;
  size: number;
}

/**
 * Метаданные существующего файла
 */
export interface MediaFileMetadata {
  exists: boolean;
  id?: string;
  originalName?: string;
  relativePath?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  fullUrl?: string;
}

/**
 * Универсальный сервис для работы с изображениями в Aurora v3.5
 */
@Injectable({
  providedIn: 'root',
})
export class ImageServiceUniversal {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/v1/media`;

  constructor() {}

  /**
   * Проверяет существование файла на сервере
   */
  checkExists(fileName: string, folder: string = 'general'): Observable<MediaFileMetadata> {
    const params = new HttpParams()
      .set('fileName', fileName)
      .set('folder', folder);
    
    return this.http.get<MediaFileMetadata>(`${this.apiUrl}/check-exists`, { params });
  }

  /**
   * Универсальная загрузка изображения (Конвертирует в Base64)
   */
  upload(file: File, folder: string = 'general', targetName?: string, width: number = 0, height: number = 0): Observable<MediaUploadResponse> {
    const fileName = targetName || file.name;
    console.log(`[ImageServiceUniversal] Загрузка: ${fileName} -> ${folder} (${width}x${height})`);
    
    return from(this.fileToBase64(file)).pipe(
      switchMap((base64) => {
        const payload = {
          imageBase64: base64,
          fileName: fileName,
          folder: folder,
          width: width,
          height: height
        };
        
        return this.http.post<MediaUploadResponse>(`${this.apiUrl}/upload`, payload);
      })
    );
  }

  /**
   * Транслитерация и очистка имени файла (Slugify)
   */
  slugify(text: string): string {
    if (!text) return '';
    
    // 1. Убираем расширение для обработки только имени
    const lastDotIndex = text.lastIndexOf('.');
    let name = lastDotIndex !== -1 ? text.substring(0, lastDotIndex) : text;
    const ext = lastDotIndex !== -1 ? text.substring(lastDotIndex).toLowerCase() : '';

    const ru = 'а-б-в-г-д-е-ё-ж-з-и-й-к-л-м-н-о-п-р-с-т-у-ф-х-ц-ч-ш-щ-ъ-ы-ь-э-ю-я'.split('-');
    const en = 'a-b-v-g-d-e-yo-zh-z-i-j-k-l-m-n-o-p-r-s-t-u-f-h-ts-ch-sh-shch--y--e-yu-ya'.split('-');
    
    let res = name.toLowerCase();
    for (let i = 0; i < ru.length; i++) {
      res = res.split(ru[i]).join(en[i]);
    }

    res = res.replace(/[^a-z0-9\s-_]/g, '-'); // Удаляем спецсимволы
    res = res.replace(/[\s-_]+/g, '-');       // Схлопываем пробелы и дефисы
    res = res.trim().replace(/^-+|-+$/g, ''); // Тримним края
    
    return res.toLowerCase() + ext.toLowerCase(); // Принудительный нижний регистр для имени и расширения
  }

  /**
   * Вспомогательный метод для конвертации файла в Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Преобразует относительный путь в полный URL
   */
  getAssetUrl(path: string | null | undefined): string {
    if (!path) return this.getPlaceholder();
    if (path.startsWith('http')) return path;
    if (path.startsWith('assets/')) return path; // Локальные ассеты фронтенда
    
    const host = environment.api.baseUrl.split('/api')[0];
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${host}${cleanPath}`;
  }

  /**
   * Обработчик ошибки загрузки изображения (404 и др.)
   * Вызывается через (error) на теге <img>
   */
  handleError(event: any): void {
    event.target.src = this.getPlaceholder();
  }

  getPlaceholder(): string {
    return 'assets/argregator_icons/placeholder-program.svg';
  }
}
