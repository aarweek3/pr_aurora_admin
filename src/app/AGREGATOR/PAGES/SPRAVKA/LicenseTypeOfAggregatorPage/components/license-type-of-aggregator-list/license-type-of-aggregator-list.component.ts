import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AvSearchComponent,
  PaginationComponent,
} from '@shared/components/ui';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { PaginationChangeEvent } from '@shared/components/ui/pagination/pagination.component';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LicenseTypeOfAggregatorStateService } from '../../services/license-type-of-aggregator-state.service';

@Component({
  selector: 'app-license-type-of-aggregator-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    NzSpaceModule,
    NzCardModule,
    NzSelectModule,
    NzAlertModule,
    NzDropDownModule,
    NzSwitchModule,
    NzSkeletonModule,
    AvSearchComponent,
    PaginationComponent,
  ],
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      @if (state.showDeleted()) {
        <div class="trash-alert">
          <nz-alert
            nzType="warning"
            nzMessage="Режим корзины активен. Вы видите только удаленные типы лицензий."
            nzShowIcon
          ></nz-alert>
        </div>
      }

      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <av-search
              [value]="searchTerm"
              [avLoading]="state.loading()"
              avPlaceholder="Поиск по названию или slug..."
              (onSearch)="onSearchChange($event)"
              [showButton]="false"
            ></av-search>
          </div>

          <nz-select
            style="width: 180px;"
            [ngModel]="state.selectedLanguageId()"
            (ngModelChange)="onLanguageChange($event)"
            nzPlaceHolder="Фильтр по языку"
          >
            <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
            @for (lang of state.languages(); track lang.id) {
              <nz-option [nzValue]="lang.id" [nzLabel]="lang.nativeTitle"></nz-option>
            }
          </nz-select>

          <div class="trash-toggle" [class.active]="state.showDeleted()">
            <span class="label">Корзина</span>
            <nz-switch
              [ngModel]="state.showDeleted()"
              (ngModelChange)="onToggleTrash($event)"
              nzSize="small"
            ></nz-switch>
          </div>
        </div>

        <div class="header-right-actions">
          @if (!state.showDeleted()) {
            <button nz-button nzType="primary" (click)="onAdd()">
              <i nz-icon nzType="plus"></i>
              Добавить тип лицензии
            </button>
          }
        </div>
      </div>

      @if (state.error(); as error) {
        <div class="error-container">
          <nz-alert
            nzType="error"
            [nzMessage]="error.title"
            [nzDescription]="error.getUserMessage()"
            nzShowIcon
          ></nz-alert>
        </div>
      }

      <nz-table
        #basicTable
        [nzData]="state.items()"
        [nzLoading]="state.loading() && state.items().length > 0"
        [nzTotal]="state.total()"
        [nzPageIndex]="state.pageNumber()"
        [nzPageSize]="state.pageSize()"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
      >
        <thead>
          <tr>
            <th 
              nzWidth="100px" 
              [nzSortFn]="true"
              [nzSortOrder]="state.sortBy() === 'Id' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
              (nzSortOrderChange)="onSortChange('Id', $event)"
            >ID</th>
            <th 
              [nzSortFn]="true"
              [nzSortOrder]="state.sortBy() === 'CanonicalName' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
              (nzSortOrderChange)="onSortChange('CanonicalName', $event)"
            >Название (Master)</th>
            <th 
              [nzSortFn]="true"
              [nzSortOrder]="state.sortBy() === 'Slug' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
              (nzSortOrderChange)="onSortChange('Slug', $event)"
            >Slug</th>
            <th>Локализации</th>
            <th 
              nzWidth="100px" 
              [nzSortFn]="true"
              [nzSortOrder]="state.sortBy() === 'SortOrder' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
              (nzSortOrderChange)="onSortChange('SortOrder', $event)"
            >Порядок</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="120px">Действия</th>
          </tr>
        </thead>
        <tbody>
          @if (state.loading() && state.items().length === 0) {
            @for (skeleton of [1, 2, 3, 4, 5]; track skeleton) {
              <tr>
                <td colspan="7">
                  <nz-skeleton
                    [nzActive]="true"
                    [nzTitle]="false"
                    [nzParagraph]="{ rows: 1 }"
                  ></nz-skeleton>
                </td>
              </tr>
            }
          }

          @for (data of basicTable.data; track data.id) {
            <tr [class.deleted-row]="data.isDeleted">
              <td>{{ data.id }}</td>
              <td>
                <span class="tech-name">{{ data.canonicalName }}</span>
              </td>
              <td>
                <span class="av-tag-slug">{{ data.slug || '—' }}</span>
              </td>
              <td>
                <span class="localization-text">{{ data.localizedName || '—' }}</span>
              </td>
              <td>{{ data.sortOrder }}</td>
              <td>
                <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                  {{ data.isActive ? 'Активен' : 'Отключен' }}
                </nz-tag>
              </td>
              <td>
                <div class="actions">
                  @if (data.isDeleted) {
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Восстановить из корзины"
                      (click)="onRestore(data.id)"
                    >
                      <i nz-icon nzType="undo" class="restore-icon"></i>
                    </button>

                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="СТЕРЕТЬ ПОЛНОСТЬЮ"
                      (click)="onHardDelete(data.id)"
                      [nzLoading]="state.deletingId() === data.id"
                    >
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  } @else {
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Просмотр деталей"
                      (click)="onView(data.id)"
                    >
                      <i nz-icon nzType="eye" class="view-icon"></i>
                    </button>

                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Быстрая правка"
                      (click)="onEdit(data.id)"
                    >
                      <i nz-icon nzType="edit" class="edit-icon"></i>
                    </button>

                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Удалить в корзину"
                      (click)="onDelete(data.id)"
                      [nzLoading]="state.deletingId() === data.id"
                    >
                      <i nz-icon nzType="rest" class="delete-icon"></i>
                    </button>

                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="СТЕРЕТЬ ПОЛНОСТЬЮ (Hard)"
                      (click)="onHardDelete(data.id)"
                      [nzLoading]="state.deletingId() === data.id"
                    >
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <div class="pagination-footer">
        <av-pagination
          [total]="state.total() || 0"
          [currentPage]="state.pageNumber() || 1"
          [pageSize]="state.pageSize() || 10"
          [showQuickJumper]="true"
          shape="rounded"
          (paginationChange)="onPaginationChange($event)"
        ></av-pagination>
      </div>
    </nz-card>
  `,
  styleUrls: ['./license-type-of-aggregator-list.component.scss'],
})
export class LicenseTypeOfAggregatorListComponent {
  searchTerm = '';

  @Input() usePageNavigation = false;

  constructor(
    public state: LicenseTypeOfAggregatorStateService,
    private modalService: ModalService,
  ) {}

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.state.setSearchTerm(term);
  }

  onLanguageChange(langId: number | null): void {
    this.state.setLanguageId(langId);
  }

  onPaginationChange(event: PaginationChangeEvent): void {
    this.state.setPageSize(event.pageSize);
    this.state.setPageIndex(event.page);
  }

  onSortChange(column: string, direction: string | null): void {
    this.state.setSort(column, direction);
  }

  onToggleTrash(show: boolean): void {
    this.state.setShowDeleted(show);
  }

  onAdd(): void {
    this.state.openAddModal();
  }

  onEdit(id: number): void {
    this.state.openEditModal(id);
  }

  onView(id: number): void {
    this.state.openViewModal(id);
  }


  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить тип лицензии?',
      message: 'Запись снова станет доступной в основном списке.',
      confirmText: 'Восстановить',
      confirmType: 'primary',
    });

    if (confirmed) {
      this.state.restore(id);
    }
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить тип лицензии?',
      message:
        'Запись будет перемещена в корзину. Её можно будет восстановить позже.',
      confirmText: 'Удалить',
      confirmType: 'danger',
    });

    if (confirmed) {
      this.state.delete(id, false);
    }
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит тип лицензии. Это может нарушить целостность данных в каталоге программ.',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое удаление (Hard)',
    );

    if (confirmed) {
      this.state.delete(id, true);
    }
  }
}
