import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { HelpUniversalModalComponent } from '@shared/components/help-universal-modal/help-universal-modal.component';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ButtonControlJsonBlockComponent } from '@shared/controls/button-control-json-block/button-control-json-block.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ProgramListComponent } from './components/program-list/program-list.component';
import { ProgramOfAggregatorViewModalComponent } from './components/program-of-aggregator-view-modal/program-of-aggregator-view-modal.component';
import { ProgramOfAggregatorStateService } from './services/program-of-aggregator-state.service';

@Component({
  selector: 'app-program-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    ProgramListComponent,
    ButtonControlJsonBlockComponent,
    ProgramOfAggregatorViewModalComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <div class="title-row">
                <h1>Программы Агрегатора</h1>
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
              Каталог программного обеспечения и игр (Aurora v3.5 Reference)
              <span class="count-badge" *ngIf="(state.total$ | async) !== null">
                — Всего: <b>{{ state.total$ | async }}</b>
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Блок обслуживания -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="(state.loading$ | async) || false"
        [total]="(state.total$ | async) || 0"
        (onClear)="handleClearDatabase()"
        (onRead)="handleReadFromDb()"
        (onSeed)="handleSeedFromJson()"
        (onSyncIcons)="handleSyncIcons()"
        (onSyncScreenshots)="handleSyncScreenshots()"
      ></app-button-control-json-block>

      <!-- Основной список -->
      <div class="manager-content">
        <app-program-list></app-program-list>
      </div>

      <!-- Модальное окно просмотра -->
      <app-program-of-aggregator-view-modal></app-program-of-aggregator-view-modal>
    </div>
  `,
  styles: [
    `
      .page-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 0 0 24px 0;
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

        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        h1 {
          margin: 0;
          font-weight: 800;
          color: #1e293b;
        }
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
        color: #64748b;
        margin-top: 4px;
        .count-badge {
          color: #1890ff;
          font-weight: 600;
        }
      }
    `,
  ],
})
export class ProgramManagerComponent implements OnInit {
  state = inject(ProgramOfAggregatorStateService);
  private modalService = inject(ModalService);
  private nzModal = inject(NzModalService);
  private http = inject(HttpClient);

  showMaintenance = false;

  ngOnInit(): void {
    // Начальная загрузка данных обычно происходит в ProgramListComponent,
    // но если мы хотим гарантировать актуальность счетчика в заголовке:
    this.state.loadItems();
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
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ПРОГРАММЫ?',
      '2 + 2 = ?',
      '4',
      'Критическое действие',
    );
    if (confirmed) this.state.clearDatabase();
  }

  handleSyncIcons(): void {
    this.state.syncIcons();
  }

  handleSyncScreenshots(): void {
    this.state.syncScreenshots();
  }

  openHelp(): void {
    this.nzModal.create({
      nzTitle: undefined,
      nzContent: HelpUniversalModalComponent,
      nzData: {
        helpId: 'агрегатор-пути',
        initialMode: 'view',
      },
      nzFooter: null,
      nzWidth: 1400,
      nzCentered: true,
      nzClassName: 'aurora-modal-glass',
    });
  }
}
