import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { LicenseTypeOfAggregatorStateService } from '../services/license-type-of-aggregator-state.service';
import { LicenseTypeOfAggregatorFormComponent } from './license-type-of-aggregator-form/license-type-of-aggregator-form.component';

@Component({
  selector: 'app-license-type-of-aggregator-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, LicenseTypeOfAggregatorFormComponent],
  template: `
    <nz-modal
      [nzVisible]="state.modalVisible()"
      [nzTitle]="modalTitle"
      [nzContent]="modalContent"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="1000"
      [nzMaskClosable]="false"
    >
      <ng-template #modalTitle>
        <div class="modal-title">
          {{
            state.modalMode() === 'add'
              ? 'Добавление нового типа лицензии'
              : 'Редактирование типа лицензии'
          }}
          @if (state.editingItem(); as item) {
            <span class="item-id">#{{ item.id }}</span>
          }
        </div>
      </ng-template>

      <ng-template #modalContent>
        <app-license-type-of-aggregator-form
          #licenseForm
          [loading]="state.modalLoading()"
          [initialData]="state.editingItem()"
          (save)="handleSave($event)"
          (cancel)="handleCancel()"
        ></app-license-type-of-aggregator-form>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button
          nz-button
          nzType="primary"
          [nzLoading]="state.modalLoading()"
          (click)="licenseForm.submitForm()"
        >
          {{ state.modalMode() === 'add' ? 'Создать' : 'Сохранить изменения' }}
        </button>
      </ng-template>
    </nz-modal>
  `,
  styles: [
    `
      .modal-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
      }
      .item-id {
        font-size: 12px;
        color: #94a3b8;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
      }
    `,
  ],
})
export class LicenseTypeOfAggregatorModalComponent {
  @ViewChild('licenseForm') licenseForm!: LicenseTypeOfAggregatorFormComponent;

  constructor(public state: LicenseTypeOfAggregatorStateService) {}

  handleSave(formValue: any): void {
    this.state.save(formValue);
  }

  handleCancel(): void {
    this.state.closeModal();
  }
}
