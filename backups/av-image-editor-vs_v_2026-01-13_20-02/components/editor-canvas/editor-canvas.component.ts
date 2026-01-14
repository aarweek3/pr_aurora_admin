import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { ImageCanvasService } from '../../services/image-canvas.service';
import { ImageEditorStateService } from '../../services/image-editor-state.service';

@Component({
  selector: 'av-editor-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="canvas-viewport"
      #viewport
      (window:resize)="onResize()"
      (wheel)="onWheel($event)"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp()"
      (mouseleave)="onMouseUp()"
    >
      <canvas #mainCanvas></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #1e1e1e;
        position: relative;
      }
      .canvas-viewport {
        width: 100%;
        height: 100%;
        cursor: crosshair;
      }
      canvas {
        display: block;
      }
    `,
  ],
})
export class EditorCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>;
  @ViewChild('mainCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly canvasService = inject(ImageCanvasService);
  private readonly stateService = inject(ImageEditorStateService);

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId?: number;

  /** Состояние мыши для панорамирования */
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };

  constructor() {
    // Синхронизируем zoom из сервиса холста в общее состояние
    effect(() => {
      const currentZoom = this.canvasService.zoom();
      this.stateService.updateState({ zoom: Number(currentZoom.toFixed(2)) });
    });
  }

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
  }

  ngAfterViewInit(): void {
    this.onResize();
    this.startRenderLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Запуск цикла отрисовки
   */
  private startRenderLoop(): void {
    const render = () => {
      this.canvasService.draw(this.ctx);
      this.animationFrameId = requestAnimationFrame(render);
    };
    this.animationFrameId = requestAnimationFrame(render);
  }

  /**
   * Обработка изменения размера контейнера
   */
  onResize(): void {
    const container = this.viewport.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Учитываем devicePixelRatio для четкости (Retina)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
    this.canvasService.updateCanvasSize(width, height);
  }

  /**
   * Масштабирование колесиком
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.canvasService.zoom() * delta;

    // Ограничиваем зум от 5% до 1000%
    if (newZoom > 0.05 && newZoom < 10) {
      this.canvasService.zoom.set(newZoom);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Только левая кнопка
    this.isDragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.viewport.nativeElement.style.cursor = 'grabbing';
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastMousePos.x;
    const dy = event.clientY - this.lastMousePos.y;

    this.canvasService.pan(dx, dy);
    this.lastMousePos = { x: event.clientX, y: event.clientY };
  }

  onMouseUp(): void {
    this.isDragging = false;
    this.viewport.nativeElement.style.cursor = 'crosshair';
  }
}
