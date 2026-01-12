import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import { AvImageUploadResult } from '../models/av-image-studio-modal.model';

export interface AvStudioSaveResponse {
  success: boolean;
  url: string;
  imageId: string;
  name: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AvImageStudioPersistenceService {
  private http = inject(HttpClient);

  /**
   * Сохранение обработанного изображения на сервер
   */
  saveImage(result: AvImageUploadResult): Observable<AvStudioSaveResponse> {
    const payload = {
      imageBase64: result.dataUrl,
      fileName: result.name,
      width: result.width,
      height: result.height,
    };

    return this.http.post<AvStudioSaveResponse>(ApiEndpoints.IMAGE_STUDIO.SAVE, payload);
  }
}
