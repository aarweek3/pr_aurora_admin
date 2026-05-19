import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { HelpUniversalModalComponent } from '@shared/components/help-universal-modal/help-universal-modal.component';

import { ButtonControlJsonBlockComponent } from '@controls';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryModalComponent } from './components/category-modal/category-modal.component';
import { SubcategoryModalComponent } from './components/subcategory-modal/subcategory-modal.component';
import { CategoryIconModalComponent } from './components/category-icon-modal/category-icon-modal.component';
import { CategorySimplifiedStateService } from './services/category-simplified-state.service';
// import { CategoryListComponent } from './components/category-list/category-list.component';
// import { CategoryModalComponent } from './components/category-modal/category-modal.component';
// import { SubcategoryModalComponent } from './components/subcategory-modal/subcategory-modal.component';

@Component({
  selector: 'app-category-simplified-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    CategoryListComponent,
    CategoryModalComponent,
    SubcategoryModalComponent,
    CategoryIconModalComponent,
    ButtonControlJsonBlockComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <div class="title-row">
                <h1>Упрощенные Категории (V2)</h1>
                <button
                  nz-button
                  nzType="text"
                  class="help-file-btn"
                  nz-tooltip
                  nzTooltipTitle="Карта файлов модуля"
                  (click)="openHelp()"
                >
                  ¿
                </button>
              </div>
              <button
                nz-button
                nzType="text"
                nzShape="circle"
                (click)="showMaintenance = !showMaintenance"
                nz-tooltip
                nzTooltipTitle="Настройки обслуживания БД"
              >
                <i
                  nz-icon
                  nzType="setting"
                  [nzSpin]="showMaintenance"
                  [style.color]="showMaintenance ? '#1890ff' : 'inherit'"
                ></i>
              </button>
            </div>
            <p class="subtitle">
              Двухуровневая структура: Мастер-категории и Подкатегории
              <span class="count-badge" *ngIf="state.total() !== null">
                — Всего категорий: <b>{{ state.total() }}</b>
              </span>
            </p>
          </div>

          <div class="header-actions">
            <button nz-button nzType="default" (click)="handleManageIcons()">
              <i nz-icon nzType="picture"></i>
              Управление иконками
            </button>

            <button nz-button nzType="primary" (click)="handleAddCategory()">
              <i nz-icon nzType="plus"></i>
              Добавить категорию
            </button>
            <button nz-button nzType="default" (click)="handleAddSubcategory()">
              <i nz-icon nzType="plus-circle"></i>
              Добавить подкатегорию
            </button>
          </div>
        </div>
      </div>

      <!-- Блок обслуживания -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="state.loading()"
        [total]="state.total() || 0"
        (clear)="handleClearDatabase()"
        (read)="handleReadFromDb()"
        (seed)="handleSeedFromJson()"
      ></app-button-control-json-block>

      <!-- Список -->
      <div class="manager-content">
        <app-category-list></app-category-list>
      </div>

      <!-- Модалки -->
      <app-category-modal
        *ngIf="isCategoryModalVisible"
        [isVisible]="isCategoryModalVisible"
        [isReadOnly]="state.isReadOnly()"
        (modalClose)="closeCategoryModal()"
      ></app-category-modal>

      <app-subcategory-modal
        *ngIf="isSubcategoryModalVisible"
        [isVisible]="isSubcategoryModalVisible"
        [isReadOnly]="state.isReadOnly()"
        (modalClose)="closeSubcategoryModal()"
      ></app-subcategory-modal>

      <app-category-icon-modal
        *ngIf="isIconModalVisible"
        (modalClose)="isIconModalVisible = false"
      ></app-category-icon-modal>

      <!-- Sticky Status Bar -->
      <div class="sticky-status-bar">
        <div class="status-group">
          <span class="status-item">
            <i nz-icon nzType="database"></i>
            Категорий: <b>{{ state.total() || 0 }}</b>
          </span>
          <span class="status-divider"></span>
          <span class="status-item">
            <i nz-icon nzType="check-circle"></i>
            Справочник актуален
          </span>
        </div>
        <div class="status-group">
          <span class="status-item" *ngIf="state.loading()">
            <i nz-icon nzType="loading"></i> Обновление...
          </span>
          <span class="status-item version-tag"> v3.5.0 </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        position: relative;
        min-height: 100vh;
        padding-bottom: 60px;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .title-with-settings {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title-with-settings h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        color: #1e293b;
      }
      .help-file-btn {
        font-size: 24px;
        font-weight: 700;
        color: #1890ff;
        padding: 0 4px;
        line-height: 1;
        height: auto;
        opacity: 0.7;
        transition: all 0.3s;

        &:hover {
          opacity: 1;
          transform: scale(1.2);
          background: transparent !important;
        }
      }
      .subtitle {
        margin: 4px 0 0;
        color: #64748b;
      }
      .count-badge {
        color: #595959;
      }
      .header-actions {
        display: flex;
        gap: 12px;
      }
      .manager-content {
        margin-top: 24px;
      }
      .sticky-status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        z-index: 1000;
        font-size: 12px;
      }
      .status-group {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .status-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #595959;
      }
      .status-divider {
        width: 1px;
        height: 12px;
        background: #d9d9d9;
      }
      .version-tag {
        color: #bfbfbf;
        font-family: monospace;
      }
    `,
  ],
})
export class CategorySimplifiedManagerComponent implements OnInit {
  state = inject(CategorySimplifiedStateService);
  private modalService = inject(ModalService);
  private nzModal = inject(NzModalService);

  isCategoryModalVisible = false;
  isSubcategoryModalVisible = false;
  isIconModalVisible = false;
  showMaintenance = false;

  constructor() {
    effect(() => {
      if (this.state.selectedCategoryId()) {
        this.isCategoryModalVisible = true;
      }
      if (this.state.selectedSubcategoryId()) {
        this.isSubcategoryModalVisible = true;
      }
    });
  }

  ngOnInit(): void {
    this.state.loadItems();
  }

  handleAddCategory(): void {
    this.state.updateState({ selectedCategoryId: null, isReadOnly: false });
    this.isCategoryModalVisible = true;
  }

  handleAddSubcategory(): void {
    this.state.updateState({ selectedSubcategoryId: null });
    this.isSubcategoryModalVisible = true;
  }

  handleManageIcons(): void {
    this.isIconModalVisible = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalVisible = false;
    this.state.updateState({ selectedCategoryId: null, isReadOnly: false });
  }

  closeSubcategoryModal(): void {
    this.isSubcategoryModalVisible = false;
    this.state.updateState({ selectedSubcategoryId: null });
  }

  handleReadFromDb(): void {
    this.state.loadItems();
  }

  handleSeedFromJson(): void {
    if ((this.state.total() || 0) > 0) {
      this.modalService.warning(
        'База данных не пуста. Для переноса данных необходимо предварительно очистить БД.',
        'Перенос невозможен'
      );
      return;
    }
    this.state.seedFromJson();
  }

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из таблиц категорий?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое действие',
    );
    if (confirmed) {
      this.state.clearDatabase();
    }
  }

  openHelp(): void {
    this.nzModal.create({
      nzTitle: undefined,
      nzContent: HelpUniversalModalComponent,
      nzData: {
        helpId: 'categories-simplified',
        initialMode: 'view',
      },
      nzFooter: null,
      nzWidth: 1400,
      nzCentered: true,
      nzClassName: 'aurora-modal-glass',
    });
  }
}
