import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import { AvImageUploadResult } from '../models/image-result.model';

export interface AvStudioSaveResponse {
  success: boolean;
  url: string;
  imageId: string;
  name: string;
  message?: string;
}

/**
 * Сервис для сохранения изображений на сервер.
 * Использует тот же API, что и AvImageStudio.
 */
@Injectable({
  providedIn: 'root',
})
export class AvImagePersistenceService {
  private http = inject(HttpClient);

  /**
   * Отправляет изображение на сервер.
   * @param result Объект результата из редактора (должен содержать dataUrl с Base64)
   * @returns Ответ от сервера с URL сохраненного файла
   */
  saveImage(result: AvImageUploadResult): Observable<AvStudioSaveResponse> {
    // Формируем payload, ожидаемый контроллером AvImageStudioController
    // public string ImageBase64 { get; set; }
    // public string FileName { get; set; }
    // public int Width { get; set; }
    // public int Height { get; set; }

    const payload = {
      imageBase64: result.dataUrl,
      fileName: result.name,
      width: result.width,
      height: result.height,
    };

    return this.http.post<AvStudioSaveResponse>(ApiEndpoints.IMAGE_STUDIO.SAVE, payload);
  }
}
