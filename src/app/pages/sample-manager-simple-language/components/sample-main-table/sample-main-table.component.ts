import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SampleMainItemDto } from '../../models/sample-main.model';

@Component({
  selector: 'app-sample-main-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzSpinModule, NzTagModule],
  template: `
    <nz-spin [nzSpinning]="loading">
      <nz-table #basicTable [nzData]="items" [nzShowPagination]="false" [nzSize]="'middle'">
        <thead>
          <tr>
            <th nzWidth="80px">ID</th>
            <th>Тех. Название</th>
            <th>Локализованное имя</th>
            <th>Системный код</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="150px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items; trackBy: trackByFn">
            <td>{{ item.id }}</td>
            <td (click)="view.emit(item)" style="cursor: pointer; font-weight: 500;">
              {{ item.name }}
            </td>
            <td style="color: #1890ff;">
              {{ item.localizedName || '-' }}
            </td>
            <td>
              <code>{{ item.systemCode || '-' }}</code>
            </td>
            <td>
              <nz-tag [nzColor]="item.isActive ? 'success' : 'default'">
                {{ item.isActive ? 'Активен' : 'Архив' }}
              </nz-tag>
            </td>
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
      code {
        padding: 2px 4px;
        background: #f5f5f5;
        border-radius: 4px;
        font-family: monospace;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleMainTableComponent {
  @Input() items: SampleMainItemDto[] = [];
  @Input() loading = false;

  @Output() view = new EventEmitter<SampleMainItemDto>();
  @Output() edit = new EventEmitter<SampleMainItemDto>();
  @Output() delete = new EventEmitter<SampleMainItemDto>();

  trackByFn(_: number, item: SampleMainItemDto): number {
    return item.id;
  }
}
