import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
    CommonModule, 
    NzButtonModule, 
    NzIconModule, 
    NzSpaceModule, 
    NzToolTipModule, 
    NzCardModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card class="maintenance-card" nzSize="small" [nzBordered]="true">
      <div class="maintenance-content">
        <nz-space nzSize="middle">
          <!-- Очистить БД -->
          <button *nzSpaceItem
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
          <button *nzSpaceItem
            nz-button 
            nzType="default" 
            (click)="onRead.emit()"
            nz-tooltip
            nzTooltipTitle="Перечитать данные (платформы) из БД"
            [nzLoading]="loading"
          >
            <i nz-icon nzType="reload"></i>
            Считать данные из БД
          </button>

          <!-- Перенести из JSON -->
          <button *nzSpaceItem
            nz-button 
            nzType="primary"
            (click)="onSeed.emit()"
            nz-tooltip
            nzTooltipTitle="Читаем данные из json файла и заносим их в БД"
            [nzLoading]="loading"
          >
            <i nz-icon nzType="file-add"></i>
            Перенести данные из JSON в БД
          </button>
        </nz-space>

        <div class="status-line">
          <span class="status-label">Статус БД:</span>
          <span class="status-value">Всего записей ({{ total }})</span>
        </div>
      </div>
    </nz-card>
  `,
  styles: [`
    .maintenance-card {
      background-color: #fff7e6;
      border-color: #ffd591;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ButtonControlJsonBlockComponent {
  private modalService = inject(ModalService);

  @Input() loading = false;
  @Input() total = 0;
  
  @Output() onClear = new EventEmitter<void>();
  @Output() onRead = new EventEmitter<void>();
  @Output() onSeed = new EventEmitter<void>();

  async handleClear(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы уверены, что хотите ПОЛНОСТЬЮ очистить таблицу? Это действие безвозвратно удалит все записи и сбросит счетчик ID.',
      '2 + 2 * 2 = ?',
      '6',
      'Критическая очистка БД'
    );

    if (confirmed) {
      this.onClear.emit();
    }
  }
}
