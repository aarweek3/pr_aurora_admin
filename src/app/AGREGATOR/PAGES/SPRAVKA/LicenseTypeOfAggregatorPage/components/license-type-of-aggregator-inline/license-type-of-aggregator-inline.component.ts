import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { LicenseTypeOfAggregatorStateService } from '../../services/license-type-of-aggregator-state.service';
import { LicenseTypeOfAggregatorFormComponent } from '../license-type-of-aggregator-form/license-type-of-aggregator-form.component';

@Component({
  selector: 'app-license-type-of-aggregator-inline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzCardModule, NzGridModule, NzDividerModule, LicenseTypeOfAggregatorFormComponent],
  template: `
    @if (state.modalVisible()) {
      <div nz-row [nzGutter]="24" style="margin-top: 24px;">
        <div nz-col nzSpan="24">
          <nz-card
            [nzTitle]="state.modalMode() === 'add' ? 'Новый тип лицензии (Inline)' : 'Редактирование (Inline)'"
            [nzExtra]="extraTemplate"
          >
            <app-license-type-of-aggregator-form
              [loading]="state.modalLoading()"
              [initialData]="state.editingItem()"
              [showInlineActions]="true"
              (save)="handleSave($event)"
              (cancel)="handleCancel()"
            ></app-license-type-of-aggregator-form>
          </nz-card>
        </div>
        <ng-template #extraTemplate>
          <span style="color: #64748b; font-size: 12px; font-weight: 500;">Быстрое редактирование без модального окна</span>
        </ng-template>
      </div>
    }
  `,
})
export class LicenseTypeOfAggregatorInlineComponent {
  constructor(public state: LicenseTypeOfAggregatorStateService) {}

  handleSave(formValue: any): void { this.state.save(formValue); }
  handleCancel(): void { this.state.closeModal(); }
}
