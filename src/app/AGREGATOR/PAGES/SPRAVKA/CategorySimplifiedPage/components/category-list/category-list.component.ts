import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PaginationChangeEvent, PaginationComponent } from '@shared/components/ui';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { AvSearchComponent } from '@shared/components/ui/search';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CategoryItemDto } from '../../models/category-simplified.model';
import { CategorySimplifiedStateService } from '../../services/category-simplified-state.service';
import { SubcategoryListComponent } from '../subcategory-list/subcategory-list.component';
// import { SubcategoryListComponent } from '../subcategory-list/subcategory-list.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
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
    NzAlertModule,
    NzCardModule,
    AvSearchComponent,
    PaginationComponent,
    SubcategoryListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      <div class="table-header">
        <div class="left-actions">
          <av-search
            [avLoading]="state.loading()"
            avPlaceholder="Поиск категорий..."
            (searchChange)="state.setSearch($event)"
            [showButton]="false"
          ></av-search>

          <nz-select
            style="width: 180px;"
            [ngModel]="null"
            (ngModelChange)="state.setLanguageId($event)"
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
              (ngModelChange)="state.setShowDeleted($event)"
              nzSize="small"
            ></nz-switch>
          </div>
        </div>
      </div>

      @if (state.showDeleted()) {
        <nz-alert
          nzType="warning"
          nzMessage="Режим корзины: показаны только удаленные категории"
          nzShowIcon
          style="margin-bottom: 16px;"
        ></nz-alert>
      }

      <nz-table
        #categoryTable
        [nzData]="state.items()"
        [nzLoading]="state.loading()"
        [nzTotal]="state.total()"
        [nzPageIndex]="state.pageNumber()"
        [nzPageSize]="state.pageSize()"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th nzWidth="60px"></th>
            <th nzWidth="80px">ID</th>
            <th>Иконка</th>
            <th>Название / Код</th>
            <th>Slug</th>
            <th>Порядок</th>
            <th>Подкат. / Прогр.</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="180px">Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of categoryTable.data; track data.id) {
            <tr>
              <td
                [nzExpand]="expandSet().has(data.id)"
                (click)="$event.stopPropagation(); onExpand(data, !expandSet().has(data.id))"
                class="expand-trigger-cell"
              >
                <i nz-icon [nzType]="expandSet().has(data.id) ? 'down' : 'right'" class="expand-icon"></i>
              </td>
              <td>{{ data.id }}</td>
              <td>
                <ng-container *ngIf="data.iconUrl; else noIcon">
                  <!-- 1. Проверяем наличие в кастомном JSON (SVG код) -->
                  @if (state.iconsMap().has(data.iconUrl)) {
                    <div [innerHTML]="sanitizer.bypassSecurityTrustHtml(state.iconsMap().get(data.iconUrl)!)" class="custom-svg-icon"></div>
                  } 
                  <!-- 2. Если это путь (содержит / или расширение) -->
                  @else if (data.iconUrl.includes('/') || data.iconUrl.includes('.')) {
                    <img
                      [src]="imgService.getAssetUrl(data.iconUrl)"
                      (error)="imgService.handleError($event)"
                      class="category-icon-img"
                      alt="icon"
                    />
                  } @else {
                    <!-- 3. Если это имя иконки Ant Design -->
                    <i nz-icon [nzType]="data.iconUrl" style="font-size: 20px;"></i>
                  }
                </ng-container>
                <ng-template #noIcon>
                  <i nz-icon nzType="folder" style="font-size: 20px; color: #ccc;"></i>
                </ng-template>
              </td>
              <td>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 600;">{{
                    data.localizedName || data.canonicalName
                  }}</span>
                  <span style="font-size: 11px; color: #8c8c8c;">{{ data.canonicalName }}</span>
                </div>
              </td>
              <td>
                <nz-tag nzColor="blue">{{ data.slug }}</nz-tag>
              </td>
              <td>
                <nz-tag nzColor="orange">{{ data.sortOrder }}</nz-tag>
              </td>
              <td>
                <nz-tag nzColor="cyan">{{ data.subcategoriesCount }} подкат.</nz-tag>
                <nz-tag nzColor="purple">{{ data.programsCount }} прогр.</nz-tag>
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
                      <i nz-icon nzType="undo" style="color: #52c41a;"></i>
                    </button>
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Удалить навсегда"
                      (click)="onHardDelete(data.id)"
                    >
                      <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                    </button>
                  } @else {
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Просмотр"
                      (click)="onView(data.id)"
                    >
                      <i nz-icon nzType="eye" style="color: #1890ff;"></i>
                    </button>
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Правка"
                      (click)="onEdit(data.id)"
                    >
                      <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                    </button>
                    
                    @if (!data.isSystem) {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="В корзину"
                        (click)="onDelete(data.id)"
                      >
                        <i nz-icon nzType="rest" style="color: #faad14;"></i>
                      </button>
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Удалить навсегда"
                        (click)="onHardDelete(data.id)"
                      >
                        <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                      </button>
                    } @else {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Системная категория (удаление запрещено)"
                        disabled
                      >
                        <i nz-icon nzType="lock" style="color: #d9d9d9;"></i>
                      </button>
                    }
                  }
                </div>
              </td>
            </tr>
            <tr [nzExpand]="expandSet().has(data.id)">
              <app-subcategory-list [categoryId]="data.id"></app-subcategory-list>
            </tr>
          }
        </tbody>
      </nz-table>

      <div class="pagination-footer">
        <av-pagination
          [total]="state.total() || 0"
          [currentPage]="state.pageNumber() || 1"
          [pageSize]="state.pageSize() || 10"
          (paginationChange)="onPaginationChange($event)"
        ></av-pagination>
      </div>
    </nz-card>
  `,
  styles: [
    `
      .table-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .left-actions {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .trash-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #8c8c8c;
      }
      .trash-toggle.active {
        color: #faad14;
      }
      .actions {
        display: flex;
        gap: 4px;
      }
      .pagination-footer {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
      }
      .category-icon-img {
        width: 32px;
        height: 32px;
        object-fit: contain;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 4px;
        border: 1px solid #f0f0f0;
      }
      .custom-svg-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--av-primary-color, #1890ff);
      }
      .custom-svg-icon ::ng-deep svg {
        width: 100%;
        height: 100%;
      }
      .expand-trigger-cell {
        cursor: pointer;
        text-align: center;
        transition: all 0.3s;
      }
      .expand-icon {
        font-size: 14px;
        color: #8c8c8c;
        transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      .expand-trigger-cell[nzExpand="true"] .expand-icon {
        color: #1890ff;
      }
      ::ng-deep .ant-table-row-expand-icon {
        display: none !important;
      }
    `,
  ],
})
export class CategoryListComponent {
  public state = inject(CategorySimplifiedStateService);
  public imgService = inject(ImageServiceUniversal);
  public sanitizer = inject(DomSanitizer);
  private modalService = inject(ModalService);

  expandSet = signal(new Set<number>());

  onExpand(data: CategoryItemDto, checked: boolean): void {
    this.expandSet.update(set => {
      const newSet = new Set(set);
      if (checked) {
        newSet.add(data.id);
      } else {
        newSet.delete(data.id);
      }
      return newSet;
    });
  }

  onPaginationChange(event: PaginationChangeEvent): void {
    this.state.setPageSize(event.pageSize);
    this.state.setPageIndex(event.page);
  }

  onView(id: number): void {
    this.state.updateState({ selectedCategoryId: id, isReadOnly: true });
  }

  onEdit(id: number): void {
    this.state.updateState({ selectedCategoryId: id, isReadOnly: false });
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить категорию?',
      confirmText: 'Да',
      confirmType: 'primary',
      message: '',
    });
    if (confirmed) this.state.restoreCategory(id);
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challengeWarning(
      'Это действие переместит категорию в корзину. Программы из неё будут временно перенесены в категорию Uncategorized.',
      'Запись можно будет <span class="text-warning">восстановить</span> позже. Введите <span class="text-warning">"КОРЗИНА"</span> для подтверждения:',
      'КОРЗИНА',
      'УДАЛИТЬ В КОРЗИНУ?'
    );
    if (confirmed) this.state.deleteCategory(id, false);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы уверены, что хотите УДАЛИТЬ категорию ПОЛНОСТЬЮ?',
      'Это действие необратимо. Введите <span class="text-danger">"УДАЛИТЬ"</span> для подтверждения:',
      'УДАЛИТЬ',
      'ОПАСНОЕ ДЕЙСТВИЕ',
      'modal-danger'
    );
    if (confirmed) this.state.deleteCategory(id, true);
  }
}
