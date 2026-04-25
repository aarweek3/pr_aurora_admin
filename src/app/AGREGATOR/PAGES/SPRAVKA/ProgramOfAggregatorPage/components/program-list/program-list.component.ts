import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProgramOfAggregatorItem } from '../../models/program-of-aggregator.model';
import { ProgramOfAggregatorStateService } from '../../services/program-of-aggregator-state.service';

@Component({
  selector: 'app-program-list',
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
    NzPopconfirmModule,
    NzInputModule,
    NzSpaceModule,
    NzCardModule,
    NzSelectModule,
    NzAlertModule,
    NzAvatarModule,
    NzSwitchModule
  ],
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <nz-input-group [nzPrefix]="prefixIconSearch">
              <input
                type="text"
                nz-input
                placeholder="Поиск программ (Название, Slug, Локализация)..."
                [ngModel]="searchTerm"
                (ngModelChange)="onSearchChange($event)"
              />
            </nz-input-group>
            <ng-template #prefixIconSearch>
              <i nz-icon nzType="search"></i>
            </ng-template>
          </div>
          
          <nz-select
            style="width: 200px;"
            [ngModel]="selectedLanguageId$ | async"
            (ngModelChange)="onLanguageChange($event)"
            nzPlaceHolder="Фильтр по языку"
            nzAllowClear
          >
            <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
            @for (lang of languages$ | async; track lang.id) {
              <nz-option [nzValue]="lang.id" [nzLabel]="lang.nativeTitle"></nz-option>
            }
          </nz-select>

          <div class="filters">
            <label class="trash-toggle">
              <span class="label">КОРЗИНА</span>
              <nz-switch 
                [ngModel]="showDeleted" 
                (ngModelChange)="onTrashToggle($event)"
                nzSize="small"
              ></nz-switch>
            </label>
          </div>
        </div>

        <button nz-button nzType="primary" [routerLink]="['new']">
          <i nz-icon nzType="plus"></i>
          Добавить программу
        </button>
      </div>

      <div class="info-blocks-container" *ngIf="showInfoBlocks">
        <div class="prerequisites-panel" *ngIf="prerequisites$ | async as pre" style="margin-bottom: 20px;">
          <nz-alert
            [nzType]="pre.isValid ? 'success' : 'warning'"
            [nzMessage]="pre.isValid ? 'Система готова к работе' : 'Требуется настройка справочников'"
            [nzDescription]="prereqTpl"
            nzShowIcon
            nzCloseable
          >
            <ng-template #prereqTpl>
              <div class="prereq-content">
                <span class="prereq-desc">Для создания программ необходимы данные в справочниках:</span>
                <div class="prereq-tags" style="margin-top: 8px;">
                  <nz-tag [nzColor]="pre.languagesCount > 0 ? 'success' : 'error'" [routerLink]="['/agregator/references/language']" style="cursor: pointer;">
                    <i nz-icon [nzType]="pre.languagesCount > 0 ? 'check' : 'close'"></i>
                    Языки: {{ pre.languagesCount }}
                  </nz-tag>
                  <nz-tag [nzColor]="pre.categoriesCount > 0 ? 'success' : 'warning'" [routerLink]="['/agregator/references/categories']" style="cursor: pointer;">
                    <i nz-icon [nzType]="pre.categoriesCount > 0 ? 'check' : 'warning'"></i>
                    Категории: {{ pre.categoriesCount }}
                  </nz-tag>
                  <nz-tag [nzColor]="pre.developersCount > 0 ? 'success' : 'warning'" [routerLink]="['/agregator/references/developer']" style="cursor: pointer;">
                    <i nz-icon [nzType]="pre.developersCount > 0 ? 'check' : 'warning'"></i>
                    Разработчики: {{ pre.developersCount }}
                  </nz-tag>
                  <nz-tag [nzColor]="pre.platformsCount > 0 ? 'success' : 'default'" [routerLink]="['/agregator/references/os']" style="cursor: pointer;">
                    <i nz-icon [nzType]="pre.platformsCount > 0 ? 'check' : 'info'"></i>
                    Платформы: {{ pre.platformsCount }}
                  </nz-tag>
                </div>
                <div *ngIf="!pre.isValid" style="margin-top: 12px; font-weight: 500; color: #cf1322;">
                  <i nz-icon nzType="info-circle"></i> Заполните недостающие справочники (отмечены красным/желтым), чтобы форма создания программ работала корректно.
                </div>
              </div>
            </ng-template>
          </nz-alert>
        </div>

        <div *ngIf="(total$ | async) === 0 && !(loading$ | async) && (prerequisites$ | async)?.isValid" style="margin-bottom: 16px;">
          <nz-alert
            nzType="info"
            nzMessage="Программ пока нет"
            nzDescription="База данных 'DbNames' (таблица 'programs_of_aggregator') пуста. Нажмите кнопку 'Добавить программу', чтобы внести первую запись."
            nzShowIcon
            nzCloseable
          ></nz-alert>
        </div>
      </div>

      <nz-table
        #basicTable
        [nzData]="(items$ | async) || []"
        [nzLoading]="(loading$ | async)!"
        [nzTotal]="(total$ | async)!"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="onPageIndexChange($event)"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th nzWidth="60px">Иконка</th>
            <th>Название / Slug</th>
            <th>Категория</th>
            <th>Разработчик</th>
            <th nzWidth="100px">Загрузки</th>
            <th nzWidth="80px">Рейтинг</th>
            <th nzWidth="80px">Версии</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="150px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data; trackBy: trackByItems">
            <td>
              <nz-avatar [nzSrc]="data.iconPath" nzShape="square" [nzText]="(data.localizedName || data.canonicalName || '?')[0]"></nz-avatar>
            </td>
            <td>
              <div class="program-name">
                <span class="main-name">{{ data.localizedName || data.canonicalName }}</span>
                <span class="sub-slug">{{ data.slug }}</span>
              </div>
            </td>
            <td>
              <nz-tag nzColor="blue">{{ data.categoryName || '—' }}</nz-tag>
            </td>
            <td>{{ data.developerName || '—' }}</td>
            <td>{{ data.totalDownloads | number }}</td>
            <td>
              <span class="rating-val">
                <i nz-icon nzType="star" nzTheme="fill" style="color: #fadb14; margin-right: 4px;"></i>
                {{ data.averageRating | number:'1.1-1' }}
              </span>
            </td>
            <td>
              <nz-tag nzColor="cyan">{{ data.versionsCount }}</nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                {{ data.isActive ? 'Активен' : 'Откл' }}
              </nz-tag>
            </td>
            <td>
              <div class="actions">
                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Редактировать"
                  [routerLink]="[data.id, 'edit']"
                >
                  <i nz-icon nzType="edit" class="edit-icon"></i>
                </button>
                
                <ng-container *ngIf="!data.isDeleted; else deletedActions">
                  <button
                    nz-button
                    nzType="text"
                    nz-tooltip
                    nzTooltipTitle="В корзину"
                    nz-popconfirm
                    nzPopconfirmTitle="Переместить в корзину?"
                    (nzOnConfirm)="onDelete(data.id, false)"
                  >
                    <i nz-icon nzType="delete" class="delete-icon"></i>
                  </button>
                </ng-container>

                <ng-template #deletedActions>
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
                    nz-popconfirm
                    nzPopconfirmTitle="ВНИМАНИЕ: Это удалит программу и ВСЕ связанные данные (версии, ссылки, локализации) навсегда! Продолжить?"
                    nzPopconfirmPlacement="left"
                    (nzOnConfirm)="onDelete(data.id, true)"
                  >
                    <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                  </button>
                </ng-template>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Интегрированная строка статуса -->
      <div class="table-status-bar">
        <div class="status-group">
          <span class="status-item main-stat">
            <i nz-icon nzType="appstore" nzTheme="outline"></i>
            Всего программ: <b>{{ (total$ | async) || 0 }}</b>
          </span>
          <span class="status-divider"></span>
          <span class="status-item">
            <i nz-icon nzType="global"></i>
            Языки: <b>{{ (languages$ | async)?.length || 0 }}</b>
          </span>
          <span class="status-divider"></span>
          <span class="status-item" *ngIf="prerequisites$ | async as pre">
             <i nz-icon nzType="database"></i>
             Справочники: <b style="color: #52c41a;">ОК ({{ pre.categoriesCount }})</b>
          </span>
          
          <span class="status-divider" *ngIf="showDeleted"></span>
          <span class="status-item trash-warning" *ngIf="showDeleted">
            <i nz-icon nzType="rest" nzTheme="fill"></i>
            РЕЖИМ КОРЗИНЫ АКТИВЕН
          </span>
        </div>
        
        <div class="status-group">
          <button
            nz-button
            nzType="text"
            nzSize="small"
            class="info-toggle-btn"
            [class.active]="showInfoBlocks"
            (click)="showInfoBlocks = !showInfoBlocks"
            nz-tooltip
            [nzTooltipTitle]="showInfoBlocks ? 'Скрыть подсказки' : 'Показать подсказки'"
          >
            <i nz-icon [nzType]="showInfoBlocks ? 'eye' : 'eye-invisible'"></i>
          </button>
          <span class="status-divider"></span>
          <span class="status-item" *ngIf="(loading$ | async)">
            <i nz-icon nzType="loading" [nzSpin]="true"></i> Синхронизация...
          </span>
          <span class="status-divider"></span>
          <span class="status-item version-tag">Aurora v3.5.0</span>
        </div>
      </div>
    </nz-card>
  `,
  styles: [
    `
      .page-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 16px;
      }
      .left-actions {
        display: flex;
        gap: 24px;
        flex: 1;
        align-items: center;
      }
      .search-box {
        flex: 1;
        max-width: 450px;
      }
      .program-name {
        display: flex;
        flex-direction: column;
      }
      .main-name {
        font-weight: 600;
        color: #262626;
      }
      .sub-slug {
        font-size: 12px;
        color: #8c8c8c;
      }
      .rating-val {
        display: flex;
        align-items: center;
        font-weight: 500;
      }
      .actions {
        display: flex;
        gap: 4px;
      }
      .edit-icon { color: #1890ff; }
      .delete-icon { color: #faad14; }
      .hard-delete-icon { color: #ff4d4f; }
      .restore-icon { color: #52c41a; }
      
      .trash-toggle {
        display: flex;
        align-items: center;
        background: #f8fafc;
        padding: 6px 16px;
        border-radius: 50px;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .trash-toggle:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      .trash-toggle .label {
        font-weight: 700;
        font-size: 11px;
        color: #475569;
        margin-right: 12px;
        letter-spacing: 0.05em;
      }

      tr:hover td {
        background-color: #fafafa !important;
      }

      .table-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-top: none;
        border-radius: 0 0 12px 12px;
        margin: 0 -24px -24px -24px;
      }

      .status-group {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .status-item {
        font-size: 12px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;
        
        i {
          font-size: 14px;
          color: #94a3b8;
        }

        b {
          color: #1e293b;
        }
      }

      .main-stat i {
        color: #1890ff;
      }

      .trash-warning {
        background: #fff1f0;
        color: #cf1322 !important;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 700;
        border: 1px solid #ffa39e;
        font-size: 11px;
        
        i { color: #cf1322; }
      }

      .status-divider {
        width: 1px;
        height: 16px;
        background: #cbd5e1;
      }

      .version-tag {
        font-size: 11px;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      .info-toggle-btn {
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        
        &:hover {
          color: #1890ff;
          background: #e6f7ff;
        }
        
        &.active {
          color: #1890ff;
        }

        i {
          font-size: 16px;
        }
      }
    `,
  ],
})
export class ProgramListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  items$ = this.state.items$;
  total$ = this.state.total$;
  loading$ = this.state.loading$;
  prerequisites$ = this.state.prerequisites$;
  languages$ = this.state.languages$;
  selectedLanguageId$ = this.state.selectedLanguageId$;

  searchTerm = '';
  showDeleted = false;
  showInfoBlocks = true;

  constructor(private state: ProgramOfAggregatorStateService) {}

  ngOnInit(): void {
    this.state.checkPrerequisites();
    this.state.loadItems();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.state.updateState({ searchTerm: term, pageNumber: 1 });
        this.state.loadItems();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onLanguageChange(id: number | null): void {
    this.state.setLanguageId(id);
  }

  onTrashToggle(checked: boolean): void {
    this.showDeleted = checked;
    this.state.updateState({ showDeleted: checked, pageNumber: 1 });
    this.state.loadItems();
  }

  onPageIndexChange(index: number): void {
    this.state.updateState({ pageNumber: index });
    this.state.loadItems();
  }

  onDelete(id: number, hard: boolean): void {
    this.state.delete(id, hard);
  }

  onRestore(id: number): void {
    this.state.restore(id);
  }

  trackByItems(index: number, item: ProgramOfAggregatorItem): number {
    return item.id;
  }
}
