import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PlatformOfAggregatorStateService } from '../../services/platform-of-aggregator-state.service';
import { PlatformOfAggregatorFormComponent } from '../platform-of-aggregator-form/platform-of-aggregator-form.component';

@Component({
  selector: 'app-platform-of-aggregator-inline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzCardModule, NzGridModule, NzDividerModule, PlatformOfAggregatorFormComponent],
  template: `
    @if (state.modalVisible()) {
      <div nz-row [nzGutter]="24" style="margin-top: 24px;">
        <div nz-col nzSpan="24">
          <nz-card
            [nzTitle]="state.modalMode() === 'add' ? 'Новая платформа (Inline)' : 'Редактирование (Inline)'"
            [nzExtra]="extraTemplate"
          >
            <app-platform-of-aggregator-form
              [loading]="state.modalLoading()"
              [initialData]="state.editingItem()"
              [showInlineActions]="true"
              (save)="handleSave($event)"
              (cancel)="handleCancel()"
            ></app-platform-of-aggregator-form>
          </nz-card>
        </div>
        <ng-template #extraTemplate>
          <span style="color: #64748b; font-size: 12px; font-weight: 500;">Быстрое редактирование без модального окна</span>
        </ng-template>
      </div>
    }
  `,
})
export class PlatformOfAggregatorInlineComponent {
  constructor(public state: PlatformOfAggregatorStateService) {}

  handleSave(formValue: any): void { this.state.save(formValue); }
  handleCancel(): void { this.state.closeModal(); }
}
