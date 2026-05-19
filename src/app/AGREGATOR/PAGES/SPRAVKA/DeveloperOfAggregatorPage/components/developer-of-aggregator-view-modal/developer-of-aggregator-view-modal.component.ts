import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DeveloperOfAggregatorStateService } from '../../services/developer-of-aggregator-state.service';
import { DeveloperOfAggregatorDetailsComponent } from '../developer-of-aggregator-details/developer-of-aggregator-details.component';

/**
 * DeveloperOfAggregatorViewModalComponent
 *
 * Модальное окно для просмотра детальной информации о разработчике.
 * Использует DeveloperOfAggregatorDetailsComponent для отображения данных.
 */
@Component({
  selector: 'app-developer-of-aggregator-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    DeveloperOfAggregatorDetailsComponent,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.viewModalVisible()"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleClose()"
      [nzWidth]="1200"
    >
      <ng-container *nzModalContent>
        <div class="modal-body-scroll">
          <app-developer-of-aggregator-details
            [data]="state.viewItem()"
          ></app-developer-of-aggregator-details>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <i nz-icon nzType="eye" class="header-icon"></i>
          <span
            >Просмотр информации о разработчике: <strong>{{ state.viewItem()?.name }}</strong></span
          >
        </div>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleClose()">Закрыть</button>
      </ng-template>
    </nz-modal>
  `,
  styles: [
    `
      .modal-header-custom {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;

        .header-icon {
          color: #1890ff;
          font-size: 20px;
        }
      }
      .modal-body-scroll {
        max-height: 70vh;
        overflow-y: auto;
        padding: 0 8px;
      }
    `,
  ],
})
export class DeveloperOfAggregatorViewModalComponent {
  state = inject(DeveloperOfAggregatorStateService);


  handleClose(): void {
    this.state.closeViewModal();
  }
}
