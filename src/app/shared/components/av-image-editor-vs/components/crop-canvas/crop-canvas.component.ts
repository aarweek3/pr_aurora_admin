import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
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
  effect,
  inject,
  untracked,
} from '@angular/core';
import { ImageCanvasService } from '../../services/image-canvas.service';
import { ImageEditorStateService } from '../../services/image-editor-state.service';

export interface AvRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'av-crop-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crop-container" #container>
      <canvas #overlayCanvas class="overlay-canvas" (mousedown)="onMouseDown($event)"></canvas>
    </div>
  `,
  styles: [
    `
      .crop-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
      }
      .overlay-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        touch-action: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvCropCanvasComponent implements OnChanges, OnDestroy, AfterViewInit {
  private canvasService = inject(ImageCanvasService);
  private stateService = inject(ImageEditorStateService);

  @Input() imageSrc: string | null = null;
  @Input() aspectRatio: number | null = null;
  @Input() isCircle = false;

  private _externalCrop: AvRect | null = null;
  @Input() set externalCrop(val: AvRect | null) {
    this._externalCrop = val;
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
  @ViewChild('overlayCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isReady = false;

  private cropRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };
  private imageRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };
  private naturalSize = { width: 0, height: 0 };

  private isDragging = false;
  private dragMode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null = null;
  private dragStart = { x: 0, y: 0 };
  private startCropRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };

  private mouseMoveListener: any;
  private mouseUpListener: any;

  constructor() {
    this.mouseMoveListener = this.onMouseMove.bind(this);
    this.mouseUpListener = this.onMouseUp.bind(this);

    effect(() => {
      const size = this.canvasService.canvasSize();
      const zoom = this.canvasService.zoom();
      const version = this.canvasService.imageVersion(); // Зависимость от смены изображения

      const msg = `[CROP] Effect: size=${size.width}x${size.height}, zoom=${zoom}, v=${version}`;
      console.log(msg);
      this.stateService.addLogToHistory(msg);

      // Вызываем обновление метрик без создания зависимости от того, что внутри updateMetrics
      untracked(() => {
        if (this.isReady) {
          console.log('[CROP] Effect calling updateMetrics');
          this.updateMetrics();

          // Если есть внешний кроп - применяем его, иначе пересчитываем по центру
          if (this.externalCrop) {
            const extMsg = `[CROP] Applying external: ${JSON.stringify(this.externalCrop)}`;
            console.log(extMsg);
            this.stateService.addLogToHistory(extMsg);
            this.applyExternalCrop(this.externalCrop);
          } else {
            const resetMsg = '[CROP] Resetting to center from effect';
            console.log(resetMsg);
            this.stateService.addLogToHistory(resetMsg);
            this.resetCropToCenter();
          }
        } else {
          console.log('[CROP] Effect skipped - not ready yet');
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aspectRatio'] && !changes['aspectRatio'].firstChange) {
      if (this.isReady && this.aspectRatio) {
        this.forceAspectRatio();
        this.draw();
        this.emitCropChange();
      }
    }
    if (changes['externalCrop'] && !changes['externalCrop'].firstChange) {
      if (this.isReady && this._externalCrop) {
        this.applyExternalCrop(this._externalCrop);
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.mouseMoveListener);
      window.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  ngAfterViewInit() {
    console.log('[CROP] ngAfterViewInit');
    this.stateService.addLogToHistory('[CROP] ngAfterViewInit');
    // Ждем, пока ImageCanvasService загрузит изображение
    setTimeout(() => {
      const img = this.canvasService.getImage();
      const msg = `[CROP] Checking for image: ${img ? 'Found' : 'Missing'}`;
      console.log(msg, img);
      this.stateService.addLogToHistory(msg);
      if (img) {
        this.onImageReady();
      }
    }, 100);
  }

  private onImageReady() {
    console.log('[CROP] onImageReady');
    this.stateService.addLogToHistory('[CROP] onImageReady');
    this.isReady = true;
    const img = this.canvasService.getImage();
    if (!img) return;

    this.naturalSize = { width: img.naturalWidth, height: img.naturalHeight };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.updateMetrics();
        if (this.externalCrop) {
          this.applyExternalCrop(this.externalCrop);
        } else {
          this.resetCropToCenter();
        }
        this.ready.emit();
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener);
      });
    });
  }

  private updateMetrics() {
    const img = this.canvasService.getImage();
    if (!img) return;

    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    const canvasSize = this.canvasService.canvasSize();
    const zoom = this.canvasService.zoom();

    // Размер canvas должен совпадать с основным editor-canvas
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    canvas.style.width = canvasSize.width + 'px';
    canvas.style.height = canvasSize.height + 'px';

    // Размер изображения с учетом zoom
    const displayWidth = img.naturalWidth * zoom;
    const displayHeight = img.naturalHeight * zoom;

    // Позиция изображения (по центру canvas)
    this.imageRect = {
      x: (canvasSize.width - displayWidth) / 2,
      y: (canvasSize.height - displayHeight) / 2,
      width: displayWidth,
      height: displayHeight,
    };

    const metricsMsg = `[CROP] updateMetrics: canvas=${canvas.width}x${
      canvas.height
    }, imgRect=${JSON.stringify(this.imageRect)}`;
    console.log(metricsMsg);
    this.stateService.addLogToHistory(metricsMsg);

    this.ctx = canvas.getContext('2d')!;
  }

  private resetCropToCenter() {
    // Изображение теперь центрировано в canvas, используем imageRect для расчета
    const w = this.imageRect.width;
    const h = this.imageRect.height;
    let cropW = w * 0.8;
    let cropH = h * 0.8;

    if (this.aspectRatio || this.isCircle) {
      const ar = this.isCircle ? 1 : this.aspectRatio!;
      if (cropW / cropH > ar) {
        cropW = cropH * ar;
      } else {
        cropH = cropW / ar;
      }
    }

    // Crop координаты относительно imageRect (который уже учитывает центрирование)
    this.cropRect = {
      x: this.imageRect.x + (w - cropW) / 2,
      y: this.imageRect.y + (h - cropH) / 2,
      width: cropW,
      height: cropH,
    };

    console.log('[CROP] resetCropToCenter:', {
      imageRect: this.imageRect,
      cropSize: { w: cropW, h: cropH },
      cropRect: this.cropRect,
    });

    this.draw();
    this.emitCropChange();
  }

  private draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cvs = this.canvasRef.nativeElement;
    const rect = this.cropRect;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // 1. Рисуем затемнение (Overlay)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // 2. Прорезаем «дырку»
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    if (this.isCircle) {
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const r = Math.min(rect.width, rect.height) / 2;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    ctx.fill();
    ctx.restore();

    // 3. Рисуем рамку
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.isCircle) {
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const r = Math.min(rect.width, rect.height) / 2;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    ctx.stroke();

    // 4. Сетка и ручки
    if (!this.isCircle) {
      this.drawGrid(ctx, rect);
    }
    this.drawHandles(ctx, rect);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, rect: AvRect) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    const dw = rect.width / 3;
    const dh = rect.height / 3;
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(rect.x + dw * i, rect.y);
      ctx.lineTo(rect.x + dw * i, rect.y + rect.height);
      ctx.moveTo(rect.x, rect.y + dh * i);
      ctx.lineTo(rect.x + rect.width, rect.y + dh * i);
    }
    ctx.stroke();
  }

  private drawHandles(ctx: CanvasRenderingContext2D, rect: AvRect) {
    const s = 8;
    this.drawHandleRect(ctx, rect.x, rect.y, s);
    this.drawHandleRect(ctx, rect.x + rect.width, rect.y, s);
    this.drawHandleRect(ctx, rect.x, rect.y + rect.height, s);
    this.drawHandleRect(ctx, rect.x + rect.width, rect.y + rect.height, s);
  }

  private drawHandleRect(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    ctx.strokeRect(x - s / 2, y - s / 2, s, s);
  }

  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    const { x, y } = this.getMousePos(e);
    const handle = this.getHandleAt(x, y);
    if (handle) this.dragMode = handle;
    else if (this.isPointInsideCrop(x, y)) this.dragMode = 'move';
    else return;

    this.isDragging = true;
    this.dragStart = { x, y };
    this.startCropRect = { ...this.cropRect };
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || !this.dragMode) return;
    const { x, y } = this.getMousePos(e);
    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;

    const newRect = { ...this.startCropRect };

    if (this.dragMode === 'move') {
      newRect.x += dx;
      newRect.y += dy;
      // Ограничиваем рамками изображения (imageRect)
      newRect.x = Math.max(
        this.imageRect.x,
        Math.min(newRect.x, this.imageRect.x + this.imageRect.width - newRect.width),
      );
      newRect.y = Math.max(
        this.imageRect.y,
        Math.min(newRect.y, this.imageRect.y + this.imageRect.height - newRect.height),
      );
    } else {
      const isE = this.dragMode.includes('e');
      const isW = this.dragMode.includes('w');
      const isS = this.dragMode.includes('s');
      const isN = this.dragMode.includes('n');

      if (isE) newRect.width = Math.max(20, this.startCropRect.width + dx);
      if (isS) newRect.height = Math.max(20, this.startCropRect.height + dy);
      if (isW) {
        const w = Math.max(20, this.startCropRect.width - dx);
        newRect.x = this.startCropRect.x + (this.startCropRect.width - w);
        newRect.width = w;
      }
      if (isN) {
        const h = Math.max(20, this.startCropRect.height - dy);
        newRect.y = this.startCropRect.y + (this.startCropRect.height - h);
        newRect.height = h;
      }

      if (this.aspectRatio) {
        // More robust AR logic
        if (isE && isS) {
          // SE
          if (newRect.width / newRect.height > this.aspectRatio)
            newRect.width = newRect.height * this.aspectRatio;
          else newRect.height = newRect.width / this.aspectRatio;
        } else if (isW && isS) {
          // SW
          const oldW = newRect.width;
          if (newRect.width / newRect.height > this.aspectRatio)
            newRect.width = newRect.height * this.aspectRatio;
          else newRect.height = newRect.width / this.aspectRatio;
          newRect.x += oldW - newRect.width;
        } else if (isE && isN) {
          // NE
          const oldH = newRect.height;
          if (newRect.width / newRect.height > this.aspectRatio)
            newRect.width = newRect.height * this.aspectRatio;
          else newRect.height = newRect.width / this.aspectRatio;
          newRect.y += oldH - newRect.height;
        } else if (isW && isN) {
          // NW
          const oldW = newRect.width;
          const oldH = newRect.height;
          if (newRect.width / newRect.height > this.aspectRatio)
            newRect.width = newRect.height * this.aspectRatio;
          else newRect.height = newRect.width / this.aspectRatio;
          newRect.x += oldW - newRect.width;
          newRect.y += oldH - newRect.height;
        }
      }

      // Final clamping to imageRect
      if (newRect.x < this.imageRect.x) {
        newRect.width -= this.imageRect.x - newRect.x;
        newRect.x = this.imageRect.x;
        if (this.aspectRatio) newRect.height = newRect.width / this.aspectRatio;
      }
      if (newRect.y < this.imageRect.y) {
        newRect.height -= this.imageRect.y - newRect.y;
        newRect.y = this.imageRect.y;
        if (this.aspectRatio) newRect.width = newRect.height * this.aspectRatio;
      }
      if (newRect.x + newRect.width > this.imageRect.x + this.imageRect.width) {
        newRect.width = this.imageRect.x + this.imageRect.width - newRect.x;
        if (this.aspectRatio) newRect.height = newRect.width / this.aspectRatio;
      }
      if (newRect.y + newRect.height > this.imageRect.y + this.imageRect.height) {
        newRect.height = this.imageRect.y + this.imageRect.height - newRect.y;
        if (this.aspectRatio) newRect.width = newRect.height * this.aspectRatio;
      }
    }

    this.cropRect = newRect;
    this.draw();
    this.emitCropChange();
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragMode = null;
  }

  private getMousePos(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private getHandleAt(x: number, y: number): 'nw' | 'ne' | 'sw' | 'se' | null {
    const r = this.cropRect;
    const s = 15;
    if (this.hitTest(x, y, r.x, r.y, s)) return 'nw';
    if (this.hitTest(x, y, r.x + r.width, r.y, s)) return 'ne';
    if (this.hitTest(x, y, r.x, r.y + r.height, s)) return 'sw';
    if (this.hitTest(x, y, r.x + r.width, r.y + r.height, s)) return 'se';
    return null;
  }

  private hitTest(mx: number, my: number, x: number, y: number, s: number) {
    return mx >= x - s && mx <= x + s && my >= y - s && my <= y + s;
  }

  private isPointInsideCrop(x: number, y: number) {
    const r = this.cropRect;
    return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
  }

  private applyExternalCrop(ext: AvRect) {
    const sX = this.imageRect.width / this.naturalSize.width;
    const sY = this.imageRect.height / this.naturalSize.height;
    this.cropRect = {
      x: this.imageRect.x + ext.x * sX,
      y: this.imageRect.y + ext.y * sY,
      width: ext.width * sX,
      height: ext.height * sY,
    };
    const logMsg = `[CROP] applyExternal: x=${this.cropRect.x.toFixed(
      1,
    )}, y=${this.cropRect.y.toFixed(1)}`;
    console.log(logMsg);
    this.stateService.addLogToHistory(logMsg);
    this.draw();
  }

  private emitCropChange() {
    if (this.imageRect.width === 0) return;
    const sX = this.naturalSize.width / this.imageRect.width;
    const sY = this.naturalSize.height / this.imageRect.height;

    const naturalRect = {
      x: Math.round((this.cropRect.x - this.imageRect.x) * sX),
      y: Math.round((this.cropRect.y - this.imageRect.y) * sY),
      width: Math.round(this.cropRect.width * sX),
      height: Math.round(this.cropRect.height * sY),
    };

    this.cropChange.emit(naturalRect);
  }

  private forceAspectRatio() {
    if (!this.aspectRatio) return;
    const cx = this.cropRect.x + this.cropRect.width / 2;
    const cy = this.cropRect.y + this.cropRect.height / 2;
    let w = this.cropRect.width;
    let h = w / this.aspectRatio;
    if (h > this.imageRect.height) {
      h = this.imageRect.height;
      w = h * this.aspectRatio;
    }
    this.cropRect = { x: cx - w / 2, y: cy - h / 2, width: w, height: h };

    // Clamping
    if (this.cropRect.x < this.imageRect.x) this.cropRect.x = this.imageRect.x;
    if (this.cropRect.y < this.imageRect.y) this.cropRect.y = this.imageRect.y;
    if (this.cropRect.x + this.cropRect.width > this.imageRect.x + this.imageRect.width) {
      this.cropRect.x = this.imageRect.x + this.imageRect.width - this.cropRect.width;
    }
    if (this.cropRect.y + this.cropRect.height > this.imageRect.y + this.imageRect.height) {
      this.cropRect.y = this.imageRect.y + this.imageRect.height - this.cropRect.height;
    }
  }
}
