import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PlatformItemDto } from '../../models/platform.model';
import { PlatformStateService } from '../../services/platform-state.service';
import { PlatformViewDrawerComponent } from '../platform-view-drawer/platform-view-drawer.component';

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzInputModule,
    NzSpaceModule,
    NzCardModule,
    NzSelectModule,
    NzAlertModule,
    PlatformViewDrawerComponent,
  ],
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <nz-input-group [nzPrefix]="prefixIconSearch">
              <input
                type="text"
                nz-input
                placeholder="Поиск платформ..."
                [ngModel]="searchTerm"
                (ngModelChange)="onSearchChange($event)"
              />
            </nz-input-group>
            <ng-template #prefixIconSearch>
              <i nz-icon nzType="search"></i>
            </ng-template>
          </div>

          <nz-select
            style="width: 180px;"
            [ngModel]="selectedLanguageId$ | async"
            (ngModelChange)="onLanguageChange($event)"
            nzPlaceHolder="Фильтр по языку"
          >
            <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
            <nz-option
              *ngFor="let lang of languages$ | async"
              [nzValue]="lang.id"
              [nzLabel]="lang.nativeTitle"
            ></nz-option>
          </nz-select>
        </div>

        <button nz-button nzType="primary" [routerLink]="['new']">
          <i nz-icon nzType="plus"></i>
          Создать платформу
        </button>
      </div>

      <div *ngIf="error$ | async as error" class="error-container">
        <nz-alert
          nzType="error"
          [nzMessage]="error.title"
          [nzDescription]="error.getUserMessage()"
          nzShowIcon
        ></nz-alert>
      </div>

      <nz-table
        #basicTable
        [nzData]="(items$ | async) || []"
        [nzLoading]="(loading$ | async)!"
        [nzTotal]="(total$ | async)!"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="onPageIndexChange($event)"
      >
        <thead>
          <tr>
            <th>Название (Тех)</th>
            <th>Код</th>
            <th>Локализованное имя</th>
            <th>Семейство</th>
            <th>Сортировка</th>
            <th>Статус</th>
            <th nzWidth="120px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let data of basicTable.data; trackBy: trackByItems"
            [class.active-row]="data.id === selectedId"
            (click)="selectRow(data.id)"
            style="cursor: pointer;"
          >
            <td>
              <span class="tech-name">{{ data.name }}</span>
            </td>
            <td>
              <nz-tag nzColor="blue">{{ data.code }}</nz-tag>
            </td>
            <td>{{ data.localizedName || '—' }}</td>
            <td>{{ data.family || '—' }}</td>
            <td>{{ data.sortOrder }}</td>
            <td>
              <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                {{ data.isActive ? 'Активен' : 'Откл' }}
              </nz-tag>
            </td>
            <td>
              <div class="actions">
                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Редактировать"
                  [routerLink]="[data.id, 'edit']"
                >
                  <i nz-icon nzType="edit" class="edit-icon"></i>
                </button>
                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Просмотр"
                  (click)="onView(data.id)"
                >
                  <i nz-icon nzType="eye" class="view-icon"></i>
                </button>
                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Удалить"
                  nz-popconfirm
                  nzPopconfirmTitle="Удалить платформу?"
                  (nzOnConfirm)="onDelete(data.id)"
                  [nzLoading]="(deletingId$ | async) === data.id"
                >
                  <i nz-icon nzType="delete" class="delete-icon"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <app-platform-view-drawer
        [visible]="isViewVisible"
        [data]="viewItem$ | async"
        [loading]="(loading$ | async) || (pageLoading$ | async) || false"
        (closeDrawer)="closeView()"
      ></app-platform-view-drawer>
    </nz-card>
  `,
  styles: [
    `
      .page-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 16px;
      }
      .left-actions {
        display: flex;
        gap: 16px;
        flex: 1;
      }
      .search-box {
        flex: 1;
        max-width: 400px;
      }
      .tech-name {
        font-weight: 500;
        color: #1890ff;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .edit-icon {
        color: #1890ff;
      }
      .delete-icon {
        color: #ff4d4f;
      }
      .view-icon {
        color: #722ed1;
      }
      .error-container {
        margin-bottom: 24px;
      }
      .active-row {
        background-color: #f0f5ff !important;
        position: relative;
      }
      .active-row td:first-child {
        border-left: 3px solid #1890ff;
      }
      tr:hover td {
        background-color: #fafafa;
      }
      tr {
        user-select: none;
      }
      .actions button,
      .actions i {
        user-select: auto;
      }
    `,
  ],
})
export class PlatformListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  items$ = this.state.items$;
  total$ = this.state.total$;
  loading$ = this.state.loading$;
  selectedLanguageId$ = this.state.selectedLanguageId$;
  languages$ = this.state.languages$;
  error$ = this.state.error$;
  deletingId$ = this.state.deletingId$;
  viewItem$ = this.state.viewItem$;
  pageLoading$ = this.state.pageLoading$;

  searchTerm = '';
  isViewVisible = false;
  selectedId: string | null = null;

  constructor(private state: PlatformStateService) {}

  ngOnInit(): void {
    this.state.loadItems();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.state.setSearchTerm(term));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onLanguageChange(langId: number | null): void {
    this.state.setLanguageId(langId);
  }

  onPageIndexChange(index: number): void {
    this.state.setPageIndex(index);
  }

  onDelete(id: string): void {
    this.state.delete(id);
  }

  selectRow(id: string): void {
    this.selectedId = id;
  }

  onView(id: string): void {
    this.selectedId = id;
    this.isViewVisible = true;
    this.state.loadForView(id);
  }

  closeView(): void {
    this.isViewVisible = false;
    this.selectedId = null;
  }

  trackByItems(index: number, item: PlatformItemDto): string {
    return item.id;
  }
}
