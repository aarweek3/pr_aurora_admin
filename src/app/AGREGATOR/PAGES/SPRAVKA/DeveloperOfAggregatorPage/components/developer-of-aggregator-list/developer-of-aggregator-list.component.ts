import { Component, inject, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DeveloperOfAggregatorStateService } from '../../services/developer-of-aggregator-state.service';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

import { PaginationComponent, PaginationChangeEvent } from '@shared/components/ui';
import { AvSearchComponent } from '@shared/components/ui/search';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

@Component({
  selector: 'app-developer-of-aggregator-list',
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
    NzSkeletonModule,
    NzAlertModule,
    NzCardModule,
    NzSelectModule,
    NzSwitchModule,
    NzSpaceModule,
    NzDropDownModule,
    AvSearchComponent,
    PaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      @if (state.showDeleted()) {
        <div class="trash-alert">
          <nz-alert
            nzType="warning"
            nzMessage="Режим корзины активен. Вы видите только удаленные записи."
            nzShowIcon
          ></nz-alert>
        </div>
      }

      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <av-search
              [(value)]="searchTerm"
              [avLoading]="state.loading()"
              avPlaceholder="Поиск по названию или коду..."
              (searchChange)="onSearchChange($event)"
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
            <span class="label">КОРЗИНА</span>
            <nz-switch
              [ngModel]="state.showDeleted()"
              (ngModelChange)="onToggleTrash($event)"
              nzSize="small"
            ></nz-switch>
          </div>
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
        nzSize="middle"
      >
        <thead>
          <tr>
            <th
              nzWidth="80px"
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'Id'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('Id', $event)"
            >
              ID
            </th>
            <th
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'Name'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('Name', $event)"
            >
              Разработчик
            </th>
            <th
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'SystemCode'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('SystemCode', $event)"
            >
              Код (SystemCode)
            </th>
            <th
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'SortOrder'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('SortOrder', $event)"
            >
              Порядок
            </th>
            <th
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'ProgramsCount'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('ProgramsCount', $event)"
            >
              Программы
            </th>
            <th>Сайт</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="150px">Действия</th>
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
                <div class="developer-info">
                  @if (data.iconPath) {
                    <img [src]="imgService.getAssetUrl(data.iconPath)" class="developer-icon" />
                  } @else {
                    <div class="developer-icon-placeholder"><i nz-icon nzType="api"></i></div>
                  }
                  <div style="display: flex; flex-direction: column;">
                    <span class="tech-name">{{ data.name }}</span>
                    <span class="localization-subtext">{{ data.localizedName || '' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <nz-tag nzColor="blue">{{ data.systemCode }}</nz-tag>
              </td>
              <td>
                <nz-tag nzColor="orange">{{ data.sortOrder }}</nz-tag>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <i nz-icon nzType="appstore" style="color: #1890ff;"></i>
                  <span class="programs-count">{{ data.programsCount || 0 }}</span>
                </div>
              </td>
              <td>
                <a *ngIf="data.website" [href]="data.website" target="_blank">{{ data.website }}</a>
                <span *ngIf="!data.website">—</span>
              </td>
              <td>
                <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                  {{ data.isActive ? 'Активен' : 'Пауза' }}
                </nz-tag>
              </td>
              <td>
                <div class="actions">
                  @if (data.isDeleted) {
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Восстановить"
                      (click)="onRestore(data.id)"
                    >
                      <i nz-icon nzType="undo" class="restore-icon"></i>
                    </button>
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Удалить окончательно"
                      (click)="onHardDelete(data.id)"
                    >
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  } @else {
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Просмотр"
                      class="view-btn"
                      (click)="onView(data.id)"
                    >
                      <i nz-icon nzType="eye" class="view-icon"></i>
                    </button>

                    @if (usePageNavigation) {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Редактировать на странице"
                        [routerLink]="[data.id, 'edit']"
                      >
                        <i nz-icon nzType="fullscreen" class="edit-icon"></i>
                      </button>
                    } @else {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Быстрая правка"
                        (click)="onEdit(data.id)"
                      >
                        <i nz-icon nzType="edit" class="edit-icon"></i>
                      </button>
                    }

                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="В корзину"
                      (click)="onDelete(data.id)"
                    >
                      <i nz-icon nzType="rest" class="delete-icon"></i>
                    </button>
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Hard Delete"
                      (click)="onHardDelete(data.id)"
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
  styleUrls: ['./developer-of-aggregator-list.component.scss'],
})
export class DeveloperOfAggregatorListComponent {
  public state = inject(DeveloperOfAggregatorStateService);
  public imgService = inject(ImageServiceUniversal);
  private modalService = inject(ModalService);

  searchTerm = '';

  @Input() usePageNavigation = false;

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.state.setSearch(term);
  }

  onLanguageChange(langId: number | null): void {
    this.state.setLanguageId(langId);
  }

  onToggleTrash(show: boolean): void {
    this.state.setShowDeleted(show);
  }

  onPaginationChange(event: PaginationChangeEvent): void {
    this.state.setPageSize(event.pageSize);
    this.state.setPageIndex(event.page);
  }

  onSortChange(column: string, direction: string | null): void {
    this.state.setSort(column, direction);
  }

  onAdd(): void {
    this.state.openAddModal(() => {});
  }

  onView(id: number): void {
    this.state.openView(id);
  }

  onEdit(id: number): void {
    this.state.updateState({ selectedId: id });
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить разработчика?',
      message: 'Запись снова станет доступной в основном списке.',
      confirmText: 'Восстановить',
      confirmType: 'primary',
    });
    if (confirmed) this.state.restore(id);
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить разработчика?',
      message: 'Запись будет перемещена в корзину. Её можно будет восстановить позже.',
      confirmText: 'Удалить',
      confirmType: 'danger',
    });
    if (confirmed) this.state.delete(id);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит разработчика из базы данных.',
      '2 + 2 = ?',
      '4',
      'Удалить навсегда',
    );
    if (confirmed) this.state.hardDelete(id);
  }
}
