import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { LicenseTypeOfAggregatorStateService } from './services/license-type-of-aggregator-state.service';
import { LicenseTypeOfAggregatorDetailsComponent } from './components/license-type-of-aggregator-details/license-type-of-aggregator-details.component';

@Component({
  selector: 'app-license-type-of-aggregator-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    LicenseTypeOfAggregatorDetailsComponent,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.viewModalVisible()"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleClose()"
      [nzWidth]="1000"
    >
      <ng-container *nzModalContent>
        <div class="modal-body-scroll">
          <app-license-type-of-aggregator-details
            [data]="state.viewItem()"
          ></app-license-type-of-aggregator-details>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <i nz-icon nzType="eye" class="header-icon"></i>
          <span
            >Просмотр типа лицензии: <strong>{{ state.viewItem()?.canonicalName }}</strong></span
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
        gap: 8px;
      }
      .header-icon {
        color: #1890ff;
        font-size: 18px;
      }
      .modal-body-scroll {
        max-height: 70vh;
        overflow-y: auto;
        padding: 4px;
      }
    `,
  ],
})
export class LicenseTypeOfAggregatorViewModalComponent {
  state = inject(LicenseTypeOfAggregatorStateService);


  handleClose(): void {
    this.state.closeViewModal();
  }
}
