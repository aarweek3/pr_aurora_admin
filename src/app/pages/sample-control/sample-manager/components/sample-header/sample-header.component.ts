import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-sample-header',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzButtonModule, NzIconModule, NzTypographyModule],
  template: `
    <div class="header-container" nz-row [nzGutter]="16">
      <div nz-col nzSpan="12" class="header-left">
        <h2 nz-typography>Родитель</h2>
        <p nz-typography nzType="secondary" class="total-text">Всего: {{ total }}</p>
      </div>
      <div nz-col nzSpan="12" class="header-right">
        <button
          nz-button
          nzType="default"
          nzShape="circle"
          class="reload-button"
          (click)="refresh.emit()"
        >
          <span nz-icon nzType="reload"></span>
        </button>
        <button nz-button nzType="primary" (click)="create.emit()">
          <span nz-icon nzType="plus"></span>
          Добавить запись
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .header-container {
        margin-bottom: 16px;
      }

      .header-left {
        display: flex;
        align-items: baseline;
        gap: 8px;

        h2 {
          margin-bottom: 0;
        }
      }

      .total-text {
        margin-bottom: 0;
      }

      .header-right {
        text-align: right;
      }

      .reload-button {
        margin-right: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleHeaderComponent {
  @Input() total = 0;
  @Output() refresh = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
}
