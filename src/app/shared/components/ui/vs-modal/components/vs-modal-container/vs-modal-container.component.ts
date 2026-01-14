import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Pipe, PipeTransform } from '@angular/core';
import { VSModalRef } from '../../models/vs-modal-ref.model';
import { VSModalConfig } from '../../models/vs-modal.config';
import { VS_MODAL_CONFIG } from '../../tokens/vs-modal.tokens';

/**
 * Пайп для безопасного преобразования размеров (число -> px, строка -> как есть)
 */
@Pipe({
  name: 'vsSafeDimension',
  standalone: true,
})
export class VsSafeDimensionPipe implements PipeTransform {
  transform(value: string | number | undefined): string {
    if (value === undefined || value === null) return 'auto';
    return typeof value === 'number' ? `${value}px` : value;
  }
}

@Component({
  selector: 'vs-modal-container',
  standalone: true,
  imports: [CommonModule, DragDropModule, PortalModule, VsSafeDimensionPipe],
  templateUrl: './vs-modal-container.component.html',
  styleUrls: ['./vs-modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VSModalContainerComponent {
  readonly config = inject<VSModalConfig>(VS_MODAL_CONFIG);
  readonly modalRef = inject<VSModalRef>(VSModalRef);

  /** Портал для загрузки дочернего компонента */
  portal?: ComponentPortal<any>;

  close(): void {
    this.modalRef.close();
  }

  minimize(event: MouseEvent): void {
    event.stopPropagation();
    // Логика сворачивания (MVP: просто лог)
    console.log('VS Modal: Minimize requested');
  }

  maximize(event: MouseEvent): void {
    event.stopPropagation();
    // Логика разворачивания (MVP: просто лог)
    console.log('VS Modal: Maximize requested');
  }

  /**
   * Начало изменения размера (правый нижний угол)
   */
  onResizeStart(event: MouseEvent): void {
    if (!this.config.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = parseInt(this.modalRef.config.width) || 400; // Упрощенно для MVP
    const startHeight = parseInt(this.modalRef.config.height) || 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(
        this.config.minWidth || 200,
        startWidth + (moveEvent.clientX - startX),
      );
      const newHeight = Math.max(
        this.config.minHeight || 100,
        startHeight + (moveEvent.clientY - startY),
      );

      // Обновляем напрямую через конфиг/DOM (упрощено для MVP)
      const element = (event.target as HTMLElement).closest('.vs-modal-shell') as HTMLElement;
      if (element) {
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
