import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CategoryTagOfAggregatorFormComponent } from '../category-tag-of-aggregator-form/category-tag-of-aggregator-form.component';
import { CategoryTagOfAggregatorStateService } from '../../services/category-tag-of-aggregator-state.service';

@Component({
  selector: 'app-category-tag-of-aggregator-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    CategoryTagOfAggregatorFormComponent
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="(state.selectedId() ? 'Редактирование' : 'Создание') + ' категории'"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="900"
      [nzFooter]="modalFooter"
      [nzMaskClosable]="false"
    >
      <ng-container *nzModalContent>
        <app-category-tag-of-aggregator-form
          #categoryForm
          [id]="state.selectedId()"
          (onSave)="handleSave($event)"
        ></app-category-tag-of-aggregator-form>
      </ng-container>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button 
          nz-button 
          nzType="primary" 
          [nzLoading]="state.modalLoading()" 
          (click)="categoryForm.submit()"
        >
          Сохранить
        </button>
      </ng-template>
    </nz-modal>
  `
})
export class CategoryTagOfAggregatorModalComponent {
  state = inject(CategoryTagOfAggregatorStateService);

  @Input() isVisible = false;
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('categoryForm') categoryForm!: CategoryTagOfAggregatorFormComponent;

  handleCancel(): void {
    this.onClose.emit();
  }

  handleSave(dto: any): void {
    this.state.save(dto).subscribe(() => {
      this.onClose.emit();
    });
  }
}
