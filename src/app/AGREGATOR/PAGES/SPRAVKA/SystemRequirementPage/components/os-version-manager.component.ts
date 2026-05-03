import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { SystemRequirementStateService } from '../services/system-requirement-state.service';
import { ButtonControlJsonBlockComponent } from '@shared/controls/button-control-json-block/button-control-json-block.component';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { AvSearchComponent } from '@shared/components/ui/search';
import { PlatformOfAggregatorStateService } from '../../PlatformOfAggregatorPage/services/platform-of-aggregator-state.service';
import { OsVersionFormComponent } from './os-version-form.component';
import { PaginationComponent } from '@shared/components/ui';

@Component({
  selector: 'app-os-version-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzSkeletonModule,
    NzSelectModule,
    NzSwitchModule,
    ButtonControlJsonBlockComponent,
    AvSearchComponent,
    OsVersionFormComponent,
    PaginationComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-section">
            <div class="title-with-settings">
              <h1>Справочник версий ОС</h1>
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
              Список доступных версий операционных систем для системных требований
              <span class="count-badge" *ngIf="state.osVersionsTotal() !== null">
                — Всего: <b>{{ state.osVersionsTotal() }}</b>
              </span>
            </p>
          </div>

          <div class="header-actions">
            <button nz-button nzType="primary" (click)="onAdd()">
              <i nz-icon nzType="plus"></i> Добавить версию
            </button>
          </div>
        </div>
      </div>

      <!-- Форма (Модальное окно) -->
      <app-os-version-form></app-os-version-form>

      <!-- Блок обслуживания (Скрытый по умолчанию) -->
      <app-button-control-json-block
        *ngIf="showMaintenance"
        [loading]="state.osVersionsLoading()"
        [total]="state.osVersionsTotal()"
        (onClear)="handleClearDatabase()"
        (onRead)="handleReadFromDb()"
        (onSeed)="handleSeedFromJson()"
      ></app-button-control-json-block>

      <!-- Инструменты управления (Поиск и Фильтры) -->
      <div class="manager-tools">
        <div class="left-tools">
          <div class="search-box">
            <av-search
              [value]="state.osSearchTerm()"
              [avLoading]="state.osVersionsLoading()"
              avPlaceholder="Поиск..."
              (onSearch)="onSearchChange($event)"
              [showButton]="false"
            ></av-search>
          </div>

          <nz-select
            style="width: 220px;"
            [ngModel]="selectedPlatformId()"
            (ngModelChange)="onPlatformChange($event)"
            nzPlaceHolder="Фильтр по системе"
            nzAllowClear
          >
            @for (platform of platformState.items(); track platform.id) {
              <nz-option [nzValue]="platform.id" [nzLabel]="platform.name"></nz-option>
            }
          </nz-select>

          <nz-select
            style="width: 180px;"
            [ngModel]="state.osLanguageId()"
            (ngModelChange)="onLanguageChange($event)"
            nzPlaceHolder="Фильтр по языку"
            nzAllowClear
          >
            <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
            @for (lang of state.languages(); track lang.id) {
              <nz-option [nzValue]="lang.id" [nzLabel]="lang.nativeTitle"></nz-option>
            }
          </nz-select>

          <div class="trash-toggle" [class.active]="state.osShowDeleted()">
            <span class="label">КОРЗИНА</span>
            <nz-switch
              [ngModel]="state.osShowDeleted()"
              (ngModelChange)="onToggleTrash($event)"
              nzSize="small"
            ></nz-switch>
          </div>
        </div>
      </div>

      <!-- Основной список -->
      <div class="manager-content">
        <nz-table 
          #basicTable 
          [nzData]="state.osVersions()" 
          [nzLoading]="state.osVersionsLoading() && state.osVersions().length > 0" 
          nzSize="small" 
          [nzBordered]="true"
          [nzShowPagination]="false"
        >
          <thead>
            <tr>
              <th nzWidth="80px">ID</th>
              <th>Платформа</th>
              <th>Название версии</th>
              <th>Системный код</th>
              <th nzWidth="120px">Статус</th>
              <th nzWidth="180px">Действия</th>
            </tr>
          </thead>
          <tbody>
            @if (state.osVersionsLoading() && state.osVersions().length === 0) {
              @for (skeleton of [1, 2, 3, 4, 5]; track skeleton) {
                <tr>
                  <td colspan="6">
                    <nz-skeleton [nzActive]="true" [nzTitle]="false" [nzParagraph]="{ rows: 1 }"></nz-skeleton>
                  </td>
                </tr>
              }
            }

            @for (data of basicTable.data; track data.id) {
              <tr [class.deleted-row]="data.isDeleted">
                <td><span class="id-tag">{{ data.id }}</span></td>
                <td>
                   <div style="display: flex; align-items: center; gap: 8px;">
                     <ng-container *ngIf="getPlatformIcon(data.platformId) as icon">
                        <img *ngIf="icon.includes('/') || icon.includes('.')" [src]="icon" style="width: 16px; height: 16px; object-fit: contain;" />
                        <i *ngIf="!icon.includes('/') && !icon.includes('.')" nz-icon [nzType]="icon"></i>
                     </ng-container>
                     {{ getPlatformName(data.platformId) }}
                   </div>
                </td>
                <td><strong>{{ data.name }}</strong></td>
                <td><code>{{ data.systemCode }}</code></td>
                <td>
                  <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                    {{ data.isActive ? 'Активен' : 'Отключен' }}
                  </nz-tag>
                </td>
                <td>
                  <div class="actions">
                    <button 
                      nz-button nzType="text" nz-tooltip nzTooltipTitle="Просмотр"
                      class="view-btn" (click)="onView(data.id)"
                    >
                      <i nz-icon nzType="eye" class="view-icon"></i>
                    </button>
                    <button 
                      nz-button nzType="text" nz-tooltip nzTooltipTitle="Редактировать"
                      class="edit-btn" (click)="onEdit(data.id)"
                    >
                      <i nz-icon nzType="edit" class="edit-icon"></i>
                    </button>
                    <button 
                      nz-button nzType="text" nz-tooltip nzTooltipTitle="В корзину"
                      class="delete-btn" (click)="onDelete(data.id)"
                    >
                      <i nz-icon nzType="rest" class="delete-icon"></i>
                    </button>
                    <button 
                      nz-button nzType="text" nz-tooltip nzTooltipTitle="Удалить навсегда"
                      class="hard-delete-btn" (click)="onHardDelete(data.id)"
                    >
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>

        <!-- Пагинация (Аналог разработчиков) -->
        <div class="pagination-container">
          <av-pagination
            [total]="state.osVersionsTotal()"
            [(currentPage)]="currentPageModel"
            [(pageSize)]="pageSizeModel"
          ></av-pagination>
        </div>
      </div>

      <!-- Закрепленная строка статуса -->
      <div class="sticky-status-bar">
        <div class="status-group">
          <span class="status-item">
            <i nz-icon nzType="database"></i>
            Всего записей: <b>{{ state.osVersionsTotal() }}</b>
          </span>
          <span class="status-divider"></span>
          <span class="status-item">
            <i nz-icon nzType="check-circle"></i>
            Справочник актуален
          </span>
        </div>
        <div class="status-group">
          <span class="status-item" *ngIf="state.osVersionsLoading()">
            <i nz-icon nzType="loading"></i> Обновление...
          </span>
          <span class="status-item version-tag">
            v3.5.0
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      padding-top: 16px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 0;
    }

    .title-section {
      .title-with-settings {
        display: flex;
        align-items: center;
        gap: 12px;

        h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 0;
          color: #0f172a;
          letter-spacing: -0.025em;
        }
      }

      .subtitle {
        color: #64748b;
        margin-top: 8px;
        font-size: 15px;
        font-weight: 500;
      }
    }

    .manager-tools {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-start;

      .left-tools {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .search-box {
        width: 400px;
      }

      .trash-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        .label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #64748b;
        }

        &.active {
          background: #fff1f2;
          border-color: #fecaca;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);

          .label { color: #ef4444; }
        }
      }
    }

    .deleted-row {
      opacity: 0.6;
      background-color: #fff1f2 !important;
      
      td {
        text-decoration: line-through rgba(239, 68, 68, 0.3);
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      background: #ffffff;
      border-top: 1px solid #f0f0f0;
      border-radius: 0 0 16px 16px;
    }

    .actions {
      display: flex;
      gap: 4px;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        transition: all 0.2s;

        &:hover {
          background: rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }

        i { font-size: 16px; }
      }

      .view-icon { color: #10b981; }
      .edit-icon { color: #3b82f6; }
      .delete-icon { color: #f59e0b; }
      .hard-delete-icon { color: #ef4444; }
    }

    .count-badge {
      color: #2563eb;
      font-size: 13px;
      margin-left: 8px;
      background: #eff6ff;
      padding: 4px 12px;
      border-radius: 99px;
      border: 1px solid #dbeafe;
      font-weight: 700;

      b {
        color: #1d4ed8;
      }
    }

    .id-tag {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      color: #64748b;
      font-size: 12px;
      border: 1px solid #e2e8f0;
    }

    .sticky-status-bar {
      position: sticky;
      bottom: 0;
      margin: 32px -32px -32px -32px;
      padding: 10px 32px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 -10px 15px -3px rgba(0, 0, 0, 0.05);

      .status-group {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .status-item {
        font-size: 13px;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;

        i {
          color: #3b82f6;
          font-size: 16px;
        }

        b {
          color: #1e293b;
        }

        &.version-tag {
          background: #f1f5f9;
          padding: 2px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-family: 'Fira Code', monospace;
          color: #64748b;
          font-size: 11px;
        }
      }

      .status-divider {
        width: 1px;
        height: 16px;
        background: #e2e8f0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsVersionManagerComponent implements OnInit {
  readonly state = inject(SystemRequirementStateService);
  readonly platformState = inject(PlatformOfAggregatorStateService);
  private modalService = inject(ModalService);
  private message = inject(NzMessageService);

  showMaintenance = false;
  selectedPlatformId = signal<number | null>(null);
  
  get currentPageModel(): number { return this.state.osPageNumber(); }
  set currentPageModel(v: number) { this.state.setOsPageNumber(v); }

  get pageSizeModel(): number { return this.state.osPageSize(); }
  set pageSizeModel(v: number) { this.state.setOsPageSize(v); }

  ngOnInit(): void {
    this.state.loadOsVersions();
    // Подгружаем список систем для фильтра, если он пуст
    if (this.platformState.total() === 0) {
      this.platformState.loadItems();
    }
  }

  onSearchChange(term: string): void {
    this.state.setOsSearchTerm(term);
  }

  onPlatformChange(id: number | null): void {
    this.selectedPlatformId.set(id);
    this.state.loadOsVersions(id || undefined);
  }

  onLanguageChange(langId: number | null): void {
    this.state.setOsLanguageId(langId);
  }

  onToggleTrash(show: boolean): void {
    this.state.setOsShowDeleted(show);
  }

  onAdd(): void {
    this.state.openOsModal('add');
  }

  onView(id: number): void {
    this.state.loadOsVersionDetail(id);
  }

  onEdit(id: number): void {
    this.state.loadOsVersionDetail(id);
    // Для редактирования нужно будет переключить режим после загрузки, 
    // но loadOsVersionDetail пока ставит 'view'. 
    // В будущем: this.state.loadOsVersionDetail(id, 'edit');
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить версию ОС?',
      message: 'Запись будет перемещена в корзину.',
      confirmText: 'Удалить',
      confirmType: 'danger'
    });
    
    if (confirmed) {
      this.state.deleteOsVersion(id);
    }
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит версию ОС из базы данных.',
      '2 + 2 = ?',
      '4',
      'Удалить навсегда'
    );

    if (confirmed) {
      this.state.hardDeleteOsVersion(id);
    }
  }

  handleSeedFromJson(): void {
    this.state.seedOsVersions();
  }

  async handleReadFromDb(): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Подтверждение',
      message: 'Вы действительно хотите перечитать данные из БД и обновить таблицу?',
      confirmText: 'Да',
      cancelText: 'Нет',
      confirmType: 'primary',
      centered: true,
      icon: 'system/av_info'
    });

    if (confirmed) {
      this.state.loadOsVersions(undefined, true);
    }
  }

  async handleClearDatabase(): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из таблицы версий ОС?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое действие'
    );

    if (confirmed) {
      this.state.clearOsVersions();
    }
  }

  getPlatformName(id: number): string {
    const platform = this.platformState.items().find(p => p.id === id);
    return platform ? platform.name : `ID: ${id}`;
  }

  getPlatformIcon(id: number): string {
    const platform = this.platformState.items().find(p => p.id === id);
    return platform ? platform.iconPath || 'desktop' : 'question-circle';
  }
}
