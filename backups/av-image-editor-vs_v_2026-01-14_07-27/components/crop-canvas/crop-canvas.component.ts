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
      <img #imageElement [src]="imageSrc" class="source-image" (load)="onImageLoad()" />
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
        pointer-events: none;
        object-fit: contain;
      }
      .overlay-canvas {
        position: absolute;
        pointer-events: auto;
        touch-action: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvCropCanvasComponent implements OnChanges, OnDestroy {
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
  @ViewChild('imageElement') imageRef!: ElementRef<HTMLImageElement>;
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

  onImageLoad() {
    this.isReady = true;
    const img = this.imageRef.nativeElement;
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
    const img = this.imageRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    this.imageRect = {
      x: img.offsetLeft,
      y: img.offsetTop,
      width: img.offsetWidth,
      height: img.offsetHeight,
    };
    canvas.width = this.imageRect.width;
    canvas.height = this.imageRect.height;
    canvas.style.left = this.imageRect.x + 'px';
    canvas.style.top = this.imageRect.y + 'px';
    this.ctx = canvas.getContext('2d')!;
  }

  private resetCropToCenter() {
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

    this.cropRect = {
      x: (w - cropW) / 2,
      y: (h - cropH) / 2,
      width: cropW,
      height: cropH,
    };
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
    let dx = x - this.dragStart.x;
    let dy = y - this.dragStart.y;

    let newRect = { ...this.startCropRect };

    if (this.dragMode === 'move') {
      newRect.x += dx;
      newRect.y += dy;
      newRect.x = Math.max(0, Math.min(newRect.x, this.imageRect.width - newRect.width));
      newRect.y = Math.max(0, Math.min(newRect.y, this.imageRect.height - newRect.height));
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

      // Final clamping
      if (newRect.x < 0) {
        newRect.width += newRect.x;
        newRect.x = 0;
        if (this.aspectRatio) newRect.height = newRect.width / this.aspectRatio;
      }
      if (newRect.y < 0) {
        newRect.height += newRect.y;
        newRect.y = 0;
        if (this.aspectRatio) newRect.width = newRect.height * this.aspectRatio;
      }
      if (newRect.x + newRect.width > this.imageRect.width) {
        newRect.width = this.imageRect.width - newRect.x;
        if (this.aspectRatio) newRect.height = newRect.width / this.aspectRatio;
      }
      if (newRect.y + newRect.height > this.imageRect.height) {
        newRect.height = this.imageRect.height - newRect.y;
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
      x: ext.x * sX,
      y: ext.y * sY,
      width: ext.width * sX,
      height: ext.height * sY,
    };
    this.draw();
  }

  private emitCropChange() {
    if (this.imageRect.width === 0) return;
    const sX = this.naturalSize.width / this.imageRect.width;
    const sY = this.naturalSize.height / this.imageRect.height;
    this.cropChange.emit({
      x: Math.round(this.cropRect.x * sX),
      y: Math.round(this.cropRect.y * sY),
      width: Math.round(this.cropRect.width * sX),
      height: Math.round(this.cropRect.height * sY),
    });
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
  }
}
