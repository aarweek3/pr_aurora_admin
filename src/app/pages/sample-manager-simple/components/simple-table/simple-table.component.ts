import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SampleSimpleDto } from '../../models/sample-simple.model';

@Component({
  selector: 'app-simple-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzSpinModule],
  template: `
    <nz-spin [nzSpinning]="loading">
      <nz-table #basicTable [nzData]="items" [nzShowPagination]="false" [nzSize]="'middle'">
        <thead>
          <tr>
            <th nzWidth="80px">ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th nzWidth="150px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items; trackBy: trackByFn">
            <td>{{ item.id }}</td>
            <td (click)="view.emit(item)" style="cursor: pointer; color: #1890ff;">
              {{ item.name }}
            </td>
            <td>{{ item.description || '-' }}</td>
            <td>
              <button
                nz-button
                nzType="text"
                class="action-btn view-btn"
                (click)="view.emit(item)"
                title="Просмотр"
              >
                <span nz-icon nzType="eye"></span>
              </button>
              <button
                nz-button
                nzType="text"
                class="action-btn edit-btn"
                (click)="edit.emit(item)"
                title="Редактировать"
              >
                <span nz-icon nzType="edit"></span>
              </button>
              <button
                nz-button
                nzType="text"
                nzDanger
                class="action-btn delete-btn"
                (click)="delete.emit(item)"
                title="Удалить"
              >
                <span nz-icon nzType="delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
  styles: [
    `
      .action-btn {
        transition: color 0.3s;
        padding: 0 4px;
        margin: 0 4px;
      }
      .view-btn {
        color: #52c41a;
      }
      .view-btn:hover {
        color: #73d13d !important;
      }
      .edit-btn {
        color: #1890ff;
      }
      .edit-btn:hover {
        color: #40a9ff !important;
      }
      .delete-btn {
        color: #ff4d4f;
      }
      .delete-btn:hover {
        color: #ff7875 !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent {
  @Input() items: SampleSimpleDto[] = [];
  @Input() loading = false;

  @Output() view = new EventEmitter<SampleSimpleDto>();
  @Output() edit = new EventEmitter<SampleSimpleDto>();
  @Output() delete = new EventEmitter<SampleSimpleDto>();

  trackByFn(_: number, item: SampleSimpleDto): number {
    return item.id;
  }
}
