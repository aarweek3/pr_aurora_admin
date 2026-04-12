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

    // Убираем DPR, как условились (1css = 1canvas), можно 1:1
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.canvasService.updateCanvasSize(width, height);
  }

  // --- Взаимодействие отключено (панорамирование/зум убраны по требованию) ---

  onWheel(event: WheelEvent): void {}
  onMouseDown(event: MouseEvent): void {}
  onMouseMove(event: MouseEvent): void {}
  onMouseUp(): void {}
}
