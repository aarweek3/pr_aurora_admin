import { computed, Injectable, signal } from '@angular/core';

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
  readonly offset = signal<ImagePointer>({ x: 0, y: 0 });
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
   * Загрузка изображения
   */
  async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageElement = img;
        this.resetView();
        resolve(img);
      };
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  /**
   * Смещение изображения (панорамирование)
   */
  pan(dx: number, dy: number): void {
    const current = this.offset();
    this.offset.set({
      x: current.x + dx,
      y: current.y + dy,
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
   * Сброс вида (центрирование и вписывание)
   */
  resetView(): void {
    if (!this.imageElement) return;

    const canvas = this.canvasSize();
    const imgW = this.imageElement.naturalWidth;
    const imgH = this.imageElement.naturalHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      this.zoom.set(1);
      this.offset.set({ x: 0, y: 0 });
      return;
    }

    // Рассчитываем zoom, чтобы вписать картинку (Contain) с небольшим отступом (80%)
    const padding = 0.8;
    const scaleX = (canvas.width * padding) / imgW;
    const scaleY = (canvas.height * padding) / imgH;
    const newZoom = Math.min(scaleX, scaleY, 1); // Не растягиваем выше 100% при инициализации

    this.zoom.set(newZoom);

    // Центрирование
    const offX = (canvas.width - imgW * newZoom) / 2;
    const offY = (canvas.height - imgH * newZoom) / 2;
    this.offset.set({ x: offX, y: offY });
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
   * Получить текущее изображение
   */
  getImage(): HTMLImageElement | null {
    return this.imageElement;
  }

  /**
   * Отрисовка на холсте
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.imageElement) return;

    const img = this.imageElement;
    const { width, height } = this.canvasSize();
    const z = this.zoom();
    const { x, y } = this.offset();

    // Очистка
    ctx.clearRect(0, 0, width, height);

    // Рисуем шахматку (прозрачность)
    this.drawCheckerboard(ctx, width, height);

    // Рисуем изображение
    ctx.save();

    // Применяем трансформации
    ctx.translate(x + (img.naturalWidth * z) / 2, y + (img.naturalHeight * z) / 2);
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
