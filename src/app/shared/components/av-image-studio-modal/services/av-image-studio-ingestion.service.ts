import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { AvImageLoadError, AvImageLoadResult } from '../models/av-image-studio-modal-loader.model';

@Injectable({
  providedIn: 'root',
})
export class AvImageStudioIngestionService {
  private http = inject(HttpClient);

  // Сигналы для состояния
  readonly currentResult = signal<AvImageLoadResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<AvImageLoadError | null>(null);

  /**
   * Загрузка изображения из объекта File (локальный выбор или Drop)
   */
  loadFromFile(file: File, source: 'file' | 'drop' = 'file'): void {
    if (!file.type.startsWith('image/')) {
      this.setError('INVALID_FORMAT', 'Файл не является изображением');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const dataUrl = e.target.result;
      try {
        const dims = await this.getImageDimensions(dataUrl);
        const result: AvImageLoadResult = {
          source: source,
          dataUrl: dataUrl,
          file: file,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          width: dims.width,
          height: dims.height,
        };
        this.currentResult.set(result);
      } catch (err) {
        this.setError('INVALID_FORMAT', 'Не удалось прочитать размеры изображения');
      } finally {
        this.isLoading.set(false);
      }
    };

    reader.onerror = () => {
      this.setError('NOT_FOUND', 'Ошибка при чтении файла');
      this.isLoading.set(false);
    };

    reader.readAsDataURL(file);
  }

  loadFromUrl(url: string): void {
    if (!url) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Используем серверный прокси для обхода CORS
    const proxyUrl = `${ApiEndpoints.IMAGE_STUDIO.PROXY_IMAGE}?url=${encodeURIComponent(url)}`;

    fetch(proxyUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error('Proxy fetch failed');
        const blob = await res.blob();
        const fileName = url.split('/').pop()?.split('?')[0] || 'remote_image';

        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const dataUrl = e.target.result;
          try {
            const dims = await this.getImageDimensions(dataUrl);
            this.currentResult.set({
              source: 'url',
              dataUrl: dataUrl,
              file: new File([blob], fileName, { type: blob.type }),
              fileName: fileName,
              fileSize: blob.size,
              mimeType: blob.type,
              width: dims.width,
              height: dims.height,
            });
          } catch {
            this.setError('INVALID_FORMAT', 'Image load failed');
          } finally {
            this.isLoading.set(false);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.warn('Proxy failed, trying direct fallback:', err);
        // Fallback: пробуем загрузить напрямую
        this.loadDirectUrl(url);
      });
  }

  private loadDirectUrl(url: string) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.currentResult.set({
        source: 'url',
        dataUrl: url,
        file: null,
        fileName: url.split('/').pop()?.split('?')[0] || 'remote_image',
        fileSize: 0,
        mimeType: 'image/remote',
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      this.isLoading.set(false);
    };
    img.onerror = () => {
      // Last resort: tainted canvas (no CORS) or failure
      const imgPlain = new Image();
      imgPlain.onload = () => {
        this.currentResult.set({
          source: 'url',
          dataUrl: url,
          file: null,
          fileName: url.split('/').pop()?.split('?')[0] || 'remote_image',
          fileSize: 0,
          mimeType: 'image/remote',
          width: imgPlain.naturalWidth,
          height: imgPlain.naturalHeight,
        });
        this.isLoading.set(false);
      };
      imgPlain.onerror = () => {
        this.setError('CORS_ISSUE', 'Не удалось загрузить изображение');
        this.isLoading.set(false);
      };
      imgPlain.src = url;
    };
    img.src = url;
  }

  private getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Обработка события Drop
   */
  handleDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.loadFromFile(files[0], 'drop');
    }
  }

  /**
   * Сброс состояния
   */
  reset(): void {
    this.currentResult.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }

  private setError(code: AvImageLoadError['code'], message: string): void {
    this.error.set({ code, message });
    this.currentResult.set(null);
  }
}
