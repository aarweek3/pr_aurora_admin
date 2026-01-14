import { Injectable } from '@angular/core';

@Injectable()
export class ImageExportService {
  /**
   * Оценка размера файла при экспорте
   */
  async estimateFileSize(
    imageElement: HTMLImageElement | null,
    format: string,
    quality: number,
    rotation: number,
    flipH: boolean,
    flipV: boolean,
  ): Promise<{ size: number; width: number; height: number }> {
    return new Promise((resolve) => {
      if (!imageElement) {
        resolve({ size: 0, width: 0, height: 0 });
        return;
      }

      const img = imageElement;
      // Определяем размеры canvas с учетом поворота
      const angle = (rotation + 3600) % 360; // Нормализация угла
      const isRotated90 = angle === 90 || angle === 270;
      const canvasW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const canvasH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ size: 0, width: canvasW, height: canvasH });
        return;
      }

      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      // Коррекция качества для PNG (специфика toBlob)
      const q = format === 'image/png' ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          resolve({
            size: blob ? blob.size : 0,
            width: canvasW,
            height: canvasH,
          });
        },
        format,
        q,
      );
    });
  }
}
