import { Component, inject, ChangeDetectionStrategy, OnInit, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryTagOfAggregatorStateService } from '../../services/category-tag-of-aggregator-state.service';

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

import { PaginationComponent, PaginationChangeEvent } from '@shared/components/ui';
import { AvSearchComponent } from '@shared/components/ui/search';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

@Component({
  selector: 'app-category-tag-of-aggregator-list',
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
              avPlaceholder="Поиск по названию или Slug..."
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
            <th nzWidth="80px" [nzSortFn]="true" (nzSortOrderChange)="onSortChange('Id', $event)">
              ID
            </th>
            <th [nzSortFn]="true" (nzSortOrderChange)="onSortChange('Name', $event)">Категория</th>
            <th [nzSortFn]="true" (nzSortOrderChange)="onSortChange('Slug', $event)">Slug</th>
            <th [nzSortFn]="true" (nzSortOrderChange)="onSortChange('SortOrder', $event)">
              Порядок
            </th>
            <th [nzSortFn]="true" (nzSortOrderChange)="onSortChange('TagsCount', $event)">Теги</th>
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
                <div class="category-info">
                  @if (data.iconPath) {
                    <div class="category-icon-wrapper" [style.--category-color]="data.color">
                      <i
                        nz-icon
                        [nzType]="getIconType(data.iconPath)"
                        [style.color]="data.color"
                        class="category-icon-font"
                      ></i>
                    </div>
                  } @else {
                    <div class="category-icon-placeholder"><i nz-icon nzType="folder"></i></div>
                  }
                  <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div class="color-dot" [style.background-color]="data.color"></div>
                      <span class="tech-name">{{ data.localizedName || data.slug }}</span>
                    </div>
                    @if (!data.localizedName) {
                      <span class="localization-subtext">no-trans</span>
                    }
                  </div>
                </div>
              </td>
              <td>
                <nz-tag nzColor="blue">{{ data.slug }}</nz-tag>
              </td>
              <td>
                <nz-tag nzColor="orange">{{ data.sortOrder }}</nz-tag>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <i nz-icon nzType="tags" style="color: #1890ff;"></i>
                  <span class="tags-count">{{ data.tagsCount || 0 }}</span>
                </div>
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
                      nzTooltipTitle="Удалить окончательно"
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
  styleUrls: ['./category-tag-of-aggregator-list.component.scss'],
})
export class CategoryTagOfAggregatorListComponent {
  public state = inject(CategoryTagOfAggregatorStateService);
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

  /**
   * Возвращает тип иконки с обработкой исключений и маппингом.
   * Фикс для иконки 'shield', которой нет в стандартном наборе Ant Design.
   */
  getIconType(path: string | undefined): string {
    if (!path) return 'tag';
    if (path === 'shield') return 'safety';
    return path;
  }

  /**
   * Возвращает цвет фона для иконки.
   * Если это HEX, добавляет прозрачность. Если var() - возвращает как есть с opacity в CSS.
   */
  getBgColor(color: string | undefined): string {
    if (!color) return '#f1f5f9';
    if (color.startsWith('var')) return color;
    if (color.startsWith('#')) return color + '15';
    return color;
  }

  onPaginationChange(event: PaginationChangeEvent): void {
    this.state.setPageSize(event.pageSize);
    this.state.setPageIndex(event.page);
  }

  onSortChange(column: string, direction: string | null): void {
    this.state.setSort(column, direction);
  }

  onView(id: number): void {
    this.state.openView(id);
  }

  onEdit(id: number): void {
    this.state.updateState({ selectedId: id });
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить категорию?',
      message: 'Запись снова станет доступной в основном списке.',
      confirmText: 'Восстановить',
      confirmType: 'primary',
    });
    if (confirmed) this.state.restore(id);
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить категорию?',
      message: 'Запись будет перемещена в корзину. Её можно будет восстановить позже.',
      confirmText: 'Удалить',
      confirmType: 'danger',
    });
    if (confirmed) this.state.delete(id);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит категорию из базы данных.',
      '2 + 2 = ?',
      '4',
      'Удалить навсегда',
    );
    if (confirmed) this.state.hardDelete(id);
  }
}
