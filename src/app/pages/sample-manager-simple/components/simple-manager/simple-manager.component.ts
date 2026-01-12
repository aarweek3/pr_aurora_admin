import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SampleSimpleApiService } from '../../services/sample-simple-api.service';
import { SampleSimpleService } from '../../services/sample-simple.service';
import { SimpleModalComponent } from '../simple-modal/simple-modal.component';
import { SimpleTableComponent } from '../simple-table/simple-table.component';

@Component({
  selector: 'app-simple-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzPaginationModule,
    SimpleTableComponent,
    SimpleModalComponent,
  ],
  providers: [SampleSimpleApiService, SampleSimpleService],
  template: `
    <div style="padding: 24px;">
      <div nz-row [nzGutter]="[16, 16]">
        <div
          nz-col
          nzSpan="24"
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <h2 style="margin: 0;">Simplified Manager ⚡ ({{ (state$ | async)?.total }})</h2>
          <button nz-button nzType="primary" (click)="service.openAdd()">Добавить</button>
        </div>

        <div nz-col nzSpan="24">
          <nz-input-group [nzSuffix]="inputClearTpl">
            <input
              nz-input
              placeholder="Поиск по названию..."
              [value]="(state$ | async)?.searchTerm"
              (input)="onSearch($event)"
            />
          </nz-input-group>
          <ng-template #inputClearTpl>
            <span
              nz-icon
              class="ant-input-clear-icon"
              nzTheme="fill"
              nzType="close-circle"
              *ngIf="(state$ | async)?.searchTerm"
              (click)="onClearSearch()"
            ></span>
          </ng-template>
        </div>

        <div nz-col nzSpan="24">
          <app-simple-table
            [items]="(state$ | async)?.items || []"
            [loading]="(state$ | async)?.loading || false"
            (view)="service.openView($event)"
            (edit)="service.openEdit($event)"
            (delete)="service.delete($event.id, $event.name)"
          ></app-simple-table>
        </div>

        <div nz-col nzSpan="24" style="display: flex; justify-content: flex-end;">
          <nz-pagination
            [nzPageIndex]="(state$ | async)?.pageNumber || 1"
            [nzPageSize]="(state$ | async)?.pageSize || 10"
            [nzTotal]="(state$ | async)?.total || 0"
            nzShowSizeChanger
            [nzPageSizeOptions]="[10, 20, 30, 40, 50, 75, 100]"
            (nzPageIndexChange)="service.changePage($event)"
            (nzPageSizeChange)="service.changePageSize($event)"
          ></nz-pagination>
        </div>
      </div>
    </div>

    <app-simple-modal
      [visible]="(state$ | async)?.modalVisible || false"
      [mode]="(state$ | async)?.modalMode || 'add'"
      [item]="(state$ | async)?.editingItem || null"
      [loading]="(state$ | async)?.modalLoading || false"
      [error]="(state$ | async)?.modalError || null"
      (save)="service.save($event)"
      (cancel)="service.closeModal()"
    ></app-simple-modal>
  `,
  styles: [
    `
      .ant-input-clear-icon {
        color: rgba(0, 0, 0, 0.25);
        transition: color 0.3s;
        cursor: pointer;
      }
      .ant-input-clear-icon:hover {
        color: rgba(0, 0, 0, 0.45);
      }
    `,
  ],
})
export class SimpleManagerComponent implements OnInit {
  public service = inject(SampleSimpleService);
  state$ = this.service.getState();

  ngOnInit(): void {
    this.service.loadItems();
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.service.search(val);
  }

  onClearSearch(): void {
    this.service.search('');
  }
}
