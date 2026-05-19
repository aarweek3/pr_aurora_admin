import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';

@Component({
  selector: 'app-button-control-json-block',
  standalone: true,
  imports: [
    NzButtonModule,
    NzIconModule,
    NzSpaceModule,
    NzToolTipModule,
    NzCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card class="maintenance-card" nzSize="small" [nzBordered]="true">
      <div class="maintenance-content">
        <nz-space nzSize="middle">
          <!-- Очистить БД -->
          <button
            *nzSpaceItem
            nz-button
            nzType="primary"
            nzDanger
            (click)="handleClear()"
            nz-tooltip
            nzTooltipTitle="Удалить все записи (платформы) из БД с обнулением Id"
            [nzLoading]="loading"
          >
            <i nz-icon nzType="delete"></i>
            Очистить БД
          </button>

          <!-- Считать данные -->
          <button
            *nzSpaceItem
            nz-button
            nzType="default"
            (click)="read.emit()"
            nz-tooltip
            nzTooltipTitle="Перечитать данные (платформы) из БД"
            [nzLoading]="loading"
          >
            <i nz-icon nzType="reload"></i>
            Считать данные из БД
          </button>

          <!-- Перенести из JSON -->
          <button
            *nzSpaceItem
            nz-button
            nzType="primary"
            (click)="seed.emit()"
            nz-tooltip
            nzTooltipTitle="Читаем данные из json файла и заносим их в БД"
            [nzLoading]="loading"
          >
            <i nz-icon nzType="file-add"></i>
            Перенести данные из JSON в БД
          </button>

          <!-- Синхронизировать иконки (опционально) -->
          @if (syncIcons.observed) {
            <button
              *nzSpaceItem
              nz-button
              nzType="default"
              (click)="syncIcons.emit()"
              nz-tooltip
              nzTooltipTitle="Поиск и привязка иконок по алфавитным папкам на сервере"
              [nzLoading]="loading"
            >
              <i nz-icon nzType="picture"></i>
              Синхронизировать иконки
            </button>
          }

          <!-- Синхронизировать скриншоты (опционально) -->
          @if (syncScreenshots.observed) {
            <button
              *nzSpaceItem
              nz-button
              nzType="default"
              (click)="syncScreenshots.emit()"
              nz-tooltip
              nzTooltipTitle="Поиск и привязка скриншотов по локализованным папкам"
              [nzLoading]="loading"
            >
              <i nz-icon nzType="picture"></i>
              Синхронизировать скриншоты
            </button>
          }
        </nz-space>

        <div class="status-line">
          <span class="status-label">Статус БД:</span>
          <span class="status-value">Всего записей ({{ total }})</span>
        </div>
      </div>
    </nz-card>
  `,
  styles: [
    `
      .maintenance-card {
        background-color: #fff7e6;
        border-color: #ffd591;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        animation: slideIn 0.3s ease-out;
      }
      .maintenance-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      .status-line {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 4px;
        border: 1px dashed #ffd591;
      }
      .status-label {
        color: #8c8c8c;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .status-value {
        font-weight: 600;
        color: #df9100;
        font-size: 14px;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ButtonControlJsonBlockComponent {
  private modalService = inject(ModalService);

  @Input() loading = false;
  @Input() total = 0;

  @Output() clear = new EventEmitter<void>();
  @Output() read = new EventEmitter<void>();
  @Output() seed = new EventEmitter<void>();
  @Output() syncIcons = new EventEmitter<void>();
  @Output() syncScreenshots = new EventEmitter<void>();

  async handleClear(): Promise<void> {
    const confirmed = await this.modalService.mathChallenge({
      title: 'Критическая очистка БД',
      message: 'Вы уверены, что хотите ПОЛНОСТЬЮ очистить таблицу? Это действие безвозвратно удалит все записи и сбросит счетчик ID.',
      question: '2 + 2 * 2 = ?',
      expectedAnswer: '6',
      confirmText: 'Очистить',
      cancelText: 'Отмена',
    });

    if (confirmed) {
      this.clear.emit();
    }
  }
}
