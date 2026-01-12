import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { SampleDetailDto } from '../../models/sample.dto';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sample-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
  ],
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
                (click)="view.emit(item.id)"
                title="Просмотр"
                [ngStyle]="{ color: hoverStates['view'] || '#52c41a' }"
                (mouseenter)="onHover('view', true)"
                (mouseleave)="onHover('view', false)"
              >
                <span nz-icon nzType="eye"></span>
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                (click)="edit.emit(item)"
                title="Редактировать"
                [ngStyle]="{ color: hoverStates['edit'] || '#1890ff' }"
                (mouseenter)="onHover('edit', true)"
                (mouseleave)="onHover('edit', false)"
              >
                <span nz-icon nzType="edit"></span>
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                nzDanger
                (click)="delete.emit(item.id)"
                title="Удалить"
                [ngStyle]="{ color: hoverStates['delete'] || '#ff4d4f' }"
                (mouseenter)="onHover('delete', true)"
                (mouseleave)="onHover('delete', false)"
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
      :host ::ng-deep .ant-btn {
        padding: 0 4px;
        margin: 0 4px;
      }
      :host ::ng-deep .ant-btn:hover {
        opacity: 0.8;
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

  hoverStates: { [key: string]: string } = {
    view: '#52c41a',
    edit: '#1890ff',
    delete: '#ff4d4f',
  };

  private destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      console.log('SampleTable - обновлены items:', this.items.length);
    }
    if (changes['loading']) {
      console.log('SampleTable - изменение loading:', this.loading);
    }
    if (changes['hasError']) {
      console.log('SampleTable - изменение hasError:', this.hasError);
    }
  }

  ngOnDestroy(): void {
    console.log('SampleTable ngOnDestroy - очистка ресурсов');
    this.destroy$.next();
    this.destroy$.complete();

    // Очистка состояний hover для предотвращения утечек
    this.hoverStates = {};
  }

  trackByFn(index: number, item: SampleDetailDto): number {
    return item.id;
  }

  onHover(action: 'view' | 'edit' | 'delete', isHover: boolean): void {
    const hoverColors: Record<'view' | 'edit' | 'delete', string> = {
      view: isHover ? '#73d13d' : '#52c41a',
      edit: isHover ? '#40a9ff' : '#1890ff',
      delete: isHover ? '#ff7875' : '#ff4d4f',
    };
    this.hoverStates[action] = hoverColors[action];
  }
}
