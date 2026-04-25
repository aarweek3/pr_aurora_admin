import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CategoryTagOfAggregatorStateService } from '../../services/category-tag-of-aggregator-state.service';

@Component({
  selector: 'app-category-tag-of-aggregator-view-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule],
  template: `
    <nz-modal
      [nzVisible]="!!state.selectedId() && isVisible"
      nzTitle="Просмотр категории"
      (nzOnCancel)="close()"
      [nzFooter]="null"
      [nzWidth]="600"
    >
      <ng-container *nzModalContent>
        <p>Детальный просмотр в разработке...</p>
      </ng-container>
    </nz-modal>
  `,
})
export class CategoryTagOfAggregatorViewModalComponent {
  state = inject(CategoryTagOfAggregatorStateService);
  isVisible = false;

  open(): void {
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
    this.state.updateState({ selectedId: null });
  }
}
