/**
 * CropTool - Overlay Canvas Tool для интерактивной обрезки
 * Aurora Editor
 */

import { CropArea, CropToolOptions, ResizeHandle, VisualStyle } from './crop.types';

export class CropTool {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private overlayCanvas!: HTMLCanvasElement;
  private overlayCtx!: CanvasRenderingContext2D;

  private cropArea: CropArea;
  private aspectRatio: number | null = null;
  private showGrid = false;

  // Interaction state
  private isDragging = false;
  private isResizing = false;
  private dragStart: { x: number; y: number } | null = null;
  private resizeHandle: ResizeHandle | null = null;
  private currentCursor = 'default';

  // Options
  private minWidth: number;
  private minHeight: number;
  private style: VisualStyle;

  // Image bounds
  private imageBounds = { width: 0, height: 0 };

  constructor(options: CropToolOptions = {}) {
    this.minWidth = options.minWidth || 20;
    this.minHeight = options.minHeight || 20;
    this.aspectRatio = options.aspectRatio ?? null;
    this.showGrid = options.showGrid || false;

    // Стили по умолчанию
    this.style = {
      overlayColor: options.overlayColor || 'rgba(0, 0, 0, 0.5)',
      borderColor: options.borderColor || '#ffffff',
      borderWidth: options.borderWidth || 2,
      handleSize: options.handleSize || 8,
      handleColor: options.handleColor || '#4a90e2',
      gridColor: 'rgba(255, 255, 255, 0.5)',
      gridWidth: 1,
    };

    // Инициализация области обрезки (будет обновлена в mount)
    this.cropArea = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Присоединить к canvas
   */
  mount(canvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.overlayCanvas = overlayCanvas;
    this.overlayCtx = overlayCanvas.getContext('2d')!;

    // Синхронизировать размеры overlay с основным canvas
    this.syncOverlaySize();

    // Инициализировать область обрезки (80% от центра)
    this.initializeCropArea();

    // Установить обработчики событий
    this.setupEventListeners();

    // Первая отрисовка
    this.render();
  }

  /**
   * Отсоединить от canvas
   */
  unmount(): void {
    this.removeEventListeners();
    this.clearOverlay();
  }

  /**
   * Получить текущую область обрезки
   */
  getCropArea(): CropArea {
    return { ...this.cropArea };
  }

  /**
   * Установить область обрезки
   */
  setCropArea(area: CropArea): void {
    this.cropArea = { ...area };
    this.constrainCropArea();
    this.render();
  }

  /**
   * Установить пропорции
   */
  setAspectRatio(ratio: number | null): void {
    this.aspectRatio = ratio;

    if (ratio !== null) {
      // Пересчитать область с новыми пропорциями
      this.applyAspectRatio();
    }

    this.render();
  }

  /**
   * Переключить сетку
   */
  setShowGrid(show: boolean): void {
    this.showGrid = show;
    this.render();
  }

  /**
   * Обновить размеры overlay при изменении canvas
   */
  updateCanvasSize(): void {
    this.syncOverlaySize();
    this.initializeCropArea();
    this.render();
  }

  // ────────────────────────────────────────────────────────────────
  // Private Methods
  // ────────────────────────────────────────────────────────────────

  private syncOverlaySize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.overlayCanvas.width = this.canvas.width;
    this.overlayCanvas.height = this.canvas.height;
    this.overlayCanvas.style.width = rect.width + 'px';
    this.overlayCanvas.style.height = rect.height + 'px';

    this.imageBounds = {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  private initializeCropArea(): void {
    const width = this.imageBounds.width * 0.8;
    const height = this.imageBounds.height * 0.8;
    const x = (this.imageBounds.width - width) / 2;
    const y = (this.imageBounds.height - height) / 2;

    this.cropArea = { x, y, width, height };
    this.constrainCropArea();
  }

  private setupEventListeners(): void {
    this.overlayCanvas.addEventListener('mousedown', this.onMouseDown);
    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseup', this.onMouseUp);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseUp);
  }

  private removeEventListeners(): void {
    this.overlayCanvas.removeEventListener('mousedown', this.onMouseDown);
    this.overlayCanvas.removeEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.removeEventListener('mouseup', this.onMouseUp);
    this.overlayCanvas.removeEventListener('mouseleave', this.onMouseUp);
  }

  // ────────────────────────────────────────────────────────────────
  // Mouse Event Handlers
  // ────────────────────────────────────────────────────────────────

  private onMouseDown = (e: MouseEvent): void => {
    const { x, y } = this.getMousePos(e);
    const handle = this.getHandleAtPoint(x, y);

    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
      this.dragStart = { x, y };
    } else if (this.isInsideCropArea(x, y)) {
      this.isDragging = true;
      this.dragStart = { x, y };
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    const { x, y } = this.getMousePos(e);

    if (this.isResizing && this.dragStart && this.resizeHandle) {
      this.handleResize(x, y);
      this.render();
    } else if (this.isDragging && this.dragStart) {
      this.handleDrag(x, y);
      this.render();
    } else {
      // Обновить курсор
      this.updateCursor(x, y);
    }
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
    this.isResizing = false;
    this.dragStart = null;
    this.resizeHandle = null;
  };

  // ────────────────────────────────────────────────────────────────
  // Interaction Logic
  // ────────────────────────────────────────────────────────────────

  private handleDrag(x: number, y: number): void {
    if (!this.dragStart) return;

    const deltaX = x - this.dragStart.x;
    const deltaY = y - this.dragStart.y;

    this.cropArea.x += deltaX;
    this.cropArea.y += deltaY;

    this.constrainCropArea();
    this.dragStart = { x, y };
  }

  private handleResize(x: number, y: number): void {
    if (!this.dragStart || !this.resizeHandle) return;

    const deltaX = x - this.dragStart.x;
    const deltaY = y - this.dragStart.y;

    const oldArea = { ...this.cropArea };

    switch (this.resizeHandle) {
      case 'nw':
        this.cropArea.x += deltaX;
        this.cropArea.y += deltaY;
        this.cropArea.width -= deltaX;
        this.cropArea.height -= deltaY;
        break;
      case 'n':
        this.cropArea.y += deltaY;
        this.cropArea.height -= deltaY;
        break;
      case 'ne':
        this.cropArea.y += deltaY;
        this.cropArea.width += deltaX;
        this.cropArea.height -= deltaY;
        break;
      case 'e':
        this.cropArea.width += deltaX;
        break;
      case 'se':
        this.cropArea.width += deltaX;
        this.cropArea.height += deltaY;
        break;
      case 's':
        this.cropArea.height += deltaY;
        break;
      case 'sw':
        this.cropArea.x += deltaX;
        this.cropArea.width -= deltaX;
        this.cropArea.height += deltaY;
        break;
      case 'w':
        this.cropArea.x += deltaX;
        this.cropArea.width -= deltaX;
        break;
    }

    // Применить пропорции если нужно
    if (this.aspectRatio !== null) {
      this.applyAspectRatioOnResize(this.resizeHandle, oldArea);
    }

    this.constrainCropArea();
    this.dragStart = { x, y };
  }

  private applyAspectRatioOnResize(handle: ResizeHandle, oldArea: CropArea): void {
    if (this.aspectRatio === null) return;

    // Для угловых и боковых маркеров
    if (['e', 'w', 'se', 'sw', 'ne', 'nw'].includes(handle)) {
      const newHeight = this.cropArea.width / this.aspectRatio;
      const heightDiff = newHeight - this.cropArea.height;
      this.cropArea.height = newHeight;

      // Корректировка Y для верхних маркеров
      if (['ne', 'nw'].includes(handle)) {
        this.cropArea.y -= heightDiff;
      }
    } else {
      // n, s
      const newWidth = this.cropArea.height * this.aspectRatio;
      const widthDiff = newWidth - this.cropArea.width;
      this.cropArea.width = newWidth;

      // Можно добавить корректировку X если нужно
    }
  }

  private applyAspectRatio(): void {
    if (this.aspectRatio === null) return;

    // Сохранить центр
    const centerX = this.cropArea.x + this.cropArea.width / 2;
    const centerY = this.cropArea.y + this.cropArea.height / 2;

    // Пересчитать высоту по пропорции
    this.cropArea.height = this.cropArea.width / this.aspectRatio;

    // Восстановить центр
    this.cropArea.x = centerX - this.cropArea.width / 2;
    this.cropArea.y = centerY - this.cropArea.height / 2;

    this.constrainCropArea();
  }

  private constrainCropArea(): void {
    // Минимальный размер
    if (this.cropArea.width < this.minWidth) this.cropArea.width = this.minWidth;
    if (this.cropArea.height < this.minHeight) this.cropArea.height = this.minHeight;

    // Границы изображения
    if (this.cropArea.x < 0) this.cropArea.x = 0;
    if (this.cropArea.y < 0) this.cropArea.y = 0;
    if (this.cropArea.x + this.cropArea.width > this.imageBounds.width) {
      this.cropArea.x = this.imageBounds.width - this.cropArea.width;
    }
    if (this.cropArea.y + this.cropArea.height > this.imageBounds.height) {
      this.cropArea.y = this.imageBounds.height - this.cropArea.height;
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────────────

  private render(): void {
    this.clearOverlay();
    this.drawOverlay();
    this.drawCropBorder();
    if (this.showGrid) this.drawGrid();
    this.drawHandles();
  }

  private clearOverlay(): void {
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
  }

  private drawOverlay(): void {
    this.overlayCtx.fillStyle = this.style.overlayColor;
    this.overlayCtx.fillRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    // Вырезать область обрезки (сделать прозрачной)
    this.overlayCtx.globalCompositeOperation = 'destination-out';
    this.overlayCtx.fillRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
    this.overlayCtx.globalCompositeOperation = 'source-over';
  }

  private drawCropBorder(): void {
    this.overlayCtx.strokeStyle = this.style.borderColor;
    this.overlayCtx.lineWidth = this.style.borderWidth;
    this.overlayCtx.strokeRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
  }

  private drawGrid(): void {
    this.overlayCtx.strokeStyle = this.style.gridColor;
    this.overlayCtx.lineWidth = this.style.gridWidth;

    const { x, y, width, height } = this.cropArea;
    const thirdWidth = width / 3;
    const thirdHeight = height / 3;

    // Вертикальные линии
    for (let i = 1; i < 3; i++) {
      this.overlayCtx.beginPath();
      this.overlayCtx.moveTo(x + thirdWidth * i, y);
      this.overlayCtx.lineTo(x + thirdWidth * i, y + height);
      this.overlayCtx.stroke();
    }

    // Горизонтальные линии
    for (let i = 1; i < 3; i++) {
      this.overlayCtx.beginPath();
      this.overlayCtx.moveTo(x, y + thirdHeight * i);
      this.overlayCtx.lineTo(x + width, y + thirdHeight * i);
      this.overlayCtx.stroke();
    }
  }

  private drawHandles(): void {
    const handles = this.getHandlePositions();
    const size = this.style.handleSize;

    this.overlayCtx.fillStyle = this.style.handleColor;
    this.overlayCtx.strokeStyle = '#ffffff';
    this.overlayCtx.lineWidth = 2;

    for (const handle in handles) {
      const pos = handles[handle as ResizeHandle];
      this.overlayCtx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
      this.overlayCtx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Helper Methods
  // ────────────────────────────────────────────────────────────────

  private getMousePos(e: MouseEvent): { x: number; y: number } {
    const rect = this.overlayCanvas.getBoundingClientRect();
    const scaleX = this.overlayCanvas.width / rect.width;
    const scaleY = this.overlayCanvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private isInsideCropArea(x: number, y: number): boolean {
    return (
      x >= this.cropArea.x &&
      x <= this.cropArea.x + this.cropArea.width &&
      y >= this.cropArea.y &&
      y <= this.cropArea.y + this.cropArea.height
    );
  }

  private getHandleAtPoint(x: number, y: number): ResizeHandle | null {
    const handles = this.getHandlePositions();
    const tolerance = this.style.handleSize;

    for (const [handle, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) <= tolerance && Math.abs(y - pos.y) <= tolerance) {
        return handle as ResizeHandle;
      }
    }

    return null;
  }

  private getHandlePositions(): Record<ResizeHandle, { x: number; y: number }> {
    const { x, y, width, height } = this.cropArea;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return {
      nw: { x, y },
      n: { x: x + halfWidth, y },
      ne: { x: x + width, y },
      e: { x: x + width, y: y + halfHeight },
      se: { x: x + width, y: y + height },
      s: { x: x + halfWidth, y: y + height },
      sw: { x, y: y + height },
      w: { x, y: y + halfHeight },
    };
  }

  private updateCursor(x: number, y: number): void {
    const handle = this.getHandleAtPoint(x, y);
    let cursor = 'default';

    if (handle) {
      cursor = this.getCursorForHandle(handle);
    } else if (this.isInsideCropArea(x, y)) {
      cursor = 'move';
    }

    if (cursor !== this.currentCursor) {
      this.currentCursor = cursor;
      this.overlayCanvas.style.cursor = cursor;
    }
  }

  private getCursorForHandle(handle: ResizeHandle): string {
    const cursors: Record<ResizeHandle, string> = {
      nw: 'nw-resize',
      n: 'n-resize',
      ne: 'ne-resize',
      e: 'e-resize',
      se: 'se-resize',
      s: 's-resize',
      sw: 'sw-resize',
      w: 'w-resize',
    };

    return cursors[handle];
  }
}
