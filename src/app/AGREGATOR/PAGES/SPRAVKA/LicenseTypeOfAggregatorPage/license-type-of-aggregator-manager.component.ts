import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ButtonControlJsonBlockComponent } from '@shared/controls/button-control-json-block/button-control-json-block.component';
import { LicenseTypeOfAggregatorListComponent } from './components/license-type-of-aggregator-list/license-type-of-aggregator-list.component';

import { LicenseTypeOfAggregatorModalComponent } from './components/license-type-of-aggregator-modal.component';
import { LicenseTypeOfAggregatorInlineComponent } from './components/license-type-of-aggregator-inline/license-type-of-aggregator-inline.component';
import { LicenseTypeOfAggregatorViewModalComponent } from './license-type-of-aggregator-view-modal.component';

import { LicenseTypeOfAggregatorStateService } from './services/license-type-of-aggregator-state.service';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';

@Component({
  selector: 'app-license-type-of-aggregator-manager',
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
    LicenseTypeOfAggregatorListComponent,
    LicenseTypeOfAggregatorModalComponent,
    LicenseTypeOfAggregatorViewModalComponent,
    LicenseTypeOfAggregatorInlineComponent,
    ButtonControlJsonBlockComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <h1>Типы Лицензий</h1>
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
              Управление справочником типов лицензий агрегатора (V3.5 Signals)
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

      <!-- Блок обслуживания -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="state.loading()"
        [total]="state.total() || 0"
        (onClear)="handleClearDatabase()"
        (onRead)="handleReadFromDb()"
        (onSeed)="state.seedFromJson()"
      ></app-button-control-json-block>

      <!-- Основной список -->
      <app-license-type-of-aggregator-list
        [usePageNavigation]="viewMode === 'page'"
      ></app-license-type-of-aggregator-list>

      <!-- Хостинг формы -->
      <app-license-type-of-aggregator-modal
        *ngIf="viewMode === 'modal'"
      ></app-license-type-of-aggregator-modal>

      <!-- Инлайн режим / Половинки -->
      <app-license-type-of-aggregator-inline
        *ngIf="viewMode === 'inline'"
      ></app-license-type-of-aggregator-inline>

      <!-- Модалка просмотра (View Only) -->
      <app-license-type-of-aggregator-view-modal></app-license-type-of-aggregator-view-modal>

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
  styleUrls: ['./license-type-of-aggregator-manager.component.scss'],
})
export class LicenseTypeOfAggregatorManagerComponent implements OnInit {
  viewMode: 'modal' | 'inline' | 'page' = 'modal';
  showMaintenance = false;

  constructor(
    public state: LicenseTypeOfAggregatorStateService,
    private modalService: ModalService
  ) {}

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

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из справочника типов лицензий?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое действие'
    );

    if (confirmed) {
      this.state.clearDatabase();
    }
  }

  ngOnInit(): void {
    this.state.loadItems();
  }
}
