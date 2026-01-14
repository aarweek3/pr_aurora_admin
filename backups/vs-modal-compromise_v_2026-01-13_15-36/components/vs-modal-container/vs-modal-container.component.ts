import { CdkDragEnd, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Pipe, PipeTransform, signal } from '@angular/core';
import { VSModalConfig } from '../../models/vs-modal-config.model';
import { VS_MODAL_CONFIG } from '../../models/vs-modal-data.token';
import { VSModalRef } from '../../models/vs-modal-ref.model';

/**
 * Пайп для безопасного задания размеров окна
 */
@Pipe({
  name: 'vsSafeDimension',
  standalone: true,
})
export class VsSafeDimensionPipe implements PipeTransform {
  transform(value: string | number | undefined): string {
    if (!value) return 'auto';
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

  /** Портал контента, устанавливаемый сервисом */
  portal?: ComponentPortal<any>;

  /** Флаг отображения debug панели */
  showDebug = signal(false);

  /** Временно отключаем drag во время resize */
  isDragDisabled = signal(false);

  /** Доступ к window для шаблона */
  readonly window = window;

  onMinimize(): void {
    console.log('VS Modal: Minimize requested');
  }

  onMaximize(): void {
    console.log('VS Modal: Maximize requested');
  }

  /**
   * Переключить отображение debug панели
   */
  toggleDebug(): void {
    const newState = !this.showDebug();
    this.showDebug.set(newState);

    if (newState) {
      this.updateDebugInfo();
    } else {
      this.modalRef.debugInfo.set(null);
    }
  }

  /**
   * Обновить debug info для текущего элемента
   */
  private updateDebugInfo(element?: HTMLElement, action: 'drag' | 'resize' | 'init' | 'adjust' = 'init'): void {
    if (!this.showDebug()) return;

    const container = element || (document.querySelector('.vs-modal-shell') as HTMLElement);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const debugData = {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
    };

    this.modalRef.debugInfo.set(debugData);
    this.modalRef.addDebugHistoryEntry(action, debugData);
  }

  /**
   * Обработчик движения при drag
   */
  onDragMoved(event: CdkDragMove): void {
    // Debug логирование
    if (this.showDebug()) {
      const container = event.source.element.nativeElement;
      this.updateDebugInfo(container, 'drag');
    }
  }

  /**
   * Обработчик завершения drag
   */
  onDragEnded(event: CdkDragEnd): void {
    // Проверяем границы viewport и корректируем если нужно
    const container = event.source.element.nativeElement;
    const rect = container.getBoundingClientRect();

    let needsCorrection = false;
    let correctedTop = rect.top;
    let correctedLeft = rect.left;

    // Проверка верхней границы - НЕ ДАЕМ уйти за верхний край
    if (rect.top < 0) {
      correctedTop = 0;
      needsCorrection = true;
    }

    // Проверка левой границы - минимум 10px должно быть видно
    if (rect.left < -rect.width + 100) {
      correctedLeft = -rect.width + 100;
      needsCorrection = true;
    }

    // Проверка правой границы - минимум 100px должно быть видно
    if (rect.right < 100) {
      correctedLeft = 100 - rect.width;
      needsCorrection = true;
    }

    // Проверка нижней границы - заголовок должен быть виден
    const headerHeight = 35;
    if (rect.top > window.innerHeight - headerHeight) {
      correctedTop = window.innerHeight - headerHeight;
      needsCorrection = true;
    }

    // Применяем коррекцию ТОЛЬКО если реально вышли за границы
    if (needsCorrection) {
      const currentTransform = event.source.getFreeDragPosition();
      const deltaTop = correctedTop - rect.top;
      const deltaLeft = correctedLeft - rect.left;

      event.source.setFreeDragPosition({
        x: currentTransform.x + deltaLeft,
        y: currentTransform.y + deltaTop,
      });

      // Логируем коррекцию
      if (this.showDebug()) {
        this.updateDebugInfo(container, 'adjust');
        console.log('🔧 Adjusted position:', { deltaTop, deltaLeft });
      }
    } else if (this.showDebug()) {
      this.updateDebugInfo(container, 'drag');
      console.log('🎯 Drag End:', this.modalRef.debugInfo());
    }
  }

  /**
   * Скопировать debug информацию в буфер обмена
   */
  copyDebugInfo(): void {
    const info = this.modalRef.debugInfo();
    if (!info) return;

    // Проверяем переполнение
    const overflows = {
      top: info.top < 0,
      left: info.left < 0,
      right: info.right > window.innerWidth,
      bottom: info.bottom > window.innerHeight,
    };

    const hasOverflow = Object.values(overflows).some((v) => v);

    let text = `Position: top: ${info.top}px, left: ${info.left}px
Size: ${info.width}×${info.height}px
Bounds: right: ${info.right}px, bottom: ${info.bottom}px
Viewport: ${window.innerWidth}×${window.innerHeight}px

Overflow Detection:
- Top: ${overflows.top ? `⚠️ YES (${info.top}px)` : '✅ NO'}
- Left: ${overflows.left ? `⚠️ YES (${info.left}px)` : '✅ NO'}
- Right: ${overflows.right ? `⚠️ YES (by ${info.right - window.innerWidth}px)` : '✅ NO'}
- Bottom: ${overflows.bottom ? `⚠️ YES (by ${info.bottom - window.innerHeight}px)` : '✅ NO'}

Overall: ${hasOverflow ? '⚠️ WINDOW IS OUT OF BOUNDS' : '✅ WINDOW IS WITHIN BOUNDS'}`;

    navigator.clipboard.writeText(text).then(() => {
      this.modalRef.updateStatus('Debug info copied to clipboard!');
      setTimeout(() => this.modalRef.updateStatus('Ready'), 2000);
    });
  }

  /**
   * Экспортировать всю историю в JSON
   */
  exportDebugHistory(): void {
    const history = this.modalRef.debugHistory();
    if (history.length === 0) {
      this.modalRef.updateStatus('No history to export');
      setTimeout(() => this.modalRef.updateStatus('Ready'), 2000);
      return;
    }

    // Форматируем с читаемыми временными метками
    const formattedHistory = history.map((entry) => ({
      time: new Date(entry.timestamp).toISOString(),
      action: entry.action,
      position: { top: entry.top, left: entry.left },
      size: { width: entry.width, height: entry.height },
      bounds: { right: entry.right, bottom: entry.bottom },
    }));

    const json = JSON.stringify(formattedHistory, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modal-debug-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.modalRef.updateStatus(`Exported ${history.length} entries`);
    setTimeout(() => this.modalRef.updateStatus('Ready'), 2000);
  }

  /**
   * Очистить историю
   */
  clearDebugHistory(): void {
    this.modalRef.clearDebugHistory();
    this.modalRef.updateStatus('History cleared');
    setTimeout(() => this.modalRef.updateStatus('Ready'), 2000);
  }

  /**
   * Простой resize без всяких проверок границ
   */
  onResizeStart(event: MouseEvent): void {
    if (!this.config.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    const container = (event.target as HTMLElement).closest('.vs-modal-shell') as HTMLElement;
    if (!container) return;

    // Получаем текущие размеры и позицию
    const rect = container.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    const startTop = rect.top;
    const startLeft = rect.left;
    const startX = event.clientX;
    const startY = event.clientY;

    // КРИТИЧНО: Отключаем drag и фиксируем позицию
    this.isDragDisabled.set(true);
    this.modalRef.isResizing.set(true);

    // Сбрасываем transform от cdkDrag и переходим на fixed positioning
    container.style.transform = 'none';
    container.style.position = 'fixed';
    container.style.top = `${startTop}px`;
    container.style.left = `${startLeft}px`;
    container.style.width = `${startWidth}px`;
    container.style.height = `${startHeight}px`;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.max(startWidth + deltaX, this.config.minWidth || 400);
      const newHeight = Math.max(startHeight + deltaY, this.config.minHeight || 300);

      // Меняем ТОЛЬКО размеры, позиция остаётся фиксированной
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;

      // Обновляем debug info если включен
      if (this.showDebug()) {
        this.updateDebugInfo(container, 'resize');
      }
    };

    const onMouseUp = () => {
      this.modalRef.isResizing.set(false);

      // Возвращаем transform для cdkDrag
      container.style.position = '';
      container.style.transform = '';
      container.style.top = '';
      container.style.left = '';

      // Включаем drag обратно
      this.isDragDisabled.set(false);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
