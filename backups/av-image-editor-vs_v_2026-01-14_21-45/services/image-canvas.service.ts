import { computed, Injectable, signal } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { ImageEditorState } from '../models/editor-state.model';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface ImagePointer {
  x: number;
  y: number;
}

@Injectable()
export class ImageCanvasService {
  /** Оригинальное изображение (HTML Element) */
  private imageElement: HTMLImageElement | null = null;

  /** Состояние холста */
  readonly canvasSize = signal<CanvasDimensions>({ width: 0, height: 0 });

  /** Состояние трансформации */
  readonly zoom = signal<number>(1);
  readonly rotation = signal<number>(0);
  readonly flipH = signal<boolean>(false);
  readonly flipV = signal<boolean>(false);

  /** Вычисляемые размеры отображаемого изображения */
  readonly displaySize = computed(() => {
    if (!this.imageElement) return { width: 0, height: 0 };
    const z = this.zoom();
    return {
      width: this.imageElement.naturalWidth * z,
      height: this.imageElement.naturalHeight * z,
    };
  });

  /**
   * Загрузка изображения с поддержкой Proxy (CORS bypass) и фолбеком
   */
  async loadImage(src: string): Promise<HTMLImageElement> {
    const isRemote = src.startsWith('http') && !src.includes(window.location.host);
    const finalUrl = isRemote
      ? `${ApiEndpoints.IMAGE_STUDIO.PROXY_IMAGE}?url=${encodeURIComponent(src)}`
      : src;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.imageElement = img;
        this.resetView();
        resolve(img);
      };

      img.onerror = () => {
        console.warn('[IMAGE-LOAD] Proxy/CORS load failed, trying direct fallback...');

        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          this.imageElement = fallbackImg;
          this.resetView();
          resolve(fallbackImg);
        };
        fallbackImg.onerror = (err) => {
          console.error('[IMAGE-LOAD] Total failure:', src);
          reject(err);
        };
        fallbackImg.src = src; // Try direct URL as last resort
      };

      img.src = finalUrl;
    });
  }

  /**
   * Генерация финального изображения с учетом кропа, поворота и ресайза.
   * Вынесено из ImageEditorMainComponent.
   */
  async generateProcessedImage(state: ImageEditorState): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = this.imageElement;
      if (!img) return reject('No image');

      const s = state;
      const rot = this.rotation();
      const fh = this.flipH();
      const fv = this.flipV();

      // 1. Calculate intermediate canvas size (after rotation)
      const angle = (rot + 3600) % 360;
      const isRotated90 = angle === 90 || angle === 270;
      const fullW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const fullH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = fullW;
      tempCanvas.height = fullH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return reject('Canvas error');

      tempCtx.save();
      tempCtx.translate(fullW / 2, fullH / 2);
      tempCtx.rotate((rot * Math.PI) / 180);
      tempCtx.scale(fh ? -1 : 1, fv ? -1 : 1);
      tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      tempCtx.restore();

      // 2. Source: область на оригинале (учитываем кроп)
      const srcX = s.crop.x || 0;
      const srcY = s.crop.y || 0;
      const srcW = s.crop.width || fullW;
      const srcH = s.crop.height || fullH;

      // 3. Target: конечный размер (ресайз)
      const isResizeTool = s.activeTool === 'resize';
      const targetW = isResizeTool ? s.crop.resizeWidth || fullW : srcW;
      const targetH = isResizeTool ? s.crop.resizeHeight || fullH : srcH;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetW;
      finalCanvas.height = targetH;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return reject('Canvas error');

      // 4. Маска (если выбрана)
      if (s.crop.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(targetW / 2, targetH / 2, Math.min(targetW, targetH) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.drawImage(tempCanvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      // 5. Формат и качество
      let format = s.export.format;
      if (s.crop.shape === 'circle' && format === 'image/jpeg') {
        // JPEG не поддерживает прозрачность для кругов
        format = 'image/webp';
      }

      const dataUrl = finalCanvas.toDataURL(format, s.export.quality / 100);
      resolve(dataUrl);
    });
  }

  /**
   * Поворот на угол (относительный)
   */
  rotate(delta: number): void {
    this.rotation.update((r) => (r + delta) % 360);
  }

  /**
   * Отражение
   */
  flip(direction: 'h' | 'v'): void {
    if (direction === 'h') this.flipH.update((f) => !f);
    else this.flipV.update((f) => !f);
  }

  /**
   * Зум
   */
  zoomIn(factor: number = 0.1): void {
    this.zoom.update((z) => Math.min(z + factor, 5));
  }
  zoomOut(factor: number = 0.1): void {
    this.zoom.update((z) => Math.max(z - factor, 0.1));
  }

  resetTransforms(): void {
    this.rotation.set(0);
    this.flipH.set(false);
    this.flipV.set(false);
    this.zoom.set(1);
  }

  resetView(): void {
    const imgSize = this.displaySize();
    const canSize = this.canvasSize();

    if (imgSize.width === 0 || canSize.width === 0) return;

    // Авто-фит в размеры контейнера с небольшим отступом
    const scaleX = (canSize.width * 0.9) / imgSize.width;
    const scaleY = (canSize.height * 0.9) / imgSize.height;
    const fitScale = Math.min(scaleX, scaleY, 1);

    this.zoom.set(fitScale || 1);
  }

  getImage() {
    return this.imageElement;
  }

  /**
   * Обновление размера холста (например, при ресайзе окна)
   */
  updateCanvasSize(width: number, height: number): void {
    const oldSize = this.canvasSize();
    this.canvasSize.set({ width, height });

    // Если это первая установка размера или сброс
    if (oldSize.width === 0 && width > 0) {
      this.resetView();
    }
  }

  /**
   * Отрисовка на холсте
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.imageElement) return;

    const img = this.imageElement;
    const { width, height } = this.canvasSize();
    const z = this.zoom();

    // Очистка полного холста
    ctx.clearRect(0, 0, width, height);

    // Рисуем шахматку (прозрачность)
    this.drawCheckerboard(ctx, width, height);

    // Рисуем изображение
    ctx.save();

    // Применяем трансформации (всегда по центру canvas)
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((this.rotation() * Math.PI) / 180);
    ctx.scale(this.flipH() ? -1 : 1, this.flipV() ? -1 : 1);

    ctx.drawImage(
      img,
      -(img.naturalWidth * z) / 2,
      -(img.naturalHeight * z) / 2,
      img.naturalWidth * z,
      img.naturalHeight * z,
    );

    ctx.restore();
  }

  /**
   * Рисует шахматный фон
   */
  private drawCheckerboard(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const size = 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < w; i += size * 2) {
      for (let j = 0; j < h; j += size * 2) {
        ctx.fillRect(i, j, size, size);
        ctx.fillRect(i + size, j + size, size, size);
      }
    }
  }
}
