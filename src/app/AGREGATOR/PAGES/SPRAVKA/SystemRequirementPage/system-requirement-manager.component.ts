import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SystemRequirementStateService } from './services/system-requirement-state.service';
import { SystemRequirementListComponent } from './components/system-requirement-list.component';
import { SystemRequirementFormComponent } from './components/system-requirement-form.component';

@Component({
  selector: 'app-system-requirement-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    SystemRequirementListComponent,
    SystemRequirementFormComponent
  ],
  template: `
    <div class="requirement-manager">
      <nz-card [nzTitle]="titleTpl" [nzExtra]="extraTpl">
        <ng-template #titleTpl>
          <i nz-icon nzType="setting" style="margin-right: 8px;"></i>
          Системные требования
        </ng-template>
        
        <ng-template #extraTpl>
          <button nz-button nzType="primary" (click)="onAdd()">
            <i nz-icon nzType="plus"></i> Добавить требование
          </button>
        </ng-template>

        <nz-spin [nzSpinning]="state.loading()">
          @if (state.requirements().length > 0) {
            <app-system-requirement-list 
              [items]="state.requirements()"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)">
            </app-system-requirement-list>
          } @else {
            <nz-empty nzNotFoundImage="simple" nzNotFoundContent="Требования не заданы"></nz-empty>
          }
        </nz-spin>
      </nz-card>

      <!-- Модалка формы -->
      <app-system-requirement-form></app-system-requirement-form>
    </div>
  `,
  styles: [`
    .requirement-manager {
      margin-top: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemRequirementManagerComponent implements OnInit {
  @Input({ required: true }) versionId!: number;
  @Input({ required: true }) platformId!: number;

  readonly state = inject(SystemRequirementStateService);

  ngOnInit(): void {
    this.state.loadRequirements(this.versionId);
  }

  onAdd(): void {
    this.state.openAddModal(this.versionId, this.platformId);
  }

  onEdit(item: any): void {
    this.state.openEditModal(item);
  }

  onDelete(id: number): void {
    this.state.delete(id, this.versionId);
  }
}
