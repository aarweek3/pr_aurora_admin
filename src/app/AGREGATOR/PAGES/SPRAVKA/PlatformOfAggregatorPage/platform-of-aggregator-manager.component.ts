import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ButtonControlJsonBlockComponent } from '@controls';
import { PlatformOfAggregatorInlineComponent } from './components/platform-of-aggregator-inline/platform-of-aggregator-inline.component';
import { PlatformOfAggregatorListComponent } from './components/platform-of-aggregator-list/platform-of-aggregator-list.component';
import { PlatformOfAggregatorModalComponent } from './components/platform-of-aggregator-modal/platform-of-aggregator-modal.component';
import { PlatformOfAggregatorViewModalComponent } from './components/platform-of-aggregator-view-modal/platform-of-aggregator-view-modal.component';
import { PlatformOfAggregatorStateService } from './services/platform-of-aggregator-state.service';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';

@Component({
  selector: 'app-platform-of-aggregator-manager',
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
    PlatformOfAggregatorListComponent,
    PlatformOfAggregatorModalComponent,
    PlatformOfAggregatorViewModalComponent,
    PlatformOfAggregatorInlineComponent,
    ButtonControlJsonBlockComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <h1>Платформы Агрегатора</h1>
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
              Управление списком игровых и системных платформ (SEO-Ready)
              <span class="count-badge" *ngIf="state.total() !== null">
                — Всего: <b>{{ state.total() }}</b>
              </span>
            </p>
          </div>
          <nz-radio-group [(ngModel)]="viewMode" nzButtonStyle="solid">
            <label nz-radio-button nzValue="modal">Модалка</label>
            <label nz-radio-button nzValue="inline">Инлайн (Split)</label>
            <label nz-radio-button nzValue="page">Отдельная страница</label>
          </nz-radio-group>
        </div>
      </div>

      <!-- Блок обслуживания (Скрытый по умолчанию) -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="state.loading()"
        [total]="state.total() || 0"
        (clear)="handleClearDatabase()"
        (read)="handleReadFromDb()"
        (seed)="state.seedFromJson()"
      ></app-button-control-json-block>

      <!-- Кнопка "Создать" для режима страницы -->
      <div class="page-actions" *ngIf="viewMode === 'page'">
        <button nz-button nzType="primary" routerLink="new">
          <i nz-icon nzType="plus"></i> Создать на новой странице
        </button>
      </div>

      <!-- Основной список -->
      <app-platform-of-aggregator-list
        [usePageNavigation]="viewMode === 'page'"
      ></app-platform-of-aggregator-list>

      <!-- Хостинг формы -->
      <app-platform-of-aggregator-modal
        *ngIf="viewMode === 'modal'"
      ></app-platform-of-aggregator-modal>
      <app-platform-of-aggregator-view-modal></app-platform-of-aggregator-view-modal>

      <app-platform-of-aggregator-inline
        *ngIf="viewMode === 'inline'"
      ></app-platform-of-aggregator-inline>

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
          <span class="status-item version-tag"> v3.5.0 </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./platform-of-aggregator-manager.component.scss'],
})
export class PlatformOfAggregatorManagerComponent implements OnInit {
  state = inject(PlatformOfAggregatorStateService);
  private modalService = inject(ModalService);

  viewMode: 'modal' | 'inline' | 'page' = 'modal';
  showMaintenance = false;

  async handleReadFromDb(): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Подтверждение',
      message: 'Вы действительно хотите перечиттать данные из БД и обновить таблицу?',
      confirmText: 'Да',
      cancelText: 'Нет',
      confirmType: 'primary',
      centered: true,
      icon: 'system/av_info',
    });

    if (confirmed) {
      this.state.loadItems(true);
    }
  }

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из таблицы платформ?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое действие',
    );

    if (confirmed) {
      this.state.clearDatabase();
    }
  }

  ngOnInit(): void {
    this.state.loadItems();
  }
}
