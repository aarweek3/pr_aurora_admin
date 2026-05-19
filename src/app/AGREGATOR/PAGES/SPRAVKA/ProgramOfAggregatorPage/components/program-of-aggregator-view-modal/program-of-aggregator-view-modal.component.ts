import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ProgramOfAggregatorStateService } from '../../services/program-of-aggregator-state.service';
import { ProgramOfAggregatorDetailsComponent } from '../program-of-aggregator-details/program-of-aggregator-details.component';

@Component({
  selector: 'app-program-of-aggregator-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    ProgramOfAggregatorDetailsComponent,
  ],
  template: `
    <nz-modal
      [nzVisible]="(state.viewModalVisible$ | async) || false"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleClose()"
      [nzWidth]="(state.viewModalMaximized$ | async) ? '100%' : 1200"
      [nzStyle]="(state.viewModalMaximized$ | async) ? { top: '0', padding: '0' } : { top: '20px' }"
      [nzBodyStyle]="
        (state.viewModalMaximized$ | async) ? { height: 'calc(100vh - 108px)' } : { height: 'auto' }
      "
    >
      <ng-container *nzModalContent>
        <div class="modal-body-scroll" [class.maximized]="state.viewModalMaximized$ | async">
          <app-program-of-aggregator-details
            [data]="state.viewItem$ | async"
          ></app-program-of-aggregator-details>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <div class="header-left">
            <i nz-icon nzType="eye" class="header-icon"></i>
            <span
              >Просмотр программы:
              <strong>{{ (state.viewItem$ | async)?.canonicalName }}</strong></span
            >
          </div>
          <div class="header-right">
            <button nz-button nzType="text" (click)="toggleMaximize()" class="maximize-btn">
              <i
                nz-icon
                [nzType]="(state.viewModalMaximized$ | async) ? 'fullscreen-exit' : 'fullscreen'"
              ></i>
            </button>
          </div>
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
        justify-content: space-between;
        width: 100%;
        padding-right: 32px;
        gap: 12px;
        font-size: 16px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          color: #1890ff;
          font-size: 20px;
        }

        .maximize-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          width: 24px;
          color: #8c8c8c;

          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      }
      .modal-body-scroll {
        max-height: 70vh;
        overflow-y: auto;
        padding: 0 8px;
        transition: all 0.3s;

        &.maximized {
          max-height: 100%;
        }
      }
    `,
  ],
})
export class ProgramOfAggregatorViewModalComponent {
  public state = inject(ProgramOfAggregatorStateService);

  handleClose(): void {
    this.state.closeViewModal();
  }

  toggleMaximize(): void {
    this.state.toggleViewModalMaximize();
  }
}
