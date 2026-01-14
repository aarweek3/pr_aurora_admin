import {
  Component,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  inject,
  AfterViewInit,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { VSModalConfig } from '../../models/vs-modal-config.model';
import { VSModalRef } from '../../models/vs-modal-ref.model';
import { VS_MODAL_CONFIG } from '../../models/vs-modal-data.token';

/**
 * Визуальная оболочка модального окна в стиле VS Code
 */
@Component({
  selector: 'vs-modal-container',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDragHandle],
  templateUrl: './vs-modal-container.component.html',
  styleUrls: ['./vs-modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VSModalContainerComponent implements AfterViewInit {
  @ViewChild('contentHost', { read: ViewContainerRef, static: true })
  contentHost!: ViewContainerRef;

  config = inject<VSModalConfig>(VS_MODAL_CONFIG);
  modalRef = inject(VSModalRef);

  // Сигналы для реактивности
  isResizing = signal(false);

  private startWidth = 0;
  private startHeight = 0;
  private startX = 0;
  private startY = 0;

  ngAfterViewInit(): void {
    // Компонент будет вставлен извне через ComponentPortal
  }

  /**
   * Закрывает модальное окно
   */
  close(): void {
    this.modalRef.close();
  }

  /**
   * Начало изменения размера окна
   */
  onResizeStart(event: MouseEvent): void {
    if (!this.config.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    this.isResizing.set(true);

    const containerElement = (event.target as HTMLElement).closest(
      '.vs-modal-window',
    ) as HTMLElement;
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startX = event.clientX;
    this.startY = event.clientY;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      const newWidth = Math.max(this.startWidth + deltaX, 400);
      const newHeight = Math.max(this.startHeight + deltaY, 300);

      containerElement.style.width = `${newWidth}px`;
      containerElement.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      this.isResizing.set(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Получает стили для окна
   */
  getWindowStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    if (this.config.width) {
      styles['width'] =
        typeof this.config.width === 'number'
          ? `${this.config.width}px`
          : this.config.width;
    }

    if (this.config.height) {
      styles['height'] =
        typeof this.config.height === 'number'
          ? `${this.config.height}px`
          : this.config.height;
    }

    return styles;
  }
}
