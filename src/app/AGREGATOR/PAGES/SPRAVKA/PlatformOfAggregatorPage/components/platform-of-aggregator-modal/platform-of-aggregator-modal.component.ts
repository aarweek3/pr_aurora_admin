import { CommonModule } from '@angular/common';
import { Component, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PlatformOfAggregatorStateService } from '../../services/platform-of-aggregator-state.service';
import { PlatformOfAggregatorFormComponent } from '../platform-of-aggregator-form/platform-of-aggregator-form.component';

@Component({
  selector: 'app-platform-of-aggregator-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    PlatformOfAggregatorFormComponent,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.modalVisible()"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="1200"
    >
      <ng-container *nzModalContent>
        <app-platform-of-aggregator-form
          #platformForm
          [loading]="state.modalLoading()"
          [initialData]="state.editingItem()"
          (save)="handleSave($event)"
          (cancel)="handleCancel()"
        ></app-platform-of-aggregator-form>
      </ng-container>

      <ng-template #modalTitle>
        @if (state.modalMode() === 'add') {
          <span><i nz-icon nzType="plus"></i> Новая платформа</span>
        } @else {
          <span><i nz-icon nzType="edit"></i> Редактирование платформы</span>
        }
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button
          nz-button
          nzType="primary"
          (click)="platformForm.submitForm()"
          [nzLoading]="state.modalLoading()"
        >
          Сохранить
        </button>
      </ng-template>
    </nz-modal>
  `,
})
export class PlatformOfAggregatorModalComponent {
  state = inject(PlatformOfAggregatorStateService);

  @ViewChild('platformForm') platformForm!: PlatformOfAggregatorFormComponent;

  handleCancel(): void {
    this.state.closeModal();
  }
  handleSave(formValue: any): void {
    this.state.save(formValue);
  }
}
