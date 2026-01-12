import { Injectable } from '@angular/core';
import {
  AvExportSettings,
  AvImageUploadResult,
  AvRect,
} from '@shared/components/av-image-studio-modal/models/av-image-studio-modal.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvImageProcessingService {
  constructor() {}

  /**
   * 1. Чтение файла в DataURL (Base64)
   */
  readAsDataUrl(file: File): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next(e.target.result);
        observer.complete();
      };
      reader.onerror = (e) => observer.error(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * 2. Загрузка изображения в HTMLImageElement
   * (Нужно для получения размеров и рисования на Canvas)
   */
  loadImage(src: string): Observable<HTMLImageElement> {
    return new Observable((observer) => {
      const img = new Image();
      // CORS settings if loading from external URL
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        observer.next(img);
        observer.complete();
      };
      img.onerror = (err) => observer.error(err);
      img.src = src;
    });
  }

  /**
   * 3. Основная процессинговая функция
   * Применяет Crop, Rotate, Flip, Resize
   */
  processImage(
    img: HTMLImageElement,
    state: Partial<AvImageEditorState>, // Используем Partial для гибкости
    settings: AvExportSettings,
  ): Observable<AvImageUploadResult> {
    return new Observable((observer) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        observer.error('Canvas context not supported');
        return;
      }

      // 1. Determine Source Geometry
      // Если есть CropRect, берем его. Иначе - вся картинка.
      const srcRect: AvRect = state.cropRect || {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      // 2. Determine Output Size
      // Если задан TargetSize в настройках экспорта - используем его.
      // Иначе - размер кропнутой области.
      const destW = settings.targetSize?.width || srcRect.width;
      const destH = settings.targetSize?.height || srcRect.height;

      canvas.width = destW;
      canvas.height = destH;

      // 3. Draw (Simple Crop & Resize)
      // TODO: Добавить поддержку Rotate и Flip (потребует матричных трансформаций)

      // Сглаживание для качественного ресайза
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        srcRect.x,
        srcRect.y,
        srcRect.width,
        srcRect.height, // Source Rect
        0,
        0,
        destW,
        destH, // Dest Rect
      );

      // 4. Export to Blob/DataURL
      const mimeType = settings.format;
      const quality = settings.quality / 100; // 0.0 - 1.0

      // Получаем DataURL для превью
      const dataUrl = canvas.toDataURL(mimeType, quality);

      // Получаем Blob для выгрузки
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Создаем File объект из Blob
            const filename = `image_${Date.now()}.${mimeType.split('/')[1]}`;
            const file = new File([blob], filename, { type: mimeType });

            observer.next({
              file: file,
              dataUrl: dataUrl,
              width: destW,
              height: destH,
              size: blob.size,
              name: filename,
            });
            observer.complete();
          } else {
            observer.error('Blob creation failed');
          }
        },
        mimeType,
        quality,
      );
    });
  }
}

// Временный интерфейс стейта, чтобы не импортировать из models пока (если файл models еще не проиндексирован IDE)
// В боевом коде этот блок удаляем и импортируем из ./av-image.model
interface AvImageEditorState {
  cropRect: AvRect | null;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}
