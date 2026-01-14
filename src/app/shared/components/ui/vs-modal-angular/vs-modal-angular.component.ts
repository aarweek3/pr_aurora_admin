import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzResizableModule, NzResizeEvent } from 'ng-zorro-antd/resizable';

@Component({
  selector: 'app-vs-modal-angular',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzResizableModule],
  template: `
    <div
      #resizableContainer
      class="resizable-container"
      nz-resizable
      [nzMinWidth]="300"
      [nzMinHeight]="200"
      (nzOnResize)="onResize($any($event))"
    >
      <!-- Скрытые, но широкие зоны захвата по краям -->
      <nz-resize-handle nzDirection="right">
        <div class="resize-trigger right"></div>
      </nz-resize-handle>
      <nz-resize-handle nzDirection="bottom">
        <div class="resize-trigger bottom"></div>
      </nz-resize-handle>
      <nz-resize-handle nzDirection="bottomRight">
        <div class="resize-trigger corner"></div>
      </nz-resize-handle>

      <div class="modal-content">
        <h3>🎯 Стандартный Ng-Zorro</h3>
        <p>У этой модалки нет нативного <code>nzResizable</code>.</p>
        <p>Мы используем <b>NZ-RESIZABLE</b> директиву на внутреннем контейнере.</p>

        <div class="size-info">Текущий размер: {{ currentWidth }} x {{ currentHeight }}</div>

        <div style="margin-top: 24px;">
          <button nz-button nzType="primary" (click)="close()">Закрыть</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .resizable-container {
        position: relative;
        background: #fff;
        min-height: 200px;
        /* Важно: контейнер должен занимать всё место в теле модалки */
        width: 100%;
        overflow: hidden;
      }

      .modal-content {
        padding: 40px 24px;
        text-align: center;
      }

      .size-info {
        margin-top: 10px;
        font-family: monospace;
        color: #999;
        font-size: 11px;
      }

      /* Триггеры для ресайза — делаем их невидимыми, но широкими */
      .resize-trigger {
        position: absolute;
        background: transparent;
        z-index: 100;
      }

      .resize-trigger.right {
        top: 0;
        right: -5px;
        width: 15px;
        height: 100%;
        cursor: e-resize;
      }

      .resize-trigger.bottom {
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 15px;
        cursor: s-resize;
      }

      .resize-trigger.corner {
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        /* Рисуем маленький уголок для подсказки */
        background: linear-gradient(135deg, transparent 70%, #ddd 70%);
      }

      h3 {
        color: #1890ff;
        margin-bottom: 8px;
      }
      p {
        color: #666;
        font-size: 13px;
      }
    `,
  ],
})
export class VsModalAngularComponent {
  private readonly modalRef = inject(NzModalRef);

  @ViewChild('resizableContainer') container!: ElementRef<HTMLElement>;

  currentWidth = 500;
  currentHeight = 250;

  onResize({ width, height }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      if (width) {
        this.currentWidth = Math.round(width);
        // Обновляем ширину самой модалки
        this.modalRef.updateConfig({ nzWidth: width });
      }
      if (height) {
        this.currentHeight = Math.round(height);
        // Обновляем высоту блока (модалка растянется вслед за ним)
        if (this.container) {
          this.container.nativeElement.style.height = `${height}px`;
        }
      }
    });
  }

  private id = -1;

  close(): void {
    this.modalRef.destroy();
  }
}
