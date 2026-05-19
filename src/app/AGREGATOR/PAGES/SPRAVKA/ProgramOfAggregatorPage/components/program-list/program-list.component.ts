import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { LanguageAggregatorApiService } from '../../../LanguageOfAggregator/services/language-aggregator-api.service';
import { ProgramOfAggregatorItem } from '../../models/program-of-aggregator.model';
import { ProgramOfAggregatorStateService } from '../../services/program-of-aggregator-state.service';
// import { ImageServiceUniversal } from '@shared/infrastructure/services/image-universal.service';

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
    NzSwitchModule,
    NzTreeSelectModule,
    NzPaginationModule,
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

          <nz-tree-select
            style="width: 250px;"
            [nzNodes]="(categories$ | async) || []"
            [ngModel]="selectedCategoryId$ | async"
            (ngModelChange)="onCategoryChange($event)"
            nzPlaceHolder="Категория"
            nzAllowClear
            nzShowSearch
            [nzDropdownMatchSelectWidth]="false"
          >
          </nz-tree-select>

          <nz-select
            style="width: 200px;"
            [ngModel]="selectedDeveloperId$ | async"
            (ngModelChange)="onDeveloperChange($event)"
            nzPlaceHolder="Разработчик"
            nzAllowClear
            nzShowSearch
          >
            <nz-option [nzValue]="null" nzLabel="Все разработчики"></nz-option>
            @for (dev of developers$ | async; track dev.id) {
              <nz-option [nzValue]="dev.id" [nzLabel]="dev.name"></nz-option>
            }
          </nz-select>

          <div class="filters">
            <div
              class="trash-toggle"
              role="button"
              tabindex="0"
              (click)="onTrashToggle(!showDeleted)"
              (keydown.enter)="onTrashToggle(!showDeleted)"
              (keydown.space)="onTrashToggle(!showDeleted); $event.preventDefault()"
            >
              <span class="label">КОРЗИНА</span>
              <nz-switch
                [ngModel]="showDeleted"
                (ngModelChange)="onTrashToggle($event)"
                (click)="$event.stopPropagation()"
                nzSize="small"
              ></nz-switch>
            </div>
          </div>
        </div>

        <button nz-button nzType="primary" [routerLink]="['new']">
          <i nz-icon nzType="plus"></i>
          Добавить программу
        </button>
      </div>

      @if (showInfoBlocks && (total$ | async) === 0 && (loading$ | async) === false) {
        <div class="info-blocks-container">
          <div class="premium-empty-card">
            <button class="close-btn" (click)="showInfoBlocks = false" title="Скрыть">
              <i nz-icon nzType="close"></i>
            </button>

            <div class="empty-icon-wrapper">
              <div class="pulse-ring"></div>
              <div class="icon-sphere">
                <i nz-icon nzType="appstore-add" class="pulse-icon"></i>
              </div>
            </div>

            <h3 class="empty-title">Программы пока не добавлены</h3>
            <p class="empty-description">
              База данных агрегатора пуста. Внесите первую запись о программе вручную или заполните
              базу тестовыми данными, чтобы запустить отображение каталога и синхронизацию версий.
            </p>

            <div class="empty-actions">
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                class="premium-cta-btn"
                [routerLink]="['new']"
              >
                <i nz-icon nzType="plus"></i>
                <span>Добавить первую программу</span>
              </button>

              @if ((prerequisites$ | async)?.isValid) {
                <button
                  nz-button
                  nzType="default"
                  nzSize="large"
                  class="premium-seed-btn"
                  (click)="onSeedData()"
                >
                  <i nz-icon nzType="database"></i>
                  <span>Заполнить демо-JSON</span>
                </button>
              }
            </div>
          </div>
        </div>
      }

      <nz-table
        #basicTable
        [nzData]="(items$ | async) || []"
        [nzLoading]="(loading$ | async)!"
        [nzTotal]="(total$ | async)!"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
        [nzPageIndex]="pageNumber"
        [nzPageSize]="pageSize"
        (nzQueryParamsChange)="onQueryParamsChange($event)"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th nzWidth="60px">Иконка</th>
            <th
              [nzSortFn]="true"
              nzColumnKey="CanonicalName"
              (nzSortOrderChange)="onManualSort('CanonicalName', $event)"
            >
              Название / Slug
            </th>
            <th
              [nzSortFn]="true"
              nzColumnKey="MainPlatformName"
              (nzSortOrderChange)="onManualSort('MainPlatformName', $event)"
            >
              Платформа
            </th>
            <th
              [nzSortFn]="true"
              nzColumnKey="CategoryName"
              (nzSortOrderChange)="onManualSort('CategoryName', $event)"
            >
              Кат. (Tree)
            </th>
            <th>М-Категория</th>
            <th>Подкатегория</th>
            <th
              [nzSortFn]="true"
              nzColumnKey="DeveloperName"
              (nzSortOrderChange)="onManualSort('DeveloperName', $event)"
            >
              Разработчик
            </th>
            <th
              nzWidth="100px"
              [nzSortFn]="true"
              nzColumnKey="TotalDownloads"
              (nzSortOrderChange)="onManualSort('TotalDownloads', $event)"
            >
              Загрузки
            </th>
            <th
              nzWidth="80px"
              [nzSortFn]="true"
              nzColumnKey="AverageRating"
              (nzSortOrderChange)="onManualSort('AverageRating', $event)"
            >
              Рейтинг
            </th>
            <th nzWidth="80px">Версии</th>
            <th nzWidth="100px">Статус</th>
            <th nzWidth="150px">Действия</th>
          </tr>
        </thead>
        @if (items$ | async; as items) {
          <tbody>
            @for (data of items; track data.id) {
              <tr>
                <td class="icon-cell">
                  <div class="program-icon-container">
                    @if (data.iconPath) {
                      <img
                        [src]="imgService.getAssetUrl(data.iconPath)"
                        [alt]="data.canonicalName"
                        (error)="onImgError($event)"
                      />
                    } @else {
                      <div class="icon-placeholder">
                        <i nz-icon nzType="appstore"></i>
                      </div>
                    }
                  </div>
                </td>
                <td>
                  <div class="program-name">
                    <span class="main-name">{{ data.localizedName || data.canonicalName }}</span>
                    <span class="sub-slug">{{ data.slug }}</span>
                  </div>
                </td>
                <td>
                  <nz-tag nzColor="orange">{{ data.mainPlatformName || '—' }}</nz-tag>
                </td>
                <td>
                  <nz-tag nzColor="blue" nz-tooltip [nzTooltipTitle]="'Иерархическая категория'">
                    {{ data.categoryName || '—' }}
                  </nz-tag>
                </td>
                <td>
                  <div style="font-size: 13px; font-weight: 500; color: #1e293b;">
                    {{ data.simplifiedCategoryName || '—' }}
                  </div>
                </td>
                <td>
                  <div style="font-size: 13px; color: #64748b;">
                    {{ data.simplifiedSubcategoryName || '—' }}
                  </div>
                </td>
                <td>{{ data.developerName || '—' }}</td>
                <td>{{ data.totalDownloads | number }}</td>
                <td>
                  <span class="rating-val">
                    <i
                      nz-icon
                      nzType="star"
                      nzTheme="fill"
                      style="color: #fadb14; margin-right: 4px;"
                    ></i>
                    {{ data.averageRating | number: '1.1-1' }}
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
                    <!-- 1. Просмотр -->
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Просмотр"
                      (click)="onView(data.id)"
                    >
                      <i nz-icon nzType="eye" class="view-icon"></i>
                    </button>

                    <!-- 2. Редактировать -->
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Редактировать"
                      [routerLink]="[data.id, 'edit']"
                    >
                      <i nz-icon nzType="edit" class="edit-icon"></i>
                    </button>

                    <!-- 3. Мягкое удаление / Восстановление -->
                    @if (!data.isDeleted) {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="В корзину"
                        (click)="onDelete(data.id)"
                      >
                        <i nz-icon nzType="delete" class="delete-icon"></i>
                      </button>
                    } @else {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Восстановить"
                        (click)="onRestore(data.id)"
                      >
                        <i nz-icon nzType="undo" class="restore-icon"></i>
                      </button>
                    }

                    <!-- 4. Жесткое удаление -->
                    <button
                      nz-button
                      nzType="text"
                      nz-tooltip
                      nzTooltipTitle="Удалить окончательно"
                      (click)="onHardDelete(data.id)"
                    >
                      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        }
      </nz-table>

      <!-- ПАГИНАЦИЯ (Aurora v3.5 Reference) -->
      @if (((total$ | async) || 0) > 0) {
        <div class="pagination-container">
          <nz-pagination
            [nzPageIndex]="pageNumber"
            [nzTotal]="(total$ | async) || 0"
            [nzPageSize]="pageSize"
            nzSize="small"
            (nzPageIndexChange)="onPageChange($any($event))"
          ></nz-pagination>

          <div class="pagination-info">
            Показано {{ (pageNumber - 1) * pageSize + 1 }}-{{
              mathMin(pageNumber * pageSize, (total$ | async) || 0)
            }}
            из {{ total$ | async }}
          </div>

          <nz-select
            [ngModel]="pageSize"
            (ngModelChange)="onPageSizeChange($event)"
            nzSize="small"
            style="width: 155px; margin-left: 10px;"
          >
            <nz-option [nzValue]="10" nzLabel="10 на странице"></nz-option>
            <nz-option [nzValue]="20" nzLabel="20 на странице"></nz-option>
            <nz-option [nzValue]="50" nzLabel="50 на странице"></nz-option>
            <nz-option [nzValue]="100" nzLabel="100 на странице"></nz-option>
          </nz-select>

          <div class="quick-jumper">
            <span>Перейти к:</span>
            <input
              type="number"
              nz-input
              nzSize="small"
              style="width: 55px; text-align: center;"
              [ngModel]="pageNumber"
              (keyup.enter)="onPageChange(+$any($event.target).value)"
            />
          </div>
        </div>
      }

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
          @if (prerequisites$ | async; as pre) {
            <span class="status-item">
              <i nz-icon nzType="database"></i>
              Справочники: <b style="color: #52c41a;">ОК ({{ pre.categoriesCount }})</b>
            </span>
          }

          @if (showDeleted) {
            <span class="status-divider"></span>
            <span class="status-item trash-warning">
              <i nz-icon nzType="rest" nzTheme="fill"></i>
              РЕЖИМ КОРЗИНЫ АКТИВЕН
            </span>
          }
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
          @if (loading$ | async) {
            <span class="status-item">
              <i nz-icon nzType="loading" [nzSpin]="true"></i> Синхронизация...
            </span>
          }
          <span class="status-divider"></span>
          <span class="status-item version-tag">Aurora v3.5.0</span>
        </div>
      </div>
    </nz-card>
  `,
  styles: [
    `
      /* Premium Modern Empty State Card */
      .premium-empty-card {
        position: relative;
        padding: 40px 24px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px dashed rgba(59, 130, 246, 0.3);
        border-radius: 16px;
        backdrop-filter: blur(16px);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.05);
        margin-bottom: 24px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .premium-empty-card:hover {
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 12px 30px -5px rgba(59, 130, 246, 0.08);
      }

      .premium-empty-card .close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        transition:
          color 0.2s,
          transform 0.2s;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .premium-empty-card .close-btn:hover {
        color: #475569;
        background: #f1f5f9;
        transform: rotate(90deg);
      }

      /* Animated Icon Sphere */
      .empty-icon-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pulse-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.15);
        animation: pulseAnimation 2s infinite ease-in-out;
      }

      .icon-sphere {
        position: relative;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px -4px rgba(29, 78, 216, 0.3);
      }

      .pulse-icon {
        font-size: 26px;
        color: #ffffff;
      }

      @keyframes pulseAnimation {
        0% {
          transform: scale(0.85);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.15);
          opacity: 0.15;
        }
        100% {
          transform: scale(0.85);
          opacity: 0.5;
        }
      }

      .empty-title {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px 0;
        letter-spacing: -0.01em;
      }

      .empty-description {
        font-size: 14px;
        color: #64748b;
        max-width: 520px;
        margin: 0 0 24px 0;
        line-height: 1.6;
      }

      /* CTA Actions buttons */
      .empty-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .premium-cta-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        border: none !important;
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25) !important;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition:
          transform 0.2s,
          box-shadow 0.2s !important;
      }

      .premium-cta-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35) !important;
      }

      .premium-seed-btn {
        border-color: #cbd5e1 !important;
        color: #475569 !important;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s !important;
      }

      .premium-seed-btn:hover {
        background: #f8fafc !important;
        border-color: #94a3b8 !important;
        color: #1e293b !important;
      }

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
      .view-icon {
        color: #8c8c8c;
      }
      .edit-icon {
        color: #1890ff;
      }
      .delete-icon {
        color: #faad14;
      }
      .hard-delete-icon {
        color: #ff4d4f;
      }
      .restore-icon {
        color: #52c41a;
      }

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

      .pagination-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 8px 16px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-top: none;
        gap: 12px;
      }

      .pagination-info {
        font-size: 13px;
        color: #595959;
        margin-left: 4px;
      }

      .quick-jumper {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #595959;
      }

      .page-size-selector {
        margin-left: 10px;
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

        i {
          color: #cf1322;
        }
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

      .icon-cell {
        padding: 8px !important;
        text-align: center;
      }

      .program-icon-container {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        overflow: hidden;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e2e8f0;
        transition: all 0.3s;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
        }

        .icon-placeholder {
          font-size: 20px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.has-error {
          border-color: #ffccc7;
          background: #fff1f0;

          .error-placeholder {
            color: #ff4d4f;
          }
        }
      }

      tr:hover .program-icon-container {
        transform: scale(1.1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class ProgramListComponent implements OnInit, OnDestroy {
  private state = inject(ProgramOfAggregatorStateService);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  public imgService = inject(ImageServiceUniversal);

  items$ = this.state.items$;
  total$ = this.state.total$;
  loading$ = this.state.loading$;
  prerequisites$ = this.state.prerequisites$;
  languages$ = this.state.languages$;
  categories$ = this.state.categories$;
  developers$ = this.state.developers$;
  selectedLanguageId$ = this.state.selectedLanguageId$;
  selectedCategoryId$ = this.state.selectedCategoryId$.pipe(map((id) => id?.toString() || null));
  selectedDeveloperId$ = this.state.selectedDeveloperId$;

  searchTerm = '';
  showDeleted = false;
  showInfoBlocks = true;
  pageNumber = 1;
  pageSize = 10;

  private modalService = inject(ModalService);
  private langApi = inject(LanguageAggregatorApiService);

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

  onCategoryChange(id: string | number | null): void {
    const numericId = id ? Number(id) : null;
    this.state.setCategoryId(numericId);
  }

  onDeveloperChange(id: number | null): void {
    this.state.setDeveloperId(id);
  }

  onTrashToggle(checked: boolean): void {
    this.showDeleted = checked;
    this.state.updateState({ showDeleted: checked, pageNumber: 1 });
    this.state.loadItems();
  }

  onQueryParamsChange(params: any): void {
    const { pageIndex, pageSize, sort } = params;
    this.pageNumber = pageIndex;
    this.pageSize = pageSize;

    const currentSort = sort.find((item: any) => item.value !== null);

    this.state.updateState({
      pageNumber: pageIndex,
      pageSize: pageSize,
      sortBy: currentSort ? currentSort.key : 'CreatedAt',
      sortDirection: currentSort ? (currentSort.value === 'descend' ? 1 : 0) : 1,
    });
    this.state.loadItems();
  }

  onManualSort(key: string, order: string | null): void {
    // alert(`Сортировка: ${key}, Порядок: ${order}`);

    if (order) {
      this.state.updateState({
        sortBy: key,
        sortDirection: order === 'descend' ? 1 : 0,
        pageNumber: 1,
      });
      this.state.loadItems();
    }
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.state.updateState({ pageNumber: page });
    this.state.loadItems();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.state.updateState({ pageSize: size, pageNumber: 1 });
    this.state.loadItems();
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  mathCeil(n: number): number {
    return Math.ceil(n);
  }

  onView(id: number): void {
    this.state.openView(id);
  }

  onImgError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.classList.add('has-error');
      // Создаем текстовую заглушку
      const placeholder = document.createElement('div');
      placeholder.className = 'icon-placeholder error-placeholder';
      placeholder.innerHTML = '<i class="anticon anticon-appstore"></i>';
      parent.appendChild(placeholder);
    }
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить программу?',
      message: 'Запись будет перемещена в корзину. Её можно будет восстановить позже.',
      confirmText: 'Удалить',
      confirmType: 'danger',
      centered: true,
    });
    if (confirmed) this.state.delete(id);
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'ВНИМАНИЕ: Это действие безвозвратно удалит программу и все связанные данные (версии, ссылки) из базы данных.',
      '2 + 2 = ?',
      '4',
      'Удалить навсегда',
    );
    if (confirmed) this.state.hardDelete(id);
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить программу?',
      message: 'Запись снова станет доступной в основном списке.',
      confirmText: 'Восстановить',
      confirmType: 'primary',
      centered: true,
    });
    if (confirmed) this.state.restore(id);
  }

  onInitializeLanguages(): void {
    this.state.updateState({ loading: true });
    this.langApi.initialize().subscribe({
      next: () => {
        this.state.checkPrerequisites();
        this.state.loadItems();
      },
      error: (err) => {
        this.state.updateState({ loading: false });
        console.error('Failed to initialize languages', err);
      },
    });
  }

  onSeedData(): void {
    this.state.seedFromJson();
  }

  trackByItems(index: number, item: ProgramOfAggregatorItem): number {
    return item.id;
  }
}
