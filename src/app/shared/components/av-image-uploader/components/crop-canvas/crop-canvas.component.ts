import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { AvPoint, AvRect } from '../../av-image.model';

@Component({
  selector: 'app-crop-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crop-container" #container (mousedown)="onContainerMouseDown($event)">
      <!-- 1. Изображение (нижний слой) -->
      <img
        #imageElement
        [src]="imageSrc"
        class="source-image"
        (load)="onImageLoad()"
        [style.transform]="activeTransform"
      />

      <!-- 2. Оверлей (затемнение) -->
      <div class="overlay" *ngIf="isImageLoaded()"></div>

      <!-- 3. Кроп-рамка -->
      <div
        class="crop-box"
        [style.left.px]="uiRect().x"
        [style.top.px]="uiRect().y"
        [style.width.px]="uiRect().width"
        [style.height.px]="uiRect().height"
        (mousedown)="onBoxMouseDown($event)"
      >
        <!-- Сетка (Grid) -->
        <div class="grid-lines"></div>

        <!-- Ручки (Handles) -->
        <div class="handle nw" (mousedown)="onHandleDown($event, 'nw')"></div>
        <div class="handle ne" (mousedown)="onHandleDown($event, 'ne')"></div>
        <div class="handle sw" (mousedown)="onHandleDown($event, 'sw')"></div>
        <div class="handle se" (mousedown)="onHandleDown($event, 'se')"></div>
      </div>
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
        /* Важно: ограничиваем картинку, но сохраняем её натуральные пропорции при отображении */
        max-width: 95%;
        max-height: 95%;
        display: block;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        pointer-events: none;
      }

      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: none;
      }

      .crop-box {
        position: absolute;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        outline: 1px solid rgba(255, 255, 255, 0.9);
        z-index: 10;
        cursor: move;
      }

      .grid-lines {
        width: 100%;
        height: 100%;
        position: absolute;
        pointer-events: none;
        opacity: 0.4;
        background-image:
          linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
        background-size: 33.3% 33.3%;
      }

      .handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #fff;
        border: 1px solid #000;
        border-radius: 50%;
        z-index: 20;
      }
      .nw {
        top: -5px;
        left: -5px;
        cursor: nw-resize;
      }
      .ne {
        top: -5px;
        right: -5px;
        cursor: ne-resize;
      }
      .sw {
        bottom: -5px;
        left: -5px;
        cursor: sw-resize;
      }
      .se {
        bottom: -5px;
        right: -5px;
        cursor: se-resize;
      }

      .handle::after {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
      }
    `,
  ],
})
export class CropCanvasComponent implements OnInit, OnDestroy, OnChanges {
  @Input() imageSrc: string | null = null;
  @Input() aspectRatio: number | null = null; // null = Free

  // Вход для управления размерами извне (например, из инпутов)
  @Input() set externalCrop(rect: AvRect | null) {
    if (rect && this.isImageLoaded()) {
      this.applyExternalCrop(rect);
    }
  }

  @Output() cropChange = new EventEmitter<AvRect>();

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageRef!: ElementRef<HTMLImageElement>;

  uiRect = signal<AvRect>({ x: 0, y: 0, width: 0, height: 0 });
  isImageLoaded = signal(false);

  protected activeTransform = '';
  private dragMode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null = null;
  private startPoint: AvPoint = { x: 0, y: 0 };
  private startRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };
  private imageRect: AvRect = { x: 0, y: 0, width: 0, height: 0 };

  private mouseMoveListener: any;
  private mouseUpListener: any;

  constructor() {}

  ngOnInit(): void {
    this.mouseMoveListener = this.onMouseMove.bind(this);
    this.mouseUpListener = this.onMouseUp.bind(this);
    window.addEventListener('mousemove', this.mouseMoveListener, {
      passive: false,
    });
    window.addEventListener('mouseup', this.mouseUpListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aspectRatio'] && !changes['aspectRatio'].firstChange && this.isImageLoaded()) {
      this.resetCropToCenter();
    }
  }

  onImageLoad() {
    this.isImageLoaded.set(true);
    setTimeout(() => {
      this.updateImageMetrics();
      this.resetCropToCenter();
    }, 50);
  }

  private updateImageMetrics() {
    if (!this.imageRef || !this.containerRef) return;
    const img = this.imageRef.nativeElement;

    this.imageRect = {
      x: img.offsetLeft,
      y: img.offsetTop,
      width: img.offsetWidth,
      height: img.offsetHeight,
    };
  }

  private resetCropToCenter() {
    if (!this.isImageLoaded()) return;

    const ir = this.imageRect;
    let w = ir.width * 0.8;
    let h = ir.height * 0.8;

    if (this.aspectRatio) {
      if (w / h > this.aspectRatio) {
        w = h * this.aspectRatio;
      } else {
        h = w / this.aspectRatio;
      }
    }

    const x = ir.x + (ir.width - w) / 2;
    const y = ir.y + (ir.height - h) / 2;

    this.updateUiRect({ x, y, width: w, height: h });
    this.emitCropChange();
  }

  private applyExternalCrop(realRect: AvRect) {
    if (!this.imageRef) return;
    const img = this.imageRef.nativeElement;

    // Protect against division by zero if img not loaded yet
    if (img.naturalWidth === 0) return;

    const scaleX = this.imageRect.width / img.naturalWidth;
    const scaleY = this.imageRect.height / img.naturalHeight;

    const uiRect: AvRect = {
      x: this.imageRect.x + realRect.x * scaleX,
      y: this.imageRect.y + realRect.y * scaleY,
      width: realRect.width * scaleX,
      height: realRect.height * scaleY,
    };

    this.updateUiRect(uiRect);
  }

  // --- MOUSE EVENTS ---

  onContainerMouseDown(e: MouseEvent) {
    // Optional
  }

  onBoxMouseDown(e: MouseEvent) {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    this.startDrag(e, 'move');
  }

  onHandleDown(e: MouseEvent, mode: 'nw' | 'ne' | 'sw' | 'se') {
    e.preventDefault();
    e.stopPropagation();
    this.startDrag(e, mode);
  }

  private startDrag(e: MouseEvent, mode: any) {
    this.updateImageMetrics();
    this.dragMode = mode;
    this.startPoint = { x: e.clientX, y: e.clientY };
    this.startRect = { ...this.uiRect() };
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.dragMode) return;

    e.preventDefault();
    const dx = e.clientX - this.startPoint.x;
    const dy = e.clientY - this.startPoint.y;
    const newRect = { ...this.startRect };

    if (this.dragMode === 'move') {
      newRect.x += dx;
      newRect.y += dy;
      this.constrainRect(newRect);
    } else {
      if (this.dragMode.includes('e')) newRect.width = Math.max(20, this.startRect.width + dx);
      if (this.dragMode.includes('s')) newRect.height = Math.max(20, this.startRect.height + dy);
      if (this.dragMode.includes('w')) {
        const w = Math.max(20, this.startRect.width - dx);
        newRect.x = this.startRect.x + (this.startRect.width - w);
        newRect.width = w;
      }
      if (this.dragMode.includes('n')) {
        const h = Math.max(20, this.startRect.height - dy);
        newRect.y = this.startRect.y + (this.startRect.height - h);
        newRect.height = h;
      }

      if (this.aspectRatio) {
        if (this.dragMode === 'se' || this.dragMode === 'sw') {
          newRect.height = newRect.width / this.aspectRatio;
        }
      }
    }

    this.updateUiRect(newRect);
    this.emitCropChange();
  }

  private onMouseUp() {
    if (this.dragMode) {
      this.emitCropChange();
      this.dragMode = null;
    }
  }

  private constrainRect(rect: AvRect) {
    const bounds = this.imageRect;
    if (rect.x < bounds.x) rect.x = bounds.x;
    if (rect.y < bounds.y) rect.y = bounds.y;
    if (rect.x + rect.width > bounds.x + bounds.width)
      rect.x = bounds.x + bounds.width - rect.width;
    if (rect.y + rect.height > bounds.y + bounds.height)
      rect.y = bounds.y + bounds.height - rect.height;
  }

  private updateUiRect(rect: AvRect) {
    this.uiRect.set(rect);
  }

  private emitCropChange() {
    if (!this.imageRef) return;
    const img = this.imageRef.nativeElement;

    if (this.imageRect.width === 0 || this.imageRect.height === 0) return;

    const scaleX = img.naturalWidth / this.imageRect.width;
    const scaleY = img.naturalHeight / this.imageRect.height;

    const realCrop: AvRect = {
      x: (this.uiRect().x - this.imageRect.x) * scaleX,
      y: (this.uiRect().y - this.imageRect.y) * scaleY,
      width: this.uiRect().width * scaleX,
      height: this.uiRect().height * scaleY,
    };

    realCrop.x = Math.max(0, Math.round(realCrop.x));
    realCrop.y = Math.max(0, Math.round(realCrop.y));
    realCrop.width = Math.round(realCrop.width);
    realCrop.height = Math.round(realCrop.height);

    this.cropChange.emit(realCrop);
  }
}
