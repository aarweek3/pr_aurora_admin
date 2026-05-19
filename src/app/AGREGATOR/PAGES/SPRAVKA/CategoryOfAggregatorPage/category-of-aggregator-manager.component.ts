import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HelpUniversalModalComponent } from '@shared/components/help-universal-modal/help-universal-modal.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ButtonControlJsonBlockComponent } from '@controls';
import { CategoryOfAggregatorListComponent } from './components/category-of-aggregator-list/category-of-aggregator-list.component';
import { CategoryOfAggregatorModalComponent } from './components/category-of-aggregator-modal/category-of-aggregator-modal.component';
import { CategoryOfAggregatorViewModalComponent } from './components/category-of-aggregator-view-modal/category-of-aggregator-view-modal.component';
import { CategoryOfAggregatorStateService } from './services/category-of-aggregator-state.service';

@Component({
  selector: 'app-category-of-aggregator-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    CategoryOfAggregatorListComponent,
    CategoryOfAggregatorModalComponent,
    CategoryOfAggregatorViewModalComponent,
    ButtonControlJsonBlockComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <h1>Категории программ Агрегатора</h1>
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
              Управление иерархией и разделами каталога (Aurora v3.5 Reference)
              <button
                nz-button
                nzType="text"
                nzShape="circle"
                class="help-btn-inline"
                (click)="openHelp()"
                nz-tooltip
                nzTooltipTitle="Открыть справку модуля"
              >
                <i nz-icon nzType="question-circle" nzTheme="outline"></i>
              </button>
              <span class="count-badge" *ngIf="state.total() !== null">
                — Всего: <b>{{ state.total() }}</b>
              </span>
            </p>
          </div>

          <div class="header-actions">
            <nz-radio-group
              [ngModel]="viewMode()"
              (ngModelChange)="viewMode.set($event)"
              nzButtonStyle="solid"
              class="view-mode-toggle"
            >
              <label nz-radio-button nzValue="modal">Модалка</label>
              <label nz-radio-button nzValue="page">Страница</label>
            </nz-radio-group>

            <ng-container *ngIf="!state.showDeleted()">
              <button nz-button nzType="primary" (click)="handleAdd()">
                <i nz-icon nzType="plus"></i>
                Добавить категорию
              </button>
            </ng-container>
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

      <!-- Основной список -->
      <div class="manager-content">
        <app-category-of-aggregator-list
          [usePageNavigation]="viewMode() === 'page'"
        ></app-category-of-aggregator-list>
      </div>

      <!-- Модалки -->
      <app-category-of-aggregator-modal
        *ngIf="isModalVisible && viewMode() === 'modal'"
        [isVisible]="isModalVisible"
        (modalClose)="closeModal()"
      ></app-category-of-aggregator-modal>

      <app-category-of-aggregator-view-modal></app-category-of-aggregator-view-modal>

      <!-- Фиксация статуса -->
      <div class="sticky-status-bar">
        <div class="status-group">
          <span class="status-item">
            <i nz-icon nzType="database"></i>
            Всего записей: <b>{{ state.total() || 0 }}</b>
          </span>
          <span class="status-divider"></span>
          <span class="status-item">
            <i nz-icon nzType="global"></i>
            Языки: <b>Иниц.</b>
          </span>
        </div>
        <div class="status-group">
          <span class="status-item" *ngIf="state.loading()">
            <i nz-icon nzType="loading"></i> Обновление...
          </span>
          <span class="status-item version-tag">v3.5.0</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 60px;
      }

      .page-header {
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
      }

      .title-with-settings {
        display: flex;
        align-items: center;
        gap: 12px;
        h1 {
          margin: 0;
          font-weight: 800;
          color: #1e293b;
        }
      }

      .subtitle {
        color: #64748b;
        margin-top: 4px;
        display: flex;
        align-items: center;
        .count-badge {
          color: #1890ff;
          font-weight: 600;
        }

        .help-btn-inline {
          margin-left: 8px;
          margin-right: 8px;
          color: #3b82f6;
          height: 24px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            background: #eff6ff;
            color: #2563eb;
          }
          i {
            font-size: 16px;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .sticky-status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: #fff;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

        .status-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-item {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-divider {
          width: 1px;
          height: 16px;
          background: #e2e8f0;
        }
        .version-tag {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
      }
    `,
  ],
})
export class CategoryOfAggregatorManagerComponent implements OnInit {
  state = inject(CategoryOfAggregatorStateService);
  private modalService = inject(ModalService);
  private nzModal = inject(NzModalService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  viewMode = signal<'modal' | 'page'>('modal');
  isModalVisible = false;
  showMaintenance = false;

  constructor() {
    // Автоматическое открытие модалки при выборе ID для редактирования из списка (только для режима модалки)
    effect(() => {
      if (this.state.selectedId() && this.viewMode() === 'modal') {
        this.isModalVisible = true;
      }
    });
  }

  ngOnInit(): void {
    this.state.loadItems();
  }

  openHelp(): void {
    this.http.get('assets/help-data/category-of-aggregator-help.json').subscribe((data: any) => {
      this.nzModal.create({
        nzTitle: undefined,
        nzContent: HelpUniversalModalComponent,
        nzData: { ...data, initialMode: 'view' },
        nzFooter: null,
        nzWidth: data.width || 1200,
        nzCentered: true,
        nzClassName: 'aurora-modal-glass',
      });
    });
  }

  handleAdd(): void {
    if (this.viewMode() === 'page') {
      this.router.navigate(['new'], { relativeTo: this.route });
    } else {
      this.onAdd();
    }
  }

  onAdd(): void {
    this.state.openAddModal(() => (this.isModalVisible = true));
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.state.updateState({ selectedId: null });
  }

  async handleReadFromDb(): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Подтверждение',
      message: 'Вы действительно хотите перечитать данные из БД?',
      confirmText: 'Да',
      cancelText: 'Нет',
      confirmType: 'primary',
      centered: true,
    });
    if (confirmed) this.state.loadItems(true);
  }

  handleSeedFromJson(): void {
    this.state.seedFromJson();
  }

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ КАТЕГОРИИ?',
      '2 + 2 = ?',
      '4',
      'Критическое действие',
    );
    if (confirmed) this.state.clearDatabase();
  }
}
