import { inject, Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AvMonitorConfig } from '../models/monitor-modal.model';
import { AvMonitorModalComponent } from '../monitor-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AvMonitorService {
  private readonly modalService = inject(NzModalService);

  /**
   * Открыть окно мониторинга
   * @param config Конфигурация данных для отображения
   */
  show(config: AvMonitorConfig): void {
    this.modalService.create({
      nzTitle: config.title || 'Мониторинг данных',
      nzContent: AvMonitorModalComponent,
      nzData: config,
      nzWidth: config.width || '1200px',
      nzDraggable: config.draggable !== false,
      nzFooter: null,
      nzClosable: true, // Включаем стандартный крестик для драга за хедер
      nzMaskClosable: true,
      nzStyle: { top: '50px' },
      nzBodyStyle: { padding: '0' }, // Убираем padding чтобы наш контейнер прилегал к краям
    });
  }
}
