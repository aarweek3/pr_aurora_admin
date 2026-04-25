import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DeveloperOfAggregatorFormComponent } from '../developer-of-aggregator-form/developer-of-aggregator-form.component';
import { DeveloperOfAggregatorStateService } from '../../services/developer-of-aggregator-state.service';

@Component({
  selector: 'app-developer-of-aggregator-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    DeveloperOfAggregatorFormComponent
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="(state.selectedId() ? 'Редактирование' : 'Создание') + ' разработчика'"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="1000"
      [nzFooter]="modalFooter"
      [nzMaskClosable]="false"
    >
      <ng-container *nzModalContent>
        <app-developer-of-aggregator-form
          #developerForm
          [id]="state.selectedId()"
          (onSave)="handleSave($event)"
        ></app-developer-of-aggregator-form>
      </ng-container>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button 
          nz-button 
          nzType="primary" 
          [nzLoading]="state.modalLoading()" 
          (click)="developerForm.submit()"
        >
          Сохранить
        </button>
      </ng-template>
    </nz-modal>
  `
})
export class DeveloperOfAggregatorModalComponent {
  state = inject(DeveloperOfAggregatorStateService);

  @Input() isVisible = false;
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('developerForm') developerForm!: DeveloperOfAggregatorFormComponent;

  handleCancel(): void {
    this.onClose.emit();
  }

  handleSave(dto: any): void {
    this.state.save(dto).subscribe(() => {
      this.onClose.emit();
    });
  }
}
