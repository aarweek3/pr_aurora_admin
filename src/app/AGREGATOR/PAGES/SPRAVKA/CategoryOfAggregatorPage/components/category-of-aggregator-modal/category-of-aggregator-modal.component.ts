import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CategoryOfAggregatorFormComponent } from '../category-of-aggregator-form/category-of-aggregator-form.component';
import { CategoryOfAggregatorStateService } from '../../services/category-of-aggregator-state.service';

@Component({
  selector: 'app-category-of-aggregator-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    CategoryOfAggregatorFormComponent,
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="modalTitle"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="isFullScreen ? '100%' : 1000"
      [nzStyle]="isFullScreen ? { top: '0', margin: '0', padding: '0', maxWidth: '100%' } : {}"
      [nzBodyStyle]="isFullScreen ? { height: 'calc(100vh - 108px)', overflowY: 'auto' } : {}"
      [nzMaskClosable]="false"
      [nzDraggable]="!isFullScreen"
    >
      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <span>{{ (state.selectedId() ? 'Редактирование' : 'Создание') + ' категории' }}</span>
          <button
            nz-button
            nzType="text"
            (click)="toggleFullScreen($event)"
            class="fullscreen-btn"
            nz-tooltip
            [nzTooltipTitle]="isFullScreen ? 'Свернуть' : 'Развернуть на весь экран'"
          >
            <i nz-icon [nzType]="isFullScreen ? 'fullscreen-exit' : 'fullscreen'"></i>
          </button>
        </div>
      </ng-template>

      <ng-container *nzModalContent>
        <app-category-of-aggregator-form
          #categoryForm
          [id]="state.selectedId()"
          (save)="handleSave($event)"
        ></app-category-of-aggregator-form>
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
  `,
  styles: [
    `
      .modal-header-custom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 24px;
        width: 100%;
      }
      .fullscreen-btn {
        color: #64748b;
        &:hover {
          color: #1890ff;
          background: rgba(24, 144, 255, 0.05);
        }
      }
    `,
  ],
})
export class CategoryOfAggregatorModalComponent {
  state = inject(CategoryOfAggregatorStateService);

  @Input() isVisible = false;
  @Output() modalClose = new EventEmitter<void>();

  @ViewChild('categoryForm') categoryForm!: CategoryOfAggregatorFormComponent;

  isFullScreen = false;

  toggleFullScreen(event: MouseEvent): void {
    event.stopPropagation();
    this.isFullScreen = !this.isFullScreen;
  }

  handleCancel(): void {
    this.modalClose.emit();
  }

  handleSave(dto: any): void {
    this.state.save(dto).subscribe(() => {
      this.modalClose.emit();
    });
  }
}
