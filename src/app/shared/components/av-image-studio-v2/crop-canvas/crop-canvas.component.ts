import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AvRect } from '../models/av-image-studio-modal.model';

@Component({
  selector: 'app-crop-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crop-container" #container>
      <!-- 1. Изображение -->
      <img #imageElement [src]="imageSrc" class="source-image" (load)="onImageLoad()" />

      <!-- 2. Оверлей Canvas для отрисовки рамки -->
      <canvas #overlayCanvas class="overlay-canvas" (mousedown)="onMouseDown($event)"></canvas>
    </div>
  `,
  styles: [
    `
      .crop-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: #1e1e1e;
        overflow: hidden;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .source-image {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        display: block;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        pointer-events: none; /* События обрабатывает канвас сверху */
        object-fit: contain;
      }

      .overlay-canvas {
        position: absolute;
        /* Canvas будет позиционироваться JS-ом поверх картинки,
           но пока можно задать начальные стили */
        pointer-events: auto;
        touch-action: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CropCanvasComponent implements OnChanges, OnDestroy {
  @Input() imageSrc: string | null = null;
  @Input() aspectRatio: number | null = null; // null = free
  @Input() isCircle = false;

  // Внешний кроп (например, переданный из родителя)
  private _externalCrop: AvRect | null = null;
  @Input() set externalCrop(val: AvRect | null) {
    this._externalCrop = val;
    // Если картинка уже загружена, применяем сразу
    if (this.isReady && val) {
      this.applyExternalCrop(val);
    }
  }
  get externalCrop() {
    return this._externalCrop;
  }

  @Output() cropChange = new EventEmitter<AvRect>();
  @Output() ready = new EventEmitter<void>();

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('overlayCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isReady = false;

  // Геометрия
  private cropRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };
  private imageRect: AvRect = { x: 0, y: 0, width: 0, height: 0 }; // Размеры отображаемой картинки
  private naturalSize = { width: 0, height: 0 };

  // Dragging
  private isDragging = false;
  private dragMode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null = null;
  private dragStart = { x: 0, y: 0 };
  private startCropRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };

  // Слушатели событий (для удаления)
  private mouseMoveListener: any;
  private mouseUpListener: any;

  constructor() {
    this.mouseMoveListener = this.onMouseMove.bind(this);
    this.mouseUpListener = this.onMouseUp.bind(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aspectRatio'] && !changes['aspectRatio'].firstChange) {
      if (this.isReady) {
        // Если включили аспект, подгоняем текущий кроп
        if (this.aspectRatio) {
          this.forceAspectRatio();
          this.draw();
          this.emitCropChange();
        }
      }
    }
    if (changes['isCircle'] && !changes['isCircle'].firstChange) {
      if (this.isReady) this.draw();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }

  onImageLoad() {
    this.isReady = true;
    const imgKey = this.imageRef.nativeElement;
    this.naturalSize = { width: imgKey.naturalWidth, height: imgKey.naturalHeight };

    // Инициализируем метрики
    // Ждем тик, чтобы layout устаканился, используем Double RAF как раньше
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.updateMetrics();

        // Если был передан externalCrop, применяем его, иначе центр
        if (this.externalCrop) {
          this.applyExternalCrop(this.externalCrop);
        } else {
          this.resetCropToCenter();
        }

        this.ready.emit();

        // Глобальные слушатели
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener);
      });
    });
  }

  private updateMetrics() {
    const img = this.imageRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    // Картинка внутри flex контейнера с max-width/height.
    // Ее реальные (отображаемые) размеры:
    this.imageRect = {
      x: img.offsetLeft,
      y: img.offsetTop,
      width: img.offsetWidth,
      height: img.offsetHeight,
    };

    // Канвас позиционируем ровно поверх картинки
    canvas.width = this.imageRect.width;
    canvas.height = this.imageRect.height;
    canvas.style.left = this.imageRect.x + 'px';
    canvas.style.top = this.imageRect.y + 'px';
    // Важно: canvas.width/height - это буфер, style.width/height - стиль.
    // Если они совпадают, масштабирования нет.

    this.ctx = canvas.getContext('2d')!;
  }

  private resetCropToCenter() {
    const w = this.imageRect.width;
    const h = this.imageRect.height;

    // По умолчанию 80%
    const cropW = w * 0.8;
    const cropH = h * 0.8;

    // Если есть aspectRatio, учитываем его сразу
    let finalW = cropW;
    let finalH = cropH;

    if (this.aspectRatio) {
      if (cropW / cropH > this.aspectRatio) {
        finalW = cropH * this.aspectRatio;
      } else {
        finalH = cropW / this.aspectRatio;
      }
    }

    this.cropRect = {
      x: (w - finalW) / 2,
      y: (h - finalH) / 2,
      width: finalW,
      height: finalH,
    };

    this.draw();
    this.emitCropChange();
  }

  // --- Drawing Logic (AvCropManager Inspired) ---

  private draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cvs = this.canvasRef.nativeElement;
    const rect = this.cropRect;

    // 1. Clear
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // 2. Dimmed background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // 3. Clear selection ("hole")
    // Используем 'destination-out' или просто clearRect внутри
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

    // В случае с кругом можно использовать composite operation, но пока прямоугольник
    // Если нужен круг (визуально):
    if (this.isCircle) {
      // Заливаем дыру обратно полупрозрачным (костыль), или используем clip
      // Проще нарисовать "бублик".
      // Но следуя логике плагина (там rect), оставим rect.
      // Плагин имеет отдельный класс AvCircleManager. Здесь мы пока в Rect mode.
    }

    // 4. Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1; // Тонкая рамка
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    // 5. Grid (Rule of Thirds)
    this.drawGrid(ctx, rect);

    // 6. Handles
    this.drawHandles(ctx, rect);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, rect: AvRect) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;

    const dw = rect.width / 3;
    const dh = rect.height / 3;

    // Vertical
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(rect.x + dw * i, rect.y);
      ctx.lineTo(rect.x + dw * i, rect.y + rect.height);
    }
    // Horizontal
    for (let j = 1; j < 3; j++) {
      ctx.moveTo(rect.x, rect.y + dh * j);
      ctx.lineTo(rect.x + rect.width, rect.y + dh * j);
    }
    ctx.stroke();
  }

  private drawHandles(ctx: CanvasRenderingContext2D, rect: AvRect) {
    const size = 8;
    // Corners
    this.drawHandleRect(ctx, rect.x, rect.y, size); // NW
    this.drawHandleRect(ctx, rect.x + rect.width, rect.y, size); // NE
    this.drawHandleRect(ctx, rect.x, rect.y + rect.height, size); // SW
    this.drawHandleRect(ctx, rect.x + rect.width, rect.y + rect.height, size); // SE
  }

  private drawHandleRect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    const h = size / 2;
    ctx.fillRect(x - h, y - h, size, size);
    ctx.strokeRect(x - h, y - h, size, size);
  }

  // --- Interaction ---

  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    const { x, y } = this.getMousePos(e);

    // Check handles first
    const handle = this.getHandleAt(x, y);
    if (handle) {
      this.dragMode = handle;
    } else if (this.isPointInsideCrop(x, y)) {
      this.dragMode = 'move';
    } else {
      return; // Clicked outside
    }

    this.isDragging = true;
    this.dragStart = { x, y };
    this.startCropRect = { ...this.cropRect };
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || !this.dragMode) return;
    e.preventDefault();

    const { x, y } = this.getMousePos(e);
    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;

    const newRect = { ...this.startCropRect };

    if (this.dragMode === 'move') {
      newRect.x += dx;
      newRect.y += dy;
      // Clamp position
      newRect.x = Math.max(0, Math.min(newRect.x, this.imageRect.width - newRect.width));
      newRect.y = Math.max(0, Math.min(newRect.y, this.imageRect.height - newRect.height));
    } else {
      // Resize logic
      // Simple implementation:
      if (this.dragMode.includes('e')) newRect.width = Math.max(20, this.startCropRect.width + dx);
      if (this.dragMode.includes('s'))
        newRect.height = Math.max(20, this.startCropRect.height + dy);
      if (this.dragMode.includes('w')) {
        const w = Math.max(20, this.startCropRect.width - dx);
        newRect.x = this.startCropRect.x + (this.startCropRect.width - w);
        newRect.width = w;
      }
      if (this.dragMode.includes('n')) {
        const h = Math.max(20, this.startCropRect.height - dy);
        newRect.y = this.startCropRect.y + (this.startCropRect.height - h);
        newRect.height = h;
      }

      // Aspect Ratio constraint (simple version)
      if (this.aspectRatio) {
        // Priority to Width
        newRect.height = newRect.width / this.aspectRatio;
      }

      // Clamp Size/Pos
      // (Опустим сложную логику clamp для краткости, главное - не выходить за границы)
      if (newRect.x < 0) newRect.x = 0;
      if (newRect.y < 0) newRect.y = 0;
      if (newRect.x + newRect.width > this.imageRect.width)
        newRect.width = this.imageRect.width - newRect.x;
      if (newRect.y + newRect.height > this.imageRect.height)
        newRect.height = this.imageRect.height - newRect.y;

      // Re-check aspect after clamp
      if (this.aspectRatio) {
        // If height clamped, adjust width
        if (newRect.height * this.aspectRatio <= newRect.width) {
          newRect.width = newRect.height * this.aspectRatio;
        }
      }
    }

    this.cropRect = newRect;
    this.draw();
    // Throttle emit if needed, but for now emit always
    this.emitCropChange();
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragMode = null;
  }

  // --- Helpers ---

  private getMousePos(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private getHandleAt(x: number, y: number): 'nw' | 'ne' | 'sw' | 'se' | null {
    const r = this.cropRect;
    const s = 10; // hit size
    // Check corners
    if (this.hitTest(x, y, r.x, r.y, s)) return 'nw';
    if (this.hitTest(x, y, r.x + r.width, r.y, s)) return 'ne';
    if (this.hitTest(x, y, r.x, r.y + r.height, s)) return 'sw';
    if (this.hitTest(x, y, r.x + r.width, r.y + r.height, s)) return 'se';
    return null;
  }

  private hitTest(mx: number, my: number, x: number, y: number, size: number) {
    return mx >= x - size && mx <= x + size && my >= y - size && my <= y + size;
  }

  private isPointInsideCrop(x: number, y: number) {
    const r = this.cropRect;
    return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
  }

  private applyExternalCrop(ext: AvRect) {
    // ext - это координаты в Natural Size. Нужно перевести в UI
    const scaleX = this.imageRect.width / this.naturalSize.width;
    const scaleY = this.imageRect.height / this.naturalSize.height;

    this.cropRect = {
      x: ext.x * scaleX,
      y: ext.y * scaleY,
      width: ext.width * scaleX,
      height: ext.height * scaleY,
    };
    this.draw();
  }

  private emitCropChange() {
    // Переводим UI -> Natural
    if (this.imageRect.width === 0) return;

    const scaleX = this.naturalSize.width / this.imageRect.width;
    const scaleY = this.naturalSize.height / this.imageRect.height;

    const real: AvRect = {
      x: Math.round(this.cropRect.x * scaleX),
      y: Math.round(this.cropRect.y * scaleY),
      width: Math.round(this.cropRect.width * scaleX),
      height: Math.round(this.cropRect.height * scaleY),
    };

    this.cropChange.emit(real);
  }

  private forceAspectRatio() {
    if (!this.aspectRatio) return;
    // Сохраняем центр
    const cx = this.cropRect.x + this.cropRect.width / 2;
    const cy = this.cropRect.y + this.cropRect.height / 2;

    // Меняем высоту под ширину
    let w = this.cropRect.width;
    let h = w / this.aspectRatio;

    if (h > this.imageRect.height) {
      h = this.imageRect.height;
      w = h * this.aspectRatio;
    }

    this.cropRect = {
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
    };
  }
}
