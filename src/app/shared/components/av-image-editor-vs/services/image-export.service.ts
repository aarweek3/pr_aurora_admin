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
    targetWidth?: number,
    targetHeight?: number,
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

      // Исходные размеры с учетом поворота
      const fullW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const fullH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      const canvasW = targetWidth || fullW;
      const canvasH = targetHeight || fullH;

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

      // Вычисляем масштаб, если заданы целевые размеры
      const scaleX = canvasW / fullW;
      const scaleY = canvasH / fullH;
      ctx.scale(scaleX * (flipH ? -1 : 1), scaleY * (flipV ? -1 : 1));

      ctx.rotate((rotation * Math.PI) / 180);
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
