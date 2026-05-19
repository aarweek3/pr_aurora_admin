import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PlatformOfAggregatorStateService } from '../../services/platform-of-aggregator-state.service';
import { PlatformOfAggregatorDetailsComponent } from '../platform-of-aggregator-details/platform-of-aggregator-details.component';

@Component({
  selector: 'app-platform-of-aggregator-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    PlatformOfAggregatorDetailsComponent,
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
          <app-platform-of-aggregator-details
            [data]="state.viewItem()"
          ></app-platform-of-aggregator-details>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <i nz-icon nzType="eye" class="header-icon"></i>
          <span
            >Просмотр информации о платформе: <strong>{{ state.viewItem()?.name }}</strong></span
          >
        </div>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleClose()">Закрыть</button>
      </ng-template>
    </nz-modal>
  `,
  styleUrls: ['./platform-of-aggregator-view-modal.component.scss'],
})
export class PlatformOfAggregatorViewModalComponent {
  state = inject(PlatformOfAggregatorStateService);


  handleClose(): void {
    this.state.closeViewModal();
  }
}
