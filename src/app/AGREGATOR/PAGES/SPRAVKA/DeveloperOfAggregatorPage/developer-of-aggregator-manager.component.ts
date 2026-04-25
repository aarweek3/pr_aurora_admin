import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ButtonControlJsonBlockComponent } from '@shared/controls/button-control-json-block/button-control-json-block.component';
import { DeveloperOfAggregatorListComponent } from './components/developer-of-aggregator-list/developer-of-aggregator-list.component';
import { DeveloperOfAggregatorModalComponent } from './components/developer-of-aggregator-modal/developer-of-aggregator-modal.component';
import { DeveloperOfAggregatorViewModalComponent } from './components/developer-of-aggregator-view-modal/developer-of-aggregator-view-modal.component';
import { DeveloperOfAggregatorStateService } from './services/developer-of-aggregator-state.service';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';

@Component({
  selector: 'app-developer-of-aggregator-manager',
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
    DeveloperOfAggregatorListComponent,
    DeveloperOfAggregatorModalComponent,
    DeveloperOfAggregatorViewModalComponent,
    ButtonControlJsonBlockComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <h1>Разработчики Агрегатора</h1>
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
              Справочник вендоров и создателей ПО (Aurora v3.5 Reference)
              <span class="count-badge" *ngIf="state.total() !== null">
                — Всего: <b>{{ state.total() }}</b>
              </span>
            </p>
          </div>

          <div class="header-actions">
            <nz-radio-group [(ngModel)]="viewMode" nzButtonStyle="solid" class="view-mode-toggle">
              <label nz-radio-button nzValue="modal">Модалка</label>
              <label nz-radio-button nzValue="page">Страница</label>
            </nz-radio-group>

            <ng-container *ngIf="!state.showDeleted()">
               <button 
                nz-button 
                nzType="primary" 
                (click)="handleAdd()"
              >
                <i nz-icon nzType="plus"></i>
                Добавить разработчика
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Блок обслуживания (Скрытый по умолчанию) -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="state.loading()"
        [total]="state.total() || 0"
        (onClear)="handleClearDatabase()"
        (onRead)="handleReadFromDb()"
        (onSeed)="handleSeedFromJson()"
      ></app-button-control-json-block>

      <!-- Основной список -->
      <div class="manager-content">
        <app-developer-of-aggregator-list
          [usePageNavigation]="viewMode() === 'page'"
        ></app-developer-of-aggregator-list>
      </div>

      <!-- Модальное окно формы -->
      <app-developer-of-aggregator-modal
        *ngIf="isModalVisible && viewMode() === 'modal'"
        [isVisible]="isModalVisible"
        (onClose)="closeModal()"
      ></app-developer-of-aggregator-modal>

      <!-- Модальное окно просмотра -->
      <app-developer-of-aggregator-view-modal></app-developer-of-aggregator-view-modal>

      <!-- Закрепленная строка статуса -->
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
          <span class="status-item version-tag">
            v3.5.0
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./developer-of-aggregator-manager.component.scss'],
})
export class DeveloperOfAggregatorManagerComponent implements OnInit {
  state = inject(DeveloperOfAggregatorStateService);
  private modalService = inject(ModalService);
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

  handleAdd(): void {
    if (this.viewMode() === 'page') {
      this.router.navigate(['new'], { relativeTo: this.route });
    } else {
      this.onAdd();
    }
  }

  onAdd(): void {
    this.state.openAddModal(() => this.isModalVisible = true);
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.state.updateState({ selectedId: null });
  }

  async handleReadFromDb(): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Подтверждение',
      message: 'Вы действительно хотите перечиттать данные из БД и обновить таблицу?',
      confirmText: 'Да',
      cancelText: 'Нет',
      confirmType: 'primary',
      centered: true,
      icon: 'system/av_info'
    });

    if (confirmed) {
      this.state.loadItems(true);
    }
  }

  handleSeedFromJson(): void {
    this.state.seedFromJson();
  }

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из таблицы разработчиков?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое действие'
    );

    if (confirmed) {
      this.state.clearDatabase();
    }
  }
}
