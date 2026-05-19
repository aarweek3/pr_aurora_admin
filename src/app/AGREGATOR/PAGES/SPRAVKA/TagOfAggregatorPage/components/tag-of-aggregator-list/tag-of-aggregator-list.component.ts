import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AvSearchComponent } from '@shared/components/ui/search';
import { TagOfAggregatorStateService } from '../../services/tag-of-aggregator-state.service';
import { TagOfAggregatorItem } from '../../models/tag-of-aggregator.model';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';

import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { PaginationComponent, PaginationChangeEvent } from '@shared/components/ui';

@Component({
  selector: 'app-tag-of-aggregator-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzSwitchModule,
    NzSelectModule,
    NzSkeletonModule,
    NzAlertModule,
    NzCardModule,
    NzSpaceModule,
    AvSearchComponent,
    PaginationComponent,
  ],
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      @if (state.showDeleted()) {
        <div class="trash-alert">
          <nz-alert
            nzType="warning"
            nzMessage="Режим корзины активен. Вы видите только удаленные теги."
            nzShowIcon
          ></nz-alert>
        </div>
      }

      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <av-search
              [value]="state.searchTerm() || ''"
              (valueChange)="state.setSearch($event)"
              avPlaceholder="Поиск по названию или коду..."
              [showButton]="false"
              class="search-input"
            ></av-search>
          </div>

          <nz-select
            [ngModel]="state.categoryTagId()"
            (ngModelChange)="state.setCategoryFilter($event)"
            nzPlaceHolder="Фильтр: Категории"
            nzAllowClear
            style="width: 180px;"
          >
            <nz-option
              *ngFor="let cat of state.categories()"
              [nzValue]="cat.id"
              [nzLabel]="cat.localizedName || cat.slug"
            ></nz-option>
          </nz-select>

          <nz-select
            style="width: 180px;"
            [ngModel]="state.selectedLanguageId()"
            (ngModelChange)="state.setLanguageFilter($event)"
            nzPlaceHolder="Фильтр: Язык"
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
              (ngModelChange)="state.setShowDeleted($event)"
              nzSize="small"
            ></nz-switch>
          </div>
        </div>

        <div class="right-actions" *ngIf="!state.showDeleted()">
          <button nz-button nzType="primary" (click)="add.emit()">
            <i nz-icon nzType="plus"></i>
            Добавить тег
          </button>
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

      <!-- TABLE -->
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
        class="aurora-table"
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
              Тег
            </th>
            <th
              [nzSortFn]="true"
              [nzSortOrder]="
                state.sortBy() === 'Slug'
                  ? state.sortDirection() === 0
                    ? 'ascend'
                    : 'descend'
                  : null
              "
              (nzSortOrderChange)="onSortChange('Slug', $event)"
            >
              Системный код
            </th>
            <th>Категория</th>
            <th nzWidth="100px">Превью</th>
            <th
              nzWidth="100px"
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
            <th nzWidth="120px">Статус</th>
            <th nzWidth="180px">Действия</th>
          </tr>
        </thead>
        <tbody>
          @if (state.loading() && state.items().length === 0) {
            @for (skeleton of [1, 2, 3, 4, 5]; track skeleton) {
              <tr>
                <td colspan="8">
                  <nz-skeleton
                    [nzActive]="true"
                    [nzTitle]="false"
                    [nzParagraph]="{ rows: 1 }"
                  ></nz-skeleton>
                </td>
              </tr>
            }
          }

          <tr *ngFor="let data of basicTable.data" [class.deleted-row]="state.showDeleted()">
            <td>
              <span class="text-secondary">{{ data.id }}</span>
            </td>
            <td>
              <div class="entity-cell">
                <div class="entity-info">
                  <div class="name-row">
                    <nz-tag [nzColor]="data.displayColor || 'blue'" class="name-tag">
                      <ng-container *ngIf="data.displayIcon">
                        <div
                          *ngIf="isCustomIcon(data.displayIcon); else standardIcon"
                          class="tag-icon"
                          [style.-webkit-mask-image]="
                            'url(' + imgService.getAssetUrl(data.displayIcon) + ')'
                          "
                          [style.mask-image]="
                            'url(' + imgService.getAssetUrl(data.displayIcon) + ')'
                          "
                        ></div>
                        <ng-template #standardIcon>
                          <i
                            nz-icon
                            [nzType]="getStandardIcon(data.displayIcon)"
                            class="tag-icon-standard"
                          ></i>
                        </ng-template>
                      </ng-container>
                      <span class="tag-text">{{ data.localizedName || data.slug }}</span>
                    </nz-tag>
                    <span
                      *ngIf="data.requiresTranslation"
                      class="red-dot"
                      nz-tooltip
                      nzTooltipTitle="Требуется перевод"
                    ></span>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <nz-tag nzColor="blue" class="slug-tag">{{ data.slug }}</nz-tag>
            </td>
            <td>
              <span class="text-secondary">{{ data.categoryName }}</span>
            </td>
            <td>
              <div class="style-preview" [style.border-color]="data.displayColor">
                <ng-container *ngIf="data.displayIcon">
                  <div
                    *ngIf="isCustomIcon(data.displayIcon); else standardIconPreview"
                    class="preview-icon"
                    [style.background-color]="data.displayColor"
                    [style.-webkit-mask-image]="
                      'url(' + imgService.getAssetUrl(data.displayIcon) + ')'
                    "
                    [style.mask-image]="'url(' + imgService.getAssetUrl(data.displayIcon) + ')'"
                  ></div>
                  <ng-template #standardIconPreview>
                    <i
                      nz-icon
                      [nzType]="getStandardIcon(data.displayIcon)"
                      [style.color]="data.displayColor"
                      style="font-size: 16px;"
                    ></i>
                  </ng-template>
                </ng-container>
              </div>
            </td>
            <td>
              <span class="order-badge">{{ data.sortOrder }}</span>
            </td>
            <td>
              <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                {{ data.isActive ? 'Активен' : 'Пауза' }}
              </nz-tag>
            </td>
            <td>
              <div class="actions">
                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Просмотр"
                  (click)="state.openView(data.id)"
                >
                  <i nz-icon nzType="eye" class="view-icon"></i>
                </button>

                @if (state.showDeleted()) {
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
                    nzTooltipTitle="Правка"
                    (click)="state.openEditModal(data.id)"
                  >
                    <i nz-icon nzType="edit" class="edit-icon"></i>
                  </button>
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
  styles: [
    `
      .page-card {
        border-radius: 8px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .trash-alert {
        margin-bottom: 16px;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
      }
      .left-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
      }
      .search-box {
        width: 300px;
      }

      .trash-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f1f5f9;
        padding: 4px 12px;
        border-radius: 20px;
        transition: all 0.3s;
        border: 1px solid transparent;
      }
      .trash-toggle.active {
        background: #fee2e2;
        border-color: #fca5a5;
      }
      .trash-toggle .label {
        font-size: 10px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.5px;
      }
      .trash-toggle.active .label {
        color: #b91c1c;
      }

      .aurora-table {
        margin-top: 8px;
      }

      .entity-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .name-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .name-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 6px;
        font-weight: 600;
        height: auto;
        border: none;
      }
      .tag-icon {
        width: 14px;
        height: 14px;
        background-color: #fff;
        mask-size: contain;
        -webkit-mask-size: contain;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-position: center;
      }
      .tag-text {
        color: #fff;
        font-size: 13px;
      }
      .tag-icon-standard {
        color: #fff;
        font-size: 14px;
      }

      .red-dot {
        width: 6px;
        height: 6px;
        background: #ef4444;
        border-radius: 50%;
        display: inline-block;
      }
      .slug-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        border-radius: 4px;
      }
      .order-badge {
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 700;
        color: #475569;
      }

      .style-preview {
        width: 28px;
        height: 28px;
        border: 2px solid;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
      }
      .preview-icon {
        width: 16px;
        height: 16px;
        mask-size: contain;
        -webkit-mask-size: contain;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-position: center;
      }

      .actions {
        display: flex;
        gap: 4px;
      }
      .actions i {
        font-size: 17px;
        color: #64748b;
        transition: all 0.2s;
      }
      .view-icon:hover {
        color: #3b82f6;
      }
      .edit-icon:hover {
        color: #2563eb;
      }
      .delete-icon:hover {
        color: #ef4444;
      }
      .hard-delete-icon:hover {
        color: #f97316;
      }
      .restore-icon:hover {
        color: #10b981;
      }

      .pagination-footer {
        margin-top: 24px;
        display: flex;
        justify-content: center;
      }

      .deleted-row {
        background-color: #fff1f0;
      }

      ::ng-deep .ant-table-thead > tr > th {
        background: #f8fafc !important;
        color: #475569 !important;
        font-weight: 700 !important;
      }
    `,
  ],
})
export class TagOfAggregatorListComponent {
  public state = inject(TagOfAggregatorStateService);
  public imgService = inject(ImageServiceUniversal);
  private modalService = inject(ModalService);

  @Output() add = new EventEmitter<void>();

  onPaginationChange(event: PaginationChangeEvent): void {
    this.state.setPageSize(event.pageSize);
    this.state.setPageIndex(event.page);
  }

  onSortChange(column: string, direction: string | null): void {
    this.state.setSort(column, direction);
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить тег?',
      message: 'Тег будет перемещен в корзину. Его можно будет восстановить позже.',
      confirmText: 'В корзину',
      confirmType: 'danger',
    });
    if (confirmed) this.state.delete(id);
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить тег?',
      message: 'Тег снова станет доступным в основном списке.',
      confirmText: 'Восстановить',
      confirmType: 'primary',
    });
    if (confirmed) this.state.restore(id);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит тег из базы данных.',
      '2 + 2 = ?',
      '4',
      'Удалить навсегда',
    );
    if (confirmed) this.state.hardDelete(id);
  }

  isCustomIcon(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.includes('.') || icon.includes('/');
  }

  getStandardIcon(icon: string | undefined): string {
    if (!icon) return 'tag';
    if (icon.startsWith('nz-icon:')) {
      return icon.replace('nz-icon:', '');
    }
    return icon;
  }
}
