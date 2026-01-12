import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { SampleDetailDto } from '../../models/sample.dto';

@Component({
  selector: 'app-sample-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzSpinModule, NzEmptyModule],
  template: `
    <nz-spin [nzSpinning]="loading">
      <nz-table
        #basicTable
        [nzData]="items"
        [nzShowPagination]="false"
        [nzSize]="'middle'"
        [nzNoResult]="noDataTemplate"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th nzWidth="120px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items; trackBy: trackByFn">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.description || '-' }}</td>
            <td>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                class="action-btn view-btn"
                (click)="view.emit(item.id)"
                title="Просмотр"
              >
                <span nz-icon nzType="eye"></span>
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                class="action-btn edit-btn"
                (click)="edit.emit(item)"
                title="Редактировать"
              >
                <span nz-icon nzType="edit"></span>
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                nzDanger
                class="action-btn delete-btn"
                (click)="delete.emit(item.id)"
                title="Удалить"
              >
                <span nz-icon nzType="delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>

    <ng-template #noDataTemplate>
      <nz-empty
        [nzNotFoundImage]="'simple'"
        [nzNotFoundContent]="hasError ? 'Ошибка загрузки данных' : 'Нет данных'"
      >
      </nz-empty>
    </ng-template>
  `,
  styles: [
    `
      .action-btn {
        padding: 0 4px;
        margin: 0 4px;
        transition: color 0.3s;
      }
      .view-btn {
        color: #52c41a;
      }
      .view-btn:hover {
        color: #73d13d;
      }
      .edit-btn {
        color: #1890ff;
      }
      .edit-btn:hover {
        color: #40a9ff;
      }
      .delete-btn {
        color: #ff4d4f;
      }
      .delete-btn:hover {
        color: #ff7875;
      }

      :host ::ng-deep .ant-btn {
        padding: 0 4px;
        margin: 0 4px;
      }
    `,
  ],
})
export class SampleTableComponent implements OnChanges, OnDestroy {
  @Input() items: SampleDetailDto[] = [];
  @Input() loading: boolean = false;
  @Input() hasError: boolean = false;
  @Output() view = new EventEmitter<number>();
  @Output() edit = new EventEmitter<SampleDetailDto>();
  @Output() delete = new EventEmitter<number>();

  private destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      console.log('SampleTable - обновлены items:', this.items.length);
    }
  }

  ngOnDestroy(): void {
    console.log('SampleTable ngOnDestroy - очистка ресурсов');
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number, item: SampleDetailDto): number {
    return item.id;
  }
}
