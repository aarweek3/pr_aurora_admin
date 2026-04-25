import { Component, inject, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryOfAggregatorStateService } from '../../services/category-of-aggregator-state.service';
import { CategoryOfAggregatorItem } from '../../models/category-of-aggregator.model';

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

import { PaginationComponent, PaginationChangeEvent } from '@shared/components/ui';
import { AvSearchComponent } from '@shared/components/ui/search';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

@Component({
  selector: 'app-category-of-aggregator-list',
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
    AvSearchComponent,
    PaginationComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      @if (state.showDeleted()) {
        <div class="trash-alert">
          <nz-alert
            nzType="warning"
            nzMessage="Режим корзины активен. Вы видите только удаленные категории."
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
        #expandTable 
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
            <th nzWidth="80px"
                [nzSortFn]="true" 
                [nzSortOrder]="state.sortBy() === 'Id' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
                (nzSortOrderChange)="onSortChange('Id', $event)"
            >ID</th>
            <th [nzSortFn]="true" 
                [nzSortOrder]="state.sortBy() === 'CanonicalName' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
                (nzSortOrderChange)="onSortChange('CanonicalName', $event)">
                Категория
            </th>
            <th>Slug</th>
            <th [nzSortFn]="true" 
                [nzSortOrder]="state.sortBy() === 'SortOrder' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
                (nzSortOrderChange)="onSortChange('SortOrder', $event)">
                Порядок
            </th>
            <th [nzSortFn]="true"
                [nzSortOrder]="state.sortBy() === 'ProgramsCount' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
                (nzSortOrderChange)="onSortChange('ProgramsCount', $event)">
                Программы
            </th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="160px">Действия</th>
          </tr>
        </thead>
        <tbody>
          @if (state.loading() && state.items().length === 0) {
            @for (skeleton of [1, 2, 3, 4, 5]; track skeleton) {
              <tr>
                <td colspan="7">
                  <nz-skeleton [nzActive]="true" [nzTitle]="false" [nzParagraph]="{ rows: 1 }"></nz-skeleton>
                </td>
              </tr>
            }
          }

          @for (data of expandTable.data; track data.id) {
            <tr [class.deleted-row]="data.isDeleted" [hidden]="isHidden(data)">
              <td>{{ data.id }}</td>
              <td>
                <div class="category-info">
                   <!-- Tree Indentation -->
                   <div class="tree-cell" [style.padding-left.px]="data.level ? data.level * 24 : 0">
                      @if (data.childrenCount > 0 || (data.children && data.children.length > 0)) {
                        <button nz-button nzType="text" nzSize="small" (click)="onExpandChange(data, !data.expand)">
                          <i nz-icon [nzType]="data.expand ? 'minus-square' : 'plus-square'"></i>
                        </button>
                      } @else {
                         <span style="width: 24px; display: inline-block;"></span>
                      }
                      
                      @if (data.iconPath) {
                         <img [src]="imgService.getAssetUrl(data.iconPath)" class="category-icon" />
                      } @else {
                         <div class="category-icon-placeholder"><i nz-icon nzType="folder"></i></div>
                      }
                      
                      <div class="text-group">
                        <span class="tech-name">{{ data.canonicalName }}</span>
                        <span class="localization-subtext">{{ data.localizedName || '' }}</span>
                      </div>
                      
                      @if (data.isSystem) {
                        <i nz-icon nzType="lock" nz-tooltip nzTooltipTitle="Системная категория" style="color: #faad14; margin-left: 4px;"></i>
                      }
                   </div>
                </div>
              </td>
              <td><span class="slug-text">{{ data.slug }}</span></td>
              <td><nz-tag nzColor="orange">{{ data.sortOrder }}</nz-tag></td>
              <td>
                <div class="programs-badge">
                  <i nz-icon nzType="appstore"></i>
                  <span>{{ data.programsCount || 0 }}</span>
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
                    <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Восстановить" (click)="onRestore(data.id)">
                      <i nz-icon nzType="undo" class="restore-icon"></i>
                    </button>
                    <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Удалить окончательно" (click)="onHardDelete(data.id)">
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  } @else {
                    <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Просмотр" class="view-btn" (click)="onView(data.id)">
                      <i nz-icon nzType="eye" class="view-icon"></i>
                    </button>

                    @if (usePageNavigation) {
                      <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Редактировать на странице" [routerLink]="[data.id, 'edit']">
                        <i nz-icon nzType="fullscreen" class="edit-icon"></i>
                      </button>
                    } @else {
                      <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Быстрая правка" (click)="onEdit(data.id)">
                        <i nz-icon nzType="edit" class="edit-icon"></i>
                      </button>
                    }

                    <button nz-button nzType="text" nz-tooltip nzTooltipTitle="В корзину" (click)="onDelete(data.id)" [disabled]="data.isSystem">
                      <i nz-icon nzType="rest" class="delete-icon"></i>
                    </button>
                    <button nz-button nzType="text" nz-tooltip nzTooltipTitle="Удалить навсегда" (click)="onHardDelete(data.id)" [disabled]="data.isSystem">
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <div class="pagination-footer" *ngIf="state.searchTerm() || state.showDeleted()">
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
  styleUrls: ['./category-of-aggregator-list.component.scss'],
})
export class CategoryOfAggregatorListComponent {
  public state = inject(CategoryOfAggregatorStateService);
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

  isHidden(item: CategoryOfAggregatorItem): boolean {
    if (this.state.searchTerm() || this.state.showDeleted()) return false;
    let parentId = item.parentId;
    const map = this.state.itemMap();
    while (parentId) {
      const parent = map.get(parentId);
      if (parent && !parent.expand) return true;
      parentId = parent?.parentId;
    }
    return false;
  }

  onExpandChange(item: CategoryOfAggregatorItem, checked: boolean): void {
     item.expand = checked;
     // Принудительно уведомляем Angular об изменениях, так как мы меняем свойство внутри объекта
     this.state.updateState({ items: [...this.state.items()] });
  }

  onView(id: number): void {
    this.state.openView(id);
  }

  onEdit(id: number): void {
    this.state.openEditModal(id, () => {});
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
      message: 'Запись будет перемещена в корзину. Внимание: это может повлиять на дочерние элементы!',
      confirmText: 'Удалить',
      confirmType: 'danger',
    });
    if (confirmed) this.state.delete(id);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит категорию из базы данных.',
      '1 + 1 = ?',
      '2',
      'Удалить навсегда'
    );
    if (confirmed) this.state.hardDelete(id);
  }
}
