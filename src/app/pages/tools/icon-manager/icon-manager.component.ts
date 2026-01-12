import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { firstValueFrom } from 'rxjs';

import { ApiEndpoints } from '@environments/api-endpoints';

import { IconGetService } from '@core/services/icon/icon-get.service';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { IconCategoryManagerComponent } from '../../icon-category-manager/icon-category-manager.component';
import { IconCategory as DbCategory } from '../../icon-category-manager/models/icon-category.model';
import { IconCategoryService } from '../../icon-category-manager/services/icon-category.service';
import { IconMetadata } from '../../ui-demo/old-control/icon-ui/icon-metadata.model';
import { IconCategory } from '../../ui-demo/old-control/icon-ui/icon-registry';

// Local interface extension to support count from backend
interface IconCategoryWithCount extends IconCategory {
  totalCount?: number;
}

@Component({
  selector: 'av-icon-manager',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,

    FormsModule,
    NzDrawerModule,
    NzTabsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
  ],
  template: `
    <div class="manager-wrapper">
      <!-- Background Decorative Elements -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <div class="manager-glass">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="brand">
              <div class="brand-icon">
                <av-icon type="system/av_cog" [size]="20"></av-icon>
              </div>
              <div class="brand-text">
                <h2>Студия Иконок</h2>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>Профессиональный менеджер ассетов</span>
                  <span class="source-badge" [class.backend]="dataSource() === 'backend'">
                    {{ dataSource() === 'backend' ? '☁️ Бэкенд' : '🏠 Локально' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-content">
            <div class="nav-section">
              <label>Библиотека</label>
              <div
                class="nav-item"
                [class.active]="selectedCategory() === null"
                (click)="selectedCategory.set(null)"
              >
                <av-icon type="general/av_home" [size]="18"></av-icon>
                <span>Все ресурсы</span>
                <span class="badge">{{ totalIcons() }}</span>
              </div>
              <div class="nav-item">
                <av-icon type="general/av_tag" [size]="18"></av-icon>
                <span>Недавно добавленные</span>
              </div>
              <div class="nav-item add-folder-btn" (click)="openCategoryManager()">
                <av-icon type="actions/av_add" [size]="18"></av-icon>
                <span>Создать папку</span>
              </div>
            </div>

            <div class="nav-section">
              <div class="section-header">
                <label>Коллекции</label>
                <button class="icon-btn-small">
                  <av-icon type="actions/av_add" [size]="14"></av-icon>
                </button>
              </div>
              @for (cat of categories(); track cat.category) {
              <div
                class="nav-item folder"
                [class.active]="selectedCategory() === cat.category"
                (click)="selectedCategory.set(cat.category)"
              >
                <av-icon type="av_folder" [size]="18"></av-icon>
                <span>{{ cat.category }}</span>
                <span class="count">{{
                  cat.totalCount !== undefined ? cat.totalCount : cat.icons.length
                }}</span>
              </div>
              }
            </div>
          </div>

          <div class="sidebar-footer">
            <div class="storage-card">
              <div class="storage-info">
                <span>Хранилище</span>
                <span>{{ storageUsage() }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="storageUsage()"></div>
              </div>
              <p>{{ ((totalIcons() * 1.5) / 1024).toFixed(2) }}MB из 5MB занято</p>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="main">
          <header class="main-header">
            <div class="search-wrapper">
              <av-icon type="actions/av_search" [size]="18"></av-icon>
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Поиск по {{ totalIcons() }} иконкам..."
              />
              @if (searchQuery()) {
              <button class="clear-btn" (click)="searchQuery.set('')">
                <av-icon type="actions/av_close" [size]="14"></av-icon>
              </button>
              }
              <kbd>/</kbd>
            </div>

            <div class="header-actions">
              <button class="btn-outline" (click)="isBatchLabOpen.set(true)">
                <av-icon type="system/av_cog" [size]="16"></av-icon>
                Лаборатория
              </button>
              <button
                class="btn-outline"
                (click)="isHelpModalOpen.set(true)"
                title="Справка"
                style="padding: 0 10px;"
              >
                <av-icon type="system/av_info" [size]="16"></av-icon>
              </button>
              <button
                class="btn-outline"
                [disabled]="isSyncing()"
                (click)="syncToLocal()"
                title="Синхронизировать бэкенд с локальным файлом"
              >
                @if (isSyncing()) {
                <div class="small-spinner"></div>
                Синхронизация... } @else {
                <av-icon type="actions/av_save" [size]="16"></av-icon>
                Синхронизировать }
              </button>
              <button class="btn-outline" (click)="onBulkUploadClick()">
                <av-icon type="actions/av_upload" [size]="16"></av-icon>
                Загрузить пакет
              </button>
              <button class="btn-primary" (click)="onUploadClick()">
                <av-icon type="actions/av_upload" [size]="16"></av-icon>
                Загрузить SVG
              </button>
            </div>
          </header>

          <div class="content">
            <div class="content-header">
              <div class="view-title">
                <h1>{{ selectedCategory() || 'Все ресурсы' }}</h1>
                <div class="breadcrumbs">
                  <span class="link" (click)="selectedCategory.set(null)">Библиотека</span>
                  <av-icon type="arrows/av_arrow_right" [size]="12"></av-icon>
                  <span class="current">{{ selectedCategory() || 'Все ресурсы' }}</span>
                </div>
              </div>

              <div class="view-controls">
                <div class="control-group">
                  <button class="icon-btn active">
                    <av-icon type="system/av_barcode" [size]="18"></av-icon>
                  </button>
                  <button class="icon-btn">
                    <av-icon type="system/av_notification" [size]="18"></av-icon>
                  </button>
                </div>
                <div class="divider"></div>
                <select class="custom-select">
                  <option>По названию</option>
                  <option>Сначала новые</option>
                  <option>По размеру</option>
                </select>
              </div>
            </div>

            @if (isLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Загрузка библиотеки иконок...</p>
            </div>
            } @else if (filteredIcons().length === 0) {
            <div class="empty-state">
              <av-icon type="system/av_info" [size]="48"></av-icon>
              <h3>Иконки не найдены</h3>
              <p>Попробуйте изменить параметры поиска или категорию</p>
            </div>
            } @else {
            <div class="icon-grid">
              @for (icon of filteredIcons(); track icon.type) {
              <div class="icon-card shadow-sm" (click)="openEditor(icon)">
                <div class="card-preview">
                  <div class="preview-inner">
                    <av-icon [type]="icon.type" [size]="32"></av-icon>
                  </div>
                  <div class="card-overlay">
                    <button
                      class="overlay-btn"
                      title="Копировать Angular компонент"
                      (click)="$event.stopPropagation(); copyCode(icon.type)"
                    >
                      <av-icon type="actions/av_copy" [size]="16"></av-icon>
                    </button>
                    <button
                      class="overlay-btn"
                      title="Копировать чистый SVG код"
                      (click)="$event.stopPropagation(); copySvg(icon.type)"
                    >
                      <av-icon type="media/av_image" [size]="16"></av-icon>
                    </button>
                    <button
                      class="overlay-btn"
                      title="Технический инспектор"
                      (click)="$event.stopPropagation(); openEditor(icon)"
                    >
                      <av-icon type="system/av_cog" [size]="16"></av-icon>
                    </button>
                    <button
                      class="overlay-btn"
                      title="Переместить в другую папку"
                      (click)="$event.stopPropagation(); openMoveModal(icon)"
                    >
                      <av-icon type="actions/av_share" [size]="16"></av-icon>
                    </button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="name">{{ icon.name }}</span>
                  <span class="meta">{{ icon.category }} • SVG</span>
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>
      </div>

      <!-- Icon Editor Drawer -->
      <nz-drawer
        [nzVisible]="isEditorOpen()"
        [nzWidth]="640"
        nzTitle="Инспектор и лаборатория иконок"
        (nzOnClose)="isEditorOpen.set(false)"
      >
        <ng-container *nzDrawerContent>
          @if (selectedIcon(); as icon) {
          <div class="editor-container">
            <!-- Top Preview Area -->
            <div class="preview-section">
              <div class="preview-box raw">
                <label>Оригинал</label>
                <div class="icon-wrapper">
                  <av-icon [type]="icon.type" [size]="64"></av-icon>
                </div>
              </div>
              <div class="preview-box optimized" [class.active]="cleanedSvgCode()">
                <label>Результат (Live)</label>
                <div class="icon-wrapper" [innerHTML]="safeCleanedSvg()"></div>
                @if (!cleanedSvgCode()) {
                <div class="placeholder">Нажмите "Оптимизировать" для предпросмотра</div>
                }
              </div>
            </div>

            <!-- Stats & Meta -->
            <div class="meta-section">
              <!-- НАЗВАНИЕ (с inline редактированием) -->
              <div class="meta-item">
                <div class="meta-header">
                  <span class="label">НАЗВАНИЕ</span>
                  @if (!isEditingName()) {
                  <button class="icon-btn-small" (click)="startEditName()" title="Переименовать">
                    <av-icon type="actions/av_edit" [size]="14"></av-icon>
                  </button>
                  }
                </div>

                @if (isEditingName()) {
                <!-- Режим редактирования -->
                <div class="edit-mode">
                  <input
                    type="text"
                    class="name-input"
                    [ngModel]="editedName()"
                    (ngModelChange)="editedName.set($event)"
                    (keydown)="onNameKeyDown($event)"
                    [disabled]="isRenamingInProgress()"
                    autofocus
                    placeholder="Введите новое имя"
                  />
                  <div class="edit-actions">
                    <button
                      class="save-btn"
                      (click)="saveNewName()"
                      [disabled]="isRenamingInProgress()"
                      title="Сохранить"
                    >
                      @if (isRenamingInProgress()) {
                      <div class="small-spinner"></div>
                      } @else {
                      <av-icon type="actions/av_check_mark" [size]="14"></av-icon>
                      }
                    </button>
                    <button
                      class="cancel-btn"
                      (click)="cancelEditName()"
                      [disabled]="isRenamingInProgress()"
                      title="Отмена"
                    >
                      <av-icon type="actions/av_close" [size]="14"></av-icon>
                    </button>
                  </div>
                </div>

                @if (nameError()) {
                <div class="error-message">⚠️ {{ nameError() }}</div>
                }

                <div class="hint-message">💡 Enter - сохранить, Escape - отмена</div>
                } @else {
                <!-- Режим просмотра -->
                <span
                  class="value editable"
                  (dblclick)="onNameDoubleClick()"
                  title="Двойной клик для редактирования"
                >
                  {{ icon.name }}
                </span>
                }
              </div>

              <!-- КАТЕГОРИЯ (с кнопкой смены) -->
              <div class="meta-item">
                <div class="meta-header">
                  <span class="label">КАТЕГОРИЯ</span>
                  <button
                    class="icon-btn-small"
                    (click)="openMoveModal(icon)"
                    title="Сменить категорию"
                  >
                    <av-icon type="av_folder" [size]="14"></av-icon>
                  </button>
                </div>
                <span class="value">{{ icon.category }}</span>
              </div>

              <!-- ФОРМАТ -->
              <div class="meta-item">
                <span class="label">ФОРМАТ</span>
                <span class="value">SVG</span>
              </div>
            </div>

            <!-- Technical Passport -->
            @if (iconPassport(); as passport) {
            <div class="passport-card" [class.standard]="passport.isStandard">
              <div class="passport-header">
                <div class="passport-title">
                  <av-icon type="system/av_info" [size]="14"></av-icon>
                  <span>Технический паспорт</span>
                </div>
                <div class="passport-actions">
                  @if (!passport.isStandard) {
                  <button class="fix-btn" (click)="normalizeToStandard()">
                    <av-icon type="actions/av_hammer" [size]="12"></av-icon>
                    Исправить на 24x24
                  </button>
                  }
                  <button
                    class="fix-btn danger"
                    nz-tooltip
                    nzTooltipTitle="Удалить иконку отовсюду"
                    (click)="deleteCurrentIcon()"
                  >
                    <av-icon type="actions/av_trash" [size]="12"></av-icon>
                    Удалить
                  </button>
                  <div class="status-badge" [class.ok]="passport.isStandard">
                    {{ passport.isStandard ? 'Standard 24x24' : 'Non-Standard' }}
                  </div>
                </div>
              </div>
              <div class="passport-grid">
                <div class="p-item">
                  <label>Исходный размер</label>
                  <span>{{ passport.originalWidth }} × {{ passport.originalHeight }}</span>
                </div>
                <div class="p-item">
                  <label>ViewBox</label>
                  <code>{{ passport.viewBox }}</code>
                </div>
                <div class="p-item">
                  <label>Элементы</label>
                  <span>{{ passport.pathCount }} путей</span>
                </div>
                <div class="p-item">
                  <label>Стиль</label>
                  <span [class.text-success]="passport.hasCurrentColor">
                    {{ passport.hasCurrentColor ? 'CurrentColor OK' : 'Жесткие цвета' }}
                  </span>
                </div>
              </div>
            </div>
            }

            <!-- Code Tabs -->
            <nz-tabset
              [nzSelectedIndex]="activeEditorTab()"
              (nzSelectedIndexChange)="activeEditorTab.set($event)"
            >
              <nz-tab nzTitle="Исходный код">
                <div class="code-editor-wrapper">
                  <div class="code-label">Original</div>
                  <textarea readonly>{{ rawSvgCode() }}</textarea>

                  @if (cleanedSvgCode() || isManualEdit()) {
                  <div class="code-connector">
                    <av-icon type="arrows/av_arrow_down" [size]="20"></av-icon>
                    <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                      <span>Optimized Output</span>
                      <button
                        class="btn-outline"
                        style="height: 24px; padding: 0 8px; font-size: 11px; border-radius: 4px;"
                        [class.active-edit]="isManualEdit()"
                        (click)="toggleManualEdit()"
                      >
                        <av-icon
                          [type]="isManualEdit() ? 'actions/av_check_mark' : 'actions/av_edit'"
                          [size]="12"
                        ></av-icon>
                        {{ isManualEdit() ? 'Применить' : 'Редактировать' }}
                      </button>
                      @if (isManualEdit()) {
                      <button
                        class="btn-outline refresh-animate"
                        style="height: 24px; padding: 0 8px; font-size: 11px; border-radius: 4px; border-color: #6366f1; color: #6366f1;"
                        (click)="refreshPreview()"
                      >
                        <av-icon
                          type="general/av_refresh-cw"
                          [size]="12"
                          style="margin-right: 4px;"
                        ></av-icon>
                        Рефреш (Live)
                      </button>
                      }
                    </div>
                  </div>
                  <textarea
                    class="optimized"
                    [readonly]="!isManualEdit()"
                    [ngModel]="isManualEdit() ? manualEditedCode() : cleanedSvgCode()"
                    (ngModelChange)="onManualCodeChange($event)"
                    placeholder="Здесь появится оптимизированный код или введите свой..."
                  ></textarea>
                  }
                </div>

                @if (activeEditorTab() === 0) {
                <!-- Actions for Source Code Tab -->
                <div
                  class="editor-footer"
                  style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9;"
                >
                  <button nz-button nzType="default" (click)="optimizeSvg()">
                    <av-icon type="system/av_cog" [size]="16"></av-icon>
                    Оптимизировать
                  </button>
                  <div class="spacer"></div>
                  <button
                    nz-button
                    nzType="primary"
                    [disabled]="!cleanedSvgCode()"
                    (click)="granularSync(true, true)"
                  >
                    <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
                    Сохранить везде
                  </button>
                </div>
                }
              </nz-tab>
              <nz-tab nzTitle="Просмотр">
                <div class="code-editor-wrapper">
                  <div class="code-label">Код для просмотра</div>
                  <textarea
                    style="height: 400px;"
                    [ngModel]="(viewCodeSignal() ?? cleanedSvgCode()) || rawSvgCode()"
                    (ngModelChange)="viewCodeSignal.set($event)"
                    placeholder="Здесь появится код для просмотра..."
                  ></textarea>
                </div>

                @if (activeEditorTab() === 1) {
                <div
                  class="editor-footer"
                  style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9;"
                >
                  <button nz-button nzType="default" (click)="onPreviewClick()">
                    <av-icon type="actions/av_eye" [size]="16"></av-icon>
                    Превью
                  </button>
                  <div class="spacer"></div>
                  <button nz-button nzType="default" (click)="onSaveToDiskClick()">
                    <av-icon type="general/av_download" [size]="16"></av-icon>
                    Сохранить на диск
                  </button>
                </div>
                }
              </nz-tab>
              <nz-tab nzTitle="Метаданные">
                <div class="enrich-form">
                  <div class="form-group">
                    <label>Accessibility Title</label>
                    <input
                      nz-input
                      [(ngModel)]="metaTitle"
                      placeholder="Напр. Галочка подтверждения"
                    />
                  </div>
                  <div class="form-group">
                    <label>Описание (Контекст)</label>
                    <textarea
                      nz-input
                      [(ngModel)]="metaDesc"
                      rows="3"
                      placeholder="Опишите использование иконки..."
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label>Корпоративный автор</label>
                    <input
                      nz-input
                      [(ngModel)]="metaAuthor"
                      placeholder="Напр. Aurora Design System"
                    />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Ключ атрибута данных</label>
                      <input nz-input [(ngModel)]="metaDataKey" placeholder="Напр. data-test" />
                    </div>
                    <div class="form-group">
                      <label>Значение атрибута</label>
                      <input
                        nz-input
                        [(ngModel)]="metaDataValue"
                        placeholder="Напр. icon-confirm"
                      />
                    </div>
                  </div>
                  <button nz-button nzType="dashed" nzBlock (click)="applyMetadata()">
                    <av-icon type="actions/av_add" [size]="14"></av-icon>
                    Внедрить метаданные в код
                  </button>
                </div>
              </nz-tab>
            </nz-tabset>
          </div>

          }
        </ng-container>
      </nz-drawer>

      <!-- Batch Lab Drawer -->
      <nz-drawer
        [nzVisible]="isBatchLabOpen()"
        [nzWidth]="720"
        nzTitle="Лаборатория массовых операций"
        (nzOnClose)="isBatchLabOpen.set(false)"
      >
        <ng-container *nzDrawerContent>
          <div class="batch-container">
            <div class="batch-header-info">
              <h3>Массовые операции с иконками</h3>
              <p>Инструменты для пакетной обработки всей библиотеки или отфильтрованного списка.</p>
            </div>

            <div class="batch-options">
              <div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; gap: 12px; align-items: center;">
                  <label style="font-size: 13px; font-weight: 600; min-width: 140px;"
                    >Область обработки:</label
                  >
                  <button
                    [class.btn-primary]="batchMode() === 'all'"
                    [class.btn-outline]="batchMode() !== 'all'"
                    style="padding: 4px 12px; height: 32px;"
                    (click)="batchMode.set('all')"
                  >
                    Вся библиотека
                  </button>
                  <button
                    [class.btn-primary]="batchMode() === 'category'"
                    [class.btn-outline]="batchMode() !== 'category'"
                    style="padding: 4px 12px; height: 32px;"
                    (click)="batchMode.set('category')"
                  >
                    По категории
                  </button>
                  <button
                    [class.btn-primary]="batchMode() === 'filtered'"
                    [class.btn-outline]="batchMode() !== 'filtered'"
                    style="padding: 4px 12px; height: 32px;"
                    (click)="batchMode.set('filtered')"
                  >
                    Отфильтрованные
                  </button>
                </div>

                @if (batchMode() === 'category') {
                <div
                  style="display: flex; gap: 12px; align-items: center; animation: slideDown 0.3s ease-out;"
                >
                  <label style="font-size: 13px; font-weight: 600; min-width: 140px;"
                    >Выберите категорию:</label
                  >
                  <nz-select
                    [ngModel]="batchCategoryId()"
                    (ngModelChange)="onBatchCategoryChange($event)"
                    style="width: 100%; max-width: 300px;"
                    nzPlaceHolder="Выберите категорию для обработки"
                  >
                    @for (cat of dbCategories(); track cat.id) {
                    <nz-option [nzValue]="cat.id" [nzLabel]="cat.displayName"></nz-option>
                    }
                  </nz-select>
                </div>
                }

                <div
                  style="font-size: 12px; color: #6366f1; font-weight: 700; background: #eef2ff; padding: 6px 12px; border-radius: 8px; width: fit-content;"
                >
                  <av-icon type="system/av_info" [size]="14" style="margin-right: 6px;"></av-icon>
                  Будет обработано иконок: {{ batchIconsCount() }}
                </div>
              </div>
            </div>

            <div class="batch-actions-grid">
              <div class="batch-action-card" (click)="startBatchProcess('optimize')">
                <div class="action-icon">
                  <av-icon type="actions/av_eraser" [size]="20"></av-icon>
                </div>
                <div class="action-info">
                  <h4>Массовая оптимизация</h4>
                  <p>Очистка от мусора, ID, классов и внедрение currentColor.</p>
                </div>
              </div>

              <div class="batch-action-card" (click)="startBatchProcess('normalize')">
                <div class="action-icon">
                  <av-icon type="arrows/av_expand" [size]="20"></av-icon>
                </div>
                <div class="action-info">
                  <h4>Стандартизация 24x24</h4>
                  <p>Масштабирование всех иконок под стандартный квадрат 24 на 24.</p>
                </div>
              </div>

              <div class="batch-action-card" (click)="refactorIcons()">
                <div class="action-icon" style="background: #f1f5f9; color: #475569;">
                  <av-icon type="actions/av_eraser" [size]="24"></av-icon>
                </div>
                <div class="action-info">
                  <h4>Рефакторинг имен</h4>
                  <p>Очистка имен (av-, _av) и приведение к стандарту av_ prefix.</p>
                </div>
              </div>
            </div>

            <div class="batch-header-info" style="margin-top: 16px; background: #f1f5f9;">
              <h4
                style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; display: flex; align-items: center; gap: 8px;"
              >
                <av-icon type="actions/av_search" [size]="14"></av-icon>
                Массовое редактирование кода
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="meta-item">
                  <span class="label">Найти текст / тег</span>
                  <input
                    type="text"
                    [(ngModel)]="batchSearchQuery"
                    placeholder="Например: fill='#000'"
                    style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;"
                  />
                </div>
                <div class="meta-item">
                  <span class="label">Заменить на</span>
                  <input
                    type="text"
                    [(ngModel)]="batchReplaceQuery"
                    placeholder="Например: fill='currentColor'"
                    style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;"
                  />
                </div>
              </div>
              <button
                class="btn-primary"
                style="margin-top: 12px; width: 100%; gap: 8px;"
                [disabled]="!batchSearchQuery()"
                (click)="startBatchProcess('replace')"
              >
                <av-icon type="actions/av_save" [size]="14"></av-icon>
                Применить замену ко всем
              </button>
            </div>

            <div
              class="batch-header-info"
              style="margin-top: 16px; border-left: 4px solid #6366f1;"
            >
              <h4
                style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; display: flex; align-items: center; gap: 8px;"
              >
                <av-icon type="actions/av_eye" [size]="14"></av-icon>
                Массовое обогащение (Enrich / Meta)
              </h4>
              <div class="enrich-form" style="padding: 0;">
                <div class="form-row">
                  <div class="form-group">
                    <label>Accessibility Title</label>
                    <input
                      type="text"
                      [(ngModel)]="metaTitle"
                      placeholder="e.g. Navigation checkmark"
                    />
                  </div>
                  <div class="form-group">
                    <label>Corporate Author</label>
                    <input type="text" [(ngModel)]="metaAuthor" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Description (Context)</label>
                  <textarea
                    [(ngModel)]="metaDesc"
                    placeholder="Describe the icon usage..."
                    style="height: 60px;"
                  ></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Data Attribute Key</label>
                    <input type="text" [(ngModel)]="metaDataKey" />
                  </div>
                  <div class="form-group">
                    <label>Attribute Value</label>
                    <input type="text" [(ngModel)]="metaDataValue" />
                  </div>
                </div>
                <button
                  class="btn-primary"
                  style="width: 100%; margin-top: 8px; background: #6366f1;"
                  (click)="startBatchProcess('metadata')"
                >
                  Установить метаданные массово
                </button>
              </div>
            </div>

            <div class="log-container">
              <div
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"
              >
                <div
                  style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em;"
                >
                  Лог сессии
                </div>
                @if (batchLog().length > 0) {
                <div style="display: flex; gap: 8px;">
                  <button
                    class="btn-outline"
                    [style.height]="'24px'"
                    [style.padding]="'0 8px'"
                    [style.font-size]="'10px'"
                    [style.border-radius]="'6px'"
                    (click)="copyBatchLog()"
                  >
                    <av-icon
                      type="actions/av_save"
                      [size]="10"
                      style="margin-right: 4px;"
                    ></av-icon>
                    Копировать лог
                  </button>
                  <button
                    class="btn-outline"
                    [style.height]="'24px'"
                    [style.padding]="'0 8px'"
                    [style.font-size]="'10px'"
                    [style.border-radius]="'6px'"
                    [style.color]="'#f43f5e'"
                    [style.border-color]="'rgba(244, 63, 94, 0.2)'"
                    (click)="clearBatchLog()"
                  >
                    <av-icon
                      type="actions/av_eraser"
                      [size]="10"
                      style="margin-right: 4px;"
                    ></av-icon>
                    Очистить
                  </button>
                </div>
                }
              </div>
              <div class="log-scroll">
                @for (line of batchLog(); track $index) {
                <div
                  class="log-entry"
                  [class.success]="line.includes('✅')"
                  [class.error]="line.includes('❌')"
                >
                  {{ line }}
                </div>
                } @if (batchLog().length === 0) {
                <div style="color: #64748b; font-style: italic;">
                  Выберите действие для начала...
                </div>
                }
              </div>
            </div>

            @if (isBatchProcessing()) {
            <div class="progress-overlay">
              <div style="margin-bottom: 24px;">
                <av-icon
                  type="system/av_cog"
                  [size]="48"
                  style="animation: spin 2s linear infinite;"
                ></av-icon>
                <style>
                  @keyframes spin {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                </style>
              </div>
              <h2 style="margin-bottom: 8px;">Выполняется обработка...</h2>
              <div class="custom-progress-bar">
                <div class="fill" [style.width.%]="batchProgress()"></div>
              </div>
              <div style="font-weight: 700; color: #6366f1;">
                {{ batchCurrent() }} / {{ batchTotal() }} ({{ batchProgress() }}%)
              </div>
              <div
                style="margin-top: 8px; font-size: 14px; font-weight: 600; color: #1e293b; background: #f1f5f9; padding: 4px 12px; border-radius: 8px;"
              >
                Обработка: {{ batchCurrentName() }}
              </div>
              <p style="margin-top: 16px; color: #64748b;">
                Пожалуйста, не закрывайте страницу до завершения.
              </p>
            </div>
            }
          </div>
        </ng-container>
      </nz-drawer>

      <!-- Help Modal -->
      <nz-modal
        [(nzVisible)]="isHelpModalOpen"
        nzTitle="Справка: Студия Иконок Aurora"
        (nzOnCancel)="isHelpModalOpen.set(false)"
        [nzFooter]="null"
        [nzWidth]="800"
      >
        <ng-container *nzModalContent>
          <div
            class="help-content"
            style="max-height: 600px; overflow-y: auto; padding-right: 12px;"
          >
            <section style="margin-bottom: 24px;">
              <h3 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                🚀 Общая логика
              </h3>
              <p>
                Студия иконок — это инструмент для управления визуальными ресурсами системы Aurora.
                Она работает по принципу <b>двухслойного хранения</b>:
              </p>
              <ul>
                <li>
                  <b>Master (Backend)</b>: Основное хранилище иконок в файловой системе сервера. Это
                  "источник истины".
                </li>
                <li>
                  <b>Distribution (Frontend)</b>: Копия иконок в папке ассетов Angular приложения
                  (assets/icons), используемая для отображения в браузере.
                </li>
              </ul>
              <p>
                Любое изменение (загрузка, удаление, рефакторинг) по умолчанию применяется к обоим
                слоям.
              </p>
            </section>

            <section style="margin-bottom: 24px;">
              <h3 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                📂 Загрузка ресурсов
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px;">
                  <h4 style="margin-top: 0;">Одиночная</h4>
                  <p style="font-size: 13px; margin-bottom: 0;">
                    Кнопка "Загрузить SVG". Позволяет задать точное имя и категорию для одной
                    иконки.
                  </p>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px;">
                  <h4 style="margin-top: 0;">Пакетная</h4>
                  <p style="font-size: 13px; margin-bottom: 0;">
                    Кнопка "Загрузить пакет". Массовая загрузка файлов. Имена берутся из названий
                    файлов.
                  </p>
                </div>
              </div>
            </section>

            <section style="margin-bottom: 24px;">
              <h3 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                ✨ Лаборатория (Batch Lab)
              </h3>
              <p>Инструменты для массовой обработки всей библиотеки:</p>
              <ul style="display: flex; flex-direction: column; gap: 8px;">
                <li>
                  <b>Массовая оптимизация</b>: Очистка кода от мусора (metadata, IDs, inline styles)
                  и внедрение <code>currentColor</code> для управления цветом через CSS.
                </li>
                <li>
                  <b>Стандартизация 24x24</b>: Приведение всех viewBox к стандарту 24 на 24 пикселя
                  без искажения пропорций.
                </li>
                <li>
                  <b>Рефакторинг имен</b>: Автоматическая очистка имен от лишних суффиксов (av-,
                  _av) и добавление обязательного префикса <code>av_</code>.
                </li>
                <li>
                  <b>Массовое редактирование</b>: Поиск и замена фрагментов кода во всех иконках
                  одновременно.
                </li>
              </ul>
            </section>

            <section style="margin-bottom: 24px;">
              <h3 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                🔄 Синхронизация
              </h3>
              <p>
                После внесения изменений в файлы необходимо нажать кнопку
                <b>"Синхронизировать"</b> в верхнем меню. Это действие:
              </p>
              <ol>
                <li>Пересканирует физические папки на сервере.</li>
                <li>Обновляет файл <code>icon-registry.ts</code> на фронтенде.</li>
                <li>Гарантирует, что новые иконки появятся в списке выбора во всем приложении.</li>
              </ol>
            </section>

            <section>
              <h3 style="color: #6366f1; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                📇 Паспорт иконки
              </h3>
              <p>При клике на иконку открывается Drawer, где можно:</p>
              <ul>
                <li>Напрямую редактировать SVG код.</li>
                <li>Проверить статус наличия файла на Back/Front.</li>
                <li>Удалить иконку выборочно с одного из слоев или отовсюду.</li>
              </ul>
            </section>

            <div
              style="margin-top: 32px; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; display: flex; align-items: center; gap: 12px;"
            >
              <av-icon type="actions/av_check_mark" [size]="20" style="color: #16a34a;"></av-icon>
              <span style="color: #166534; font-weight: 500;"
                >Подсказка: Используйте Лог сессии в Лаборатории, чтобы видеть детальные отчеты о
                каждой операции.</span
              >
            </div>
          </div>
        </ng-container>
      </nz-modal>

      <!-- Upload Modal -->
      <nz-modal
        [nzVisible]="isUploadModalOpen()"
        nzTitle="Загрузка новой иконки"
        (nzOnCancel)="isUploadModalOpen.set(false)"
        (nzOnOk)="confirmUpload()"
        [nzOkText]="'Загрузить'"
        [nzCancelText]="'Отмена'"
      >
        <ng-container *nzModalContent>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;"
                >Название (без расширения)</label
              >
              <input
                nz-input
                [ngModel]="uploadName()"
                (ngModelChange)="uploadName.set($event)"
                placeholder="Например: av_user_plus"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Категория</label>
              <nz-select
                [ngModel]="uploadCategory()"
                (ngModelChange)="uploadCategory.set($event)"
                style="width: 100%;"
              >
                @for (cat of dbCategories(); track cat.id) {
                <nz-option [nzValue]="cat.folderName" [nzLabel]="cat.displayName"></nz-option>
                }
              </nz-select>
            </div>

            <!-- SVG Input Source Tabs -->
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;"
                >Источник иконки</label
              >
              <nz-tabset nzType="card" [nzSelectedIndex]="0">
                <nz-tab nzTitle="Файл">
                  <div
                    style="padding: 16px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; text-align: center;"
                  >
                    <input type="file" (change)="handleFileUpload($event)" accept=".svg" />
                    <p style="margin-top: 8px; margin-bottom: 0; color: #64748b; font-size: 12px;">
                      Выбор файла автоматически заполнит код для предпросмотра.
                    </p>
                  </div>
                </nz-tab>
                <nz-tab nzTitle="SVG Код">
                  <textarea
                    nz-input
                    rows="6"
                    [ngModel]="uploadSvgCode()"
                    (ngModelChange)="uploadSvgCode.set($event)"
                    placeholder="<svg...></svg>"
                    style="font-family: 'Fira Code', monospace; font-size: 11px; color: #334155;"
                  >
                  </textarea>
                </nz-tab>
              </nz-tabset>
            </div>

            <!-- Live Preview -->
            @if (uploadSvgCode()) {
            <div
              style="margin-top: 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; display: flex; align-items: center; gap: 24px;"
            >
              <div
                style="width: 64px; height: 64px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #1e293b;"
                [innerHTML]="uploadPreview()"
              ></div>
              <div>
                <div
                  style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;"
                >
                  Предпросмотр
                </div>
                <div style="font-size: 13px; color: #14532d;">Иконка готова к загрузке</div>
              </div>
            </div>
            }
          </div>
        </ng-container>
      </nz-modal>

      <!-- Bulk Upload Modal -->
      <nz-modal
        [nzVisible]="isBulkUploadModalOpen()"
        nzTitle="Массовая загрузка иконок"
        (nzOnCancel)="isBulkUploadModalOpen.set(false)"
        (nzOnOk)="confirmBulkUpload()"
        [nzOkText]="'Загрузить пакет'"
        [nzCancelText]="'Отмена'"
        [nzOkDisabled]="bulkUploadFiles().length === 0 || isBulkUploading()"
        [nzWidth]="600"
      >
        <ng-container *nzModalContent>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div
              class="bulk-upload-info"
              style="background: #f0f9ff; padding: 12px; border-radius: 12px; border: 1px solid #bae6fd; font-size: 13px; color: #0369a1;"
            >
              <av-icon type="system/av_info" [size]="16" style="margin-right: 8px;"></av-icon>
              <span>Выберите несколько SVG файлов. Они будут загружены в выбранную категорию.</span>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;"
                >Категория для всех иконок</label
              >
              <nz-select
                [ngModel]="bulkUploadCategory()"
                (ngModelChange)="bulkUploadCategory.set($event)"
                style="width: 100%;"
              >
                > @for (cat of dbCategories(); track cat.id) {
                <nz-option [nzValue]="cat.folderName" [nzLabel]="cat.displayName"></nz-option>
                }
              </nz-select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;"
                >Выбор файлов (SVG)</label
              >
              <input
                type="file"
                (change)="handleBulkFileUpload($event)"
                accept=".svg"
                multiple
                style="width: 100%; padding: 8px; border: 1px dashed #cbd5e1; border-radius: 8px; cursor: pointer;"
              />
            </div>

            @if (bulkUploadFiles().length > 0) {
            <div
              class="file-list"
              style="max-height: 200px; overflow-y: auto; background: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0;"
            >
              <div
                style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;"
              >
                Список файлов ({{ bulkUploadFiles().length }})
              </div>
              @for (file of bulkUploadFiles(); track file.name) {
              <div
                style="display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: #475569;"
              >
                <av-icon type="media/av_image" [size]="14"></av-icon>
                <span
                  style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >{{ file.name }}</span
                >
                <span style="font-size: 11px; color: #94a3b8;"
                  >{{ (file.size / 1024).toFixed(1) }} KB</span
                >
              </div>
              }
            </div>
            } @if (isBulkUploading()) {
            <div style="margin-top: 8px;">
              <div
                style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"
              >
                <span>Загрузка...</span>
                <span>{{ bulkUploadProgress() }}%</span>
              </div>
              <div
                class="progress-bar"
                style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;"
              >
                <div
                  class="progress-fill"
                  [style.width.%]="bulkUploadProgress()"
                  style="height: 100%; background: #6366f1; transition: width 0.3s;"
                ></div>
              </div>
            </div>
            }
          </div>
        </ng-container>
      </nz-modal>

      <nz-modal
        [nzVisible]="isMoveModalOpen()"
        nzTitle="Переместить иконку"
        (nzOnCancel)="handleMoveCancel()"
        (nzOnOk)="confirmMove()"
        [nzOkText]="'Переместить'"
        [nzCancelText]="'Отмена'"
        [nzOkLoading]="isMoving()"
      >
        <ng-container *nzModalContent>
          <div *ngIf="moveIconSelected() as icon">
            <div
              style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;"
            >
              <div
                style="width: 40px; height: 40px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0;"
              >
                <av-icon [type]="icon.type" [size]="24"></av-icon>
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 700; color: #1e293b;">
                  {{ icon.name }}
                </div>
                <div style="font-size: 11px; color: #64748b;">
                  Текущая категория: <b>{{ currentCategoryName() }}</b>
                </div>
              </div>
            </div>

            <label
              style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #475569;"
              >Целевая категория:</label
            >
            <nz-select
              [ngModel]="targetCategoryId()"
              (ngModelChange)="targetCategoryId.set($event)"
              style="width: 100%;"
              nzPlaceHolder="Выберите категорию"
              nzShowSearch
            >
              @for (dbCat of dbCategories(); track dbCat.id) {
              <nz-option [nzValue]="dbCat.id" [nzLabel]="dbCat.displayName"></nz-option>
              }
            </nz-select>

            <div
              style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; font-size: 13px; color: #0369a1;"
            >
              <av-icon type="system/av_info" [size]="14" style="margin-right: 8px;"></av-icon>
              <span>Информация: Категория иконки будет обновлена в базе данных.</span>
            </div>
          </div>
        </ng-container>
      </nz-modal>

      <!-- Toast -->
      @if (toastMessage()) {
      <div class="toast-notification ripple-in">
        {{ toastMessage() }}
      </div>
      }

      <!-- Save to Disk Modal -->
      <nz-modal
        [(nzVisible)]="isSaveModalOpen"
        nzTitle="Сохранить на диск"
        (nzOnCancel)="isSaveModalOpen.set(false)"
        (nzOnOk)="confirmSaveToDisk()"
        [nzOkLoading]="isSavingToDisk()"
        nzOkText="Сохранить"
        nzCancelText="Отмена"
      >
        <ng-container *nzModalContent>
          <div class="modal-form">
            <div class="form-group" style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;"
                >Имя файла</label
              >
              <div style="display: flex; align-items: center; gap: 8px;">
                <input
                  nz-input
                  [ngModel]="saveFileName()"
                  (ngModelChange)="saveFileName.set($event)"
                  placeholder="name"
                />
                <span style="color: #94a3b8; font-family: monospace;">.svg</span>
              </div>
            </div>

            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;"
                >Папка для сохранения</label
              >
              <div style="display: flex; gap: 8px;">
                <input
                  nz-input
                  [ngModel]="saveFilePath()"
                  (ngModelChange)="saveFilePath.set($event)"
                  placeholder="C:/Icons/Export"
                />
                <button
                  nz-button
                  nzType="default"
                  title="Выбрать папку"
                  (click)="openFolderBrowser()"
                >
                  <av-icon type="av_folder" [size]="18"></av-icon>
                </button>
              </div>
              <p style="margin-top: 8px; font-size: 11px; color: #64748b;">
                ⚠️ Убедитесь, что у приложения есть права на запись в указанную директорию.
              </p>
            </div>
          </div>
        </ng-container>
      </nz-modal>

      <!-- Folder Browser Modal -->
      <nz-modal
        [(nzVisible)]="isFolderBrowserOpen"
        nzTitle="Выбор папки на сервере"
        (nzOnCancel)="isFolderBrowserOpen.set(false)"
        [nzFooter]="browserFooter"
        nzWidth="700px"
      >
        <ng-container *nzModalContent>
          <div class="browser-container">
            <div class="browser-header" style="margin-bottom: 16px; display: flex; gap: 8px;">
              <button nz-button (click)="goUpInBrowser()" title="Наверх">
                <av-icon type="av_arrow_left" [size]="16"></av-icon>
              </button>
              <button nz-button (click)="navigateToPath('')" title="Список дисков">
                <av-icon type="av_e_hard-drive" [size]="16"></av-icon>
              </button>
              <input
                nz-input
                [ngModel]="currentBrowserPath()"
                (keyup.enter)="navigateToPath(currentBrowserPath())"
                readonly
              />
              <button
                nz-button
                nzType="primary"
                (click)="isCreatingFolder.set(true)"
                title="Создать папку"
              >
                <av-icon type="actions/av_add" [size]="16"></av-icon>
              </button>
            </div>

            @if (isCreatingFolder()) {
            <div
              class="create-folder-bar"
              style="margin-bottom: 16px; padding: 12px; background: #eff6ff; border-radius: 8px; display: flex; gap: 8px; align-items: center; border: 1px solid #bfdbfe; animation: slideDown 0.2s ease-out;"
            >
              <av-icon type="av_folder" [size]="20" style="color: #3b82f6;"></av-icon>
              <input
                nz-input
                placeholder="Имя новой папки..."
                [ngModel]="newFolderName()"
                (ngModelChange)="newFolderName.set($event)"
                (keyup.enter)="createNewFolderInBrowser()"
                style="flex: 1;"
                #newFolderInput
              />
              <button nz-button nzType="primary" (click)="createNewFolderInBrowser()">
                Создать
              </button>
              <button
                nz-button
                nzType="default"
                (click)="isCreatingFolder.set(false); newFolderName.set('')"
              >
                X
              </button>
            </div>
            }

            <div
              class="browser-list"
              style="height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;"
            >
              @if (isBrowserLoading()) {
              <div
                style="display: flex; justify-content: center; align-items: center; height: 100%;"
              >
                <nz-spin nzSimple></nz-spin>
              </div>
              } @else {
              <div class="items-grid">
                @for (item of browserItems(); track item.path) {
                <div
                  class="browser-item"
                  (click)="
                    item.type === 'folder' || item.type === 'drive'
                      ? navigateToPath(item.path)
                      : null
                  "
                  style="display: flex; align-items: center; padding: 10px 16px; cursor: pointer; border-bottom: 1px solid #f1f5f9; hover: background: #f8fafc;"
                  [style.background]="
                    item.type === 'folder' || item.type === 'drive' ? 'transparent' : '#f8fafc'
                  "
                >
                  <av-icon
                    [type]="
                      item.type === 'drive'
                        ? 'av_e_hard-drive'
                        : item.type === 'folder'
                        ? 'av_folder'
                        : 'av_file'
                    "
                    [size]="20"
                    [style.color]="
                      item.type === 'drive'
                        ? '#6366f1'
                        : item.type === 'folder'
                        ? '#3b82f6'
                        : '#94a3b8'
                    "
                    style="margin-right: 12px;"
                  ></av-icon>
                  <span style="flex: 1; font-size: 14px; color: #1e293b;">{{ item.name }}</span>
                  @if (item.type === 'folder' || item.type === 'drive') {
                  <button
                    nz-button
                    nzType="link"
                    (click)="$event.stopPropagation(); selectInBrowser(item.path)"
                  >
                    Выбрать
                  </button>
                  }
                </div>
                }
              </div>
              }
            </div>
          </div>
        </ng-container>
        <ng-template #browserFooter>
          <button nz-button nzType="default" (click)="isFolderBrowserOpen.set(false)">
            Отмена
          </button>
          <button nz-button nzType="primary" (click)="selectInBrowser(currentBrowserPath())">
            Выбрать текущую папку
          </button>
        </ng-template>
      </nz-modal>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      /* Background & Blobs */
      .manager-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        background: #f0f4f8;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .blob {
        position: absolute;
        width: 600px;
        height: 600px;
        filter: blur(80px);
        opacity: 0.4;
        z-index: 1;
        border-radius: 50%;
      }

      .blob-1 {
        background: #cbd5e1;
        top: -200px;
        right: -100px;
        animation: float 20s infinite alternate;
      }
      .blob-2 {
        background: #94a3b8;
        bottom: -200px;
        left: -100px;
        animation: float 25s infinite alternate-reverse;
      }

      @keyframes float {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(100px, 50px);
        }
      }

      /* Glass Container */
      .manager-glass {
        position: relative;
        z-index: 10;
        width: 95%;
        height: 92%;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 32px;
        display: flex;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      /* Sidebar */
      .sidebar {
        width: 280px;
        border-right: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.4);
      }

      .sidebar-header {
        padding: 32px 24px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #6366f1, #818cf8);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
      }

      .brand-text h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #1e293b;
      }

      .brand-text span {
        font-size: 11px;
        color: #64748b;
        font-weight: 500;
      }

      .source-badge {
        font-size: 8px;
        padding: 1px 6px;
        border-radius: 12px;
        background: #f1f5f9;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        border: 1px solid #e2e8f0;

        &.backend {
          background: #e0e7ff;
          color: #4338ca;
          border-color: #c7d2fe;
        }
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 100px 0;
        gap: 20px;
        color: #6366f1;

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        p {
          font-weight: 500;
          font-size: 16px;
        }
      }

      .small-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .sidebar-content {
        flex: 1;
        padding: 0 16px;
        overflow-y: auto;
      }

      .nav-section {
        margin-bottom: 32px;
      }

      .nav-section label {
        display: block;
        padding: 0 12px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #94a3b8;
        font-weight: 700;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 8px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 12px;
        color: #475569;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 2px;
      }

      .nav-item:hover {
        background: rgba(0, 0, 0, 0.03);
        color: #1e293b;
      }

      .nav-item.active {
        background: #fff;
        color: #6366f1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .nav-item .badge {
        margin-left: auto;
        font-size: 11px;
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
        padding: 2px 8px;
        border-radius: 20px;
      }

      .nav-item.folder .count {
        margin-left: auto;
        font-size: 11px;
        color: #94a3b8;
      }

      .add-folder-btn {
        margin-top: 8px;
        color: #6366f1;
        border: 1px dashed rgba(99, 102, 241, 0.3);
        background: rgba(99, 102, 241, 0.03);
      }

      .add-folder-btn:hover {
        background: rgba(99, 102, 241, 0.08);
        border-color: rgba(99, 102, 241, 0.5);
        color: #4f46e5;
      }

      .text-danger {
        color: #ef4444 !important;
      }

      .sidebar-footer {
        padding: 24px;
      }

      .storage-card {
        background: rgba(255, 255, 255, 0.6);
        padding: 16px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.8);
      }

      .storage-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 8px;
      }

      .progress-bar {
        height: 6px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #a855f7);
      }

      .storage-card p {
        margin: 0;
        font-size: 11px;
        color: #94a3b8;
      }

      /* Main Content Area */
      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.2);
      }

      .main-header {
        height: 80px;
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .search-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #fff;
        padding: 10px 16px;
        border-radius: 16px;
        width: 400px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .search-wrapper input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 14px;
        background: transparent;
      }

      .search-wrapper kbd {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 0 6px;
        font-size: 11px;
        color: #94a3b8;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      .btn-primary {
        background: #6366f1;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary:hover {
        background: #4f46e5;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
      }

      .btn-outline {
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 10px 20px;
        border-radius: 14px;
        font-weight: 600;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-outline:hover {
        background: #f8fafc;
        border-color: rgba(0, 0, 0, 0.2);
      }

      .content {
        flex: 1;
        padding: 40px;
        overflow-y: auto;
      }

      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }

      .view-title h1 {
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #1e293b;
      }

      .breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #94a3b8;
        font-weight: 600;
      }

      .breadcrumbs .current {
        color: #6366f1;
      }

      .view-controls {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .control-group {
        display: flex;
        background: rgba(255, 255, 255, 0.5);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      .icon-btn {
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-btn.active {
        background: #fff;
        color: #6366f1;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      }

      .divider {
        width: 1px;
        height: 24px;
        background: rgba(0, 0, 0, 0.1);
      }

      .custom-select {
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: #fff;
        padding: 8px 16px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 13px;
        color: #475569;
        outline: none;
      }

      /* Grid & Cards */
      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 24px;
      }

      .icon-card {
        background: #fff;
        border-radius: 24px;
        padding: 16px;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        border: 1px solid rgba(0, 0, 0, 0.05);
        cursor: pointer;
      }

      .icon-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
        border-color: #6366f1;
      }

      .card-preview {
        height: 140px;
        background: #f8fafc;
        border-radius: 18px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .preview-inner {
        transition: transform 0.3s;
        color: #475569;
      }

      .icon-card:hover .preview-inner {
        transform: scale(1.1);
        color: #6366f1;
      }

      .card-overlay {
        position: absolute;
        inset: 0;
        background: rgba(99, 102, 241, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
        backdrop-filter: blur(4px);
      }

      .icon-card:hover .card-overlay {
        opacity: 1;
      }

      .overlay-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: none;
        background: #fff;
        color: #475569;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
      }

      .overlay-btn:hover {
        transform: scale(1.1);
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .card-info .name {
        font-weight: 700;
        font-size: 14px;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-info .meta {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
      /* Toast */
      .toast-notification {
        position: fixed;
        bottom: 40px;
        right: 40px;
        background: #1e293b;
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        font-weight: 600;
        pointer-events: none;
      }

      /* Editor Styles */
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        height: 100%;
      }

      .preview-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .preview-box {
        background: #f8fafc;
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        border: 2px solid transparent;
        transition: all 0.3s;
      }

      .preview-box label {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 700;
        color: #94a3b8;
      }

      .preview-box.active {
        border-color: #6366f1;
        background: #eef2ff;
      }

      .icon-wrapper {
        width: 120px;
        height: 120px;
        background-color: #ffffff;
        background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
        background-size: 10px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        color: #1e293b;

        svg {
          width: 64px;
          height: 64px;
          display: block;
        }
      }

      .placeholder {
        font-size: 12px;
        color: #94a3b8;
        font-style: italic;
      }

      .meta-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #f1f5f9;
        padding: 16px;
        border-radius: 12px;
      }

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .meta-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .meta-item .label {
        font-size: 10px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .meta-item .value {
        font-size: 14px;
        color: #1e293b;
        font-weight: 500;

        &.editable {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;

          &:hover {
            background: #e2e8f0;
          }
        }
      }

      // Режим редактирования
      .edit-mode {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .name-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 14px;
        font-family: monospace;
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        &:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
        }
      }

      .edit-actions {
        display: flex;
        gap: 4px;
      }

      .save-btn,
      .cancel-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .save-btn {
        background: #10b981;
        color: white;

        &:hover:not(:disabled) {
          background: #059669;
        }
      }

      .cancel-btn {
        background: #f1f5f9;
        color: #64748b;

        &:hover:not(:disabled) {
          background: #e2e8f0;
        }
      }

      .error-message {
        font-size: 12px;
        color: #ef4444;
        padding: 8px 12px;
        background: #fef2f2;
        border-radius: 6px;
        border: 1px solid #fecaca;
      }

      .hint-message {
        font-size: 11px;
        color: #64748b;
        font-style: italic;
      }

      .icon-btn-small {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
      }

      .passport-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
        overflow: hidden;

        &.standard {
          border-left: 4px solid #10b981;
        }

        &:not(.standard) {
          border-left: 4px solid #f59e0b;
        }
      }

      .passport-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .passport-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .fix-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #6366f1;
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        av-icon {
          filter: brightness(0) invert(1);
        }
      }

      .passport-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
      }

      .sync-tab-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
      }

      .sync-info-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f0f9ff;
        color: #0369a1;
        padding: 12px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #bae6fd;
      }

      .sync-actions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sync-action-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;

        &:hover {
          border-color: #6366f1;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        &.primary {
          border-color: #6366f1;
          background: #f5f3ff;

          .btn-icon {
            background: #6366f1;
            color: white;
          }
        }

        .btn-icon {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          position: relative;

          .plus-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #10b981;
            color: white;
            font-size: 10px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            border: 2px solid white;
          }
        }

        .btn-text {
          display: flex;
          flex-direction: column;

          .title {
            font-weight: 700;
            font-size: 15px;
            color: #1e293b;
          }
          .desc {
            font-size: 12px;
            color: #64748b;
          }
        }
      }

      .fix-btn.danger {
        background: #fff1f2;
        color: #e11d48;
        border-color: #fecdd3;
      }

      .fix-btn.danger:hover {
        background: #ffe4e6;
        border-color: #fda4af;
      }

      .status-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        background: #f1f5f9;
        color: #64748b;

        &.ok {
          background: #dcfce7;
          color: #166534;
        }
      }

      .passport-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .p-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 800;
        }

        span,
        code {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        code {
          background: #f8fafc;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
      }

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .meta-item .label {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }

      .meta-item .value {
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
      }

      .code-editor-wrapper {
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px;
        border: 1px solid #e2e8f0;

        textarea {
          width: 100%;
          height: 180px;
          background: #1e293b;
          color: #e2e8f0;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;

          &.optimized {
            border: 2px solid #22c55e;
          }

          &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          }
        }

        .code-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }

        .code-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 16px 0;
          color: #6366f1;
          font-size: 12px;
          font-weight: 600;

          av-icon {
            color: #6366f1;
          }

          .active-edit {
            background: #10b981 !important;
            color: white !important;
            border-color: #059669 !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }

          @keyframes spin-refresh {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .refresh-animate {
            &:active av-icon {
              animation: spin-refresh 0.5s ease-out;
            }
          }
        }
      }
      .editor-footer {
        margin-top: auto;
        padding-top: 24px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        gap: 12px;
      }

      .spacer {
        flex: 1;
      }

      /* Animation for live preview */
      .preview-box.active .icon-wrapper {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }

      /* Enrichment Form */
      .enrich-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      /* Batch Processing Styles */
      .batch-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        height: 100%;
      }

      .batch-header-info {
        background: #f8fafc;
        padding: 20px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;

        h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #1e293b;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
      }

      .batch-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .batch-action-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: all 0.3s;
        cursor: pointer;

        &:hover:not(.disabled) {
          border-color: #6366f1;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-icon {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .action-info {
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #1e293b;
          }
          p {
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
          }
        }
      }

      .progress-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 100;
        border-radius: 24px;
        padding: 40px;
        text-align: center;
      }

      .custom-progress-bar {
        width: 100%;
        height: 12px;
        background: #f1f5f9;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 16px;
        position: relative;

        .fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      .log-container {
        background: #1e293b;
        border-radius: 12px;
        padding: 16px;
        font-family: 'Fira Code', monospace;
        margin-top: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .log-scroll {
        height: 180px;
        overflow-y: auto;
        font-size: 11px;
        line-height: 1.5;
        color: #cbd5e1;

        .log-entry {
          margin-bottom: 4px;
          &.success {
            color: #10b981;
          }
          &.error {
            color: #f43f5e;
          }
        }
      }

      .browser-container {
        .browser-item {
          transition: all 0.2s;
          &:hover {
            background: #f1f5f9 !important;
          }
        }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class IconManagerComponent {
  private http = inject(HttpClient);
  private iconDataService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private sanitizer = inject(DomSanitizer);
  private globalIconService = inject(IconGetService);
  private dbCategoryService = inject(IconCategoryService);

  // State Signals
  isLoading = signal(true);
  isSyncing = signal(false);
  dataSource = signal<'backend' | 'local'>('local');

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  toastMessage = signal('');

  // Editor Signals
  isEditorOpen = signal(false);
  selectedIcon = signal<any>(null);
  rawSvgCode = signal('');
  cleanedSvgCode = signal('');

  // Batch Lab Signals
  isBatchLabOpen = signal(false);
  isHelpModalOpen = signal(false);
  isBatchProcessing = signal(false);
  batchProgress = signal(0);
  batchLog = signal<string[]>([]);
  batchTotal = signal(0);
  batchCurrent = signal(0);
  batchCurrentName = signal('');
  batchMode = signal<'all' | 'filtered' | 'category'>('all');
  batchCategoryId = signal<number | null>(null);
  batchCategoryName = signal<string>('');
  batchSearchQuery = signal('');
  batchReplaceQuery = signal('');

  // Enrichment Signals
  metaTitle = signal('');
  metaDesc = signal('');
  metaAuthor = signal('');
  metaDataKey = signal('');
  metaDataValue = signal('');

  // Upload Signals
  isUploadModalOpen = signal(false);
  uploadCategory = signal('general');
  uploadName = signal('');
  uploadSvgCode = signal('');
  uploadPreview = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.uploadSvgCode() || ''),
  );

  // Bulk Upload Signals
  isBulkUploadModalOpen = signal(false);
  bulkUploadCategory = signal('general');
  bulkUploadFiles = signal<File[]>([]);
  isBulkUploading = signal(false);
  bulkUploadProgress = signal(0);

  // Move Signals
  isMoving = signal(false);
  isMoveModalOpen = signal(false);
  moveIconSelected = signal<IconMetadata | null>(null);
  currentCategoryName = signal('');
  targetCategoryId = signal<number | null>(null);
  dbCategories = signal<DbCategory[]>([]);

  // Rename Signals
  isEditingName = signal(false);
  editedName = signal('');
  nameError = signal<string | null>(null);
  isRenamingInProgress = signal(false);

  // Manual Edit Signals
  isManualEdit = signal(false);
  manualEditedCode = signal('');

  // Save to Disk Signals
  isSaveModalOpen = signal(false);
  saveFileName = signal('');
  saveFilePath = signal('C:/'); // Start at C:/ for Windows
  isSavingToDisk = signal(false);

  // Folder Browser Signals
  isFolderBrowserOpen = signal(false);
  currentBrowserPath = signal('');
  browserItems = signal<any[]>([]);
  isBrowserLoading = signal(false);

  // Create Folder in Browser Signals
  isCreatingFolder = signal(false);
  newFolderName = signal('');

  // View Tab Code Signal
  viewCodeSignal = signal<string | null>(null);

  // Active Tab Tracking
  activeEditorTab = signal(0); // 0=Исходный код, 1=Просмотр, 2=Метаданные

  // Technical Passport Signals
  iconPassport = signal<{
    originalWidth: string;
    originalHeight: string;
    viewBox: string;
    isStandard: boolean;
    pathCount: number;
    hasCurrentColor: boolean;
  } | null>(null);

  // Track which categories have their SVG content fully loaded
  private loadedCategories = new Set<string>();

  // Static/Computed Data
  categories = signal<IconCategoryWithCount[]>([]);

  constructor() {
    // this.loadIcons(); // Disabled initial load as per requirement
    this.loadDbCategories();

    // Lazy load content when category changes
    effect(() => {
      const catName = this.selectedCategory();
      if (catName && !this.loadedCategories.has(catName)) {
        this.loadCategoryContent(catName);
      }
    });
  }

  private loadDbCategories() {
    this.dataSource.set('backend');
    this.dbCategoryService.getAll().subscribe({
      next: (res) => {
        this.dbCategories.set(res.data);

        // Initialize categories for sidebar with empty icon lists
        const initialCats: IconCategoryWithCount[] = res.data.map((c: any) => ({
          category: c.displayName || c.folderName || c.name || 'Unnamed',
          icons: [],
          totalCount: c.iconCount || 0,
        }));
        this.categories.set(initialCats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.isLoading.set(false);
      },
    });
  }

  private loadIcons(force: boolean = false) {
    // Legacy method kept for reference or full reload if needed, but not used on init
    // implementation omitted or kept as is if not conflicting
    console.log('Legacy loadIcons called');
  }

  private loadCategoryContent(catName: string) {
    const dbCat = this.dbCategories().find(
      (c) => c.folderName === catName || c.displayName === catName,
    );
    if (!dbCat) return;

    this.isLoading.set(true); // Show loading state

    this.iconDataService.getCategoryContent(dbCat.id).subscribe({
      next: (iconsWithContent: any[]) => {
        const iconsMap: Record<string, string> = {};

        // Map backend response to IconMetadata structure
        const newIcons = iconsWithContent.map((i: any) => {
          if (i.svgContent) {
            iconsMap[i.name] = i.svgContent;
          }
          return {
            name: i.name,
            category: catName,
            type: `${catName}/${i.name}`,
            svgContent: i.svgContent,
            // Defaults for metadata
            id: i.id,
          };
        });

        // 1. Update component's local state - POPULATE icons for this category
        this.categories.update((cats) =>
          cats.map((c) => {
            if (c.category === catName) {
              return {
                ...c,
                icons: newIcons, // Replace empty list with fetched icons
              };
            }
            return c;
          }),
        );

        // 2. IMPORTANT: Update the global IconService cache
        (this.globalIconService as any).injectBatchContent(iconsMap);

        this.loadedCategories.add(catName);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(`[IconManager] Failed to load content for category ${catName}`, err);
        this.isLoading.set(false);
      },
    });
  }

  syncToLocal() {
    this.isSyncing.set(true);
    console.log('[IconManager] 🔄 Triggering backend synchronization...');

    this.http.post(ApiEndpoints.ICONS.SYNC_TO_LOCAL, {}).subscribe({
      next: (res: any) => {
        console.log('[IconManager] ✅ Backend sync successful:', res);
        this.message.success('✅ Библиотека иконок синхронизирована!');
        this.globalIconService.clearCache(); // Refresh global SVG cache
        this.loadIcons(true); // Refresh grid with updated data
        this.isSyncing.set(false);
      },
      error: (err: any) => {
        console.error('[IconManager] ❌ Sync failed', err);
        this.message.error('❌ Ошибка при синхронизации!');
        this.isSyncing.set(false);
      },
    });
  }

  refactorIcons() {
    this.isSyncing.set(true);
    console.log('[IconManager] 🪄 refactorIcons started...');

    let url = ApiEndpoints.ICONS.REFACTOR_NAMES;
    const isCategoryMode = this.batchMode() === 'category';
    const catId = this.batchCategoryId();

    if (isCategoryMode && catId) {
      url += `?categoryId=${catId}`;
      this.addBatchLog(
        `Запуск рефакторинга имен для категории [${this.batchCategoryName()}]...`,
        'info',
      );
    } else {
      this.addBatchLog('Запуск рефакторинга имен для всей библиотеки...', 'info');
    }

    this.http.post(url, {}).subscribe({
      next: (res: any) => {
        console.log('[IconManager] ✅ Names refactored successfully.', res);

        if (res.details && res.details.length > 0) {
          res.details.forEach((d: any) => {
            const loc = d.location ? ` [${d.location}]` : '';
            if (d.success) {
              this.addBatchLog(`✅${loc} [${d.category}] ${d.oldName} -> ${d.newName}`, 'success');
            } else {
              this.addBatchLog(`❌${loc} [${d.category}] ${d.oldName}: ${d.message}`, 'error');
            }
          });
          const successCount = res.details.filter((d: any) => d.success).length;
          this.addBatchLog(`Рефакторинг завершен. Изменено иконок: ${successCount}`, 'success');
        } else {
          this.addBatchLog(
            'Изменений не потребовалось. Все имена соответствуют стандарту.',
            'success',
          );
        }

        this.message.success('✅ Имена иконок успешно реорганизованы!');
        this.isSyncing.set(false);
        this.loadIcons(true); // Force reload after rename
      },
      error: (err: unknown) => {
        console.error('[IconManager] ❌ Refactor failed', err);
        this.message.error('❌ Ошибка при рефакторинге имен');
        this.isSyncing.set(false);
      },
    });
  }

  onBatchCategoryChange(id: number) {
    this.batchCategoryId.set(id);
    const cat = this.dbCategories().find((c) => c.id === id);
    if (cat) {
      this.batchCategoryName.set(cat.displayName);
    }
  }

  totalIcons = computed(() => {
    return this.categories().reduce((acc: number, cat: IconCategory) => acc + cat.icons.length, 0);
  });

  storageUsage = computed(() => {
    const total = this.totalIcons();
    return Math.min(Math.round(((total * 1.5) / 5120) * 100), 100);
  });

  filteredIcons = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    let icons = this.categories().flatMap((c: IconCategory) => c.icons);

    if (category) icons = icons.filter((i: IconMetadata) => i.category === category);
    if (query) {
      icons = icons.filter(
        (i: IconMetadata) =>
          i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query),
      );
    }
    return icons;
  });

  // Safe preview for innerHTML
  safeCleanedSvg = computed<SafeHtml>(() => {
    const code = this.isManualEdit() ? this.manualEditedCode() : this.cleanedSvgCode();
    if (!code) return '';
    return this.sanitizer.bypassSecurityTrustHtml(code);
  });

  onSearchChange(val: string) {
    this.searchQuery.set(val);
  }

  // --- Category Management ---
  openCategoryManager() {
    const modal = this.modal.create({
      nzTitle: 'Управление папками иконок',
      nzContent: IconCategoryManagerComponent,
      nzWidth: 1000,
      nzFooter: null,
      nzClassName: 'category-manager-modal',
    });

    modal.afterClose.subscribe(() => {
      // Перезагружаем категории после закрытия, так как они могли измениться
      this.loadDbCategories();
    });
  }

  // Editor Actions
  openEditor(icon: any) {
    this.selectedIcon.set(icon);
    this.cleanedSvgCode.set('');
    this.rawSvgCode.set('Загрузка кода...');
    this.viewCodeSignal.set(null);
    this.isEditorOpen.set(true);

    // Reset enrichment
    this.metaTitle.set('');
    this.metaDesc.set('');
    this.metaAuthor.set('Aurora Studio');
    this.metaDataKey.set('data-icon-id');
    this.metaDataValue.set(icon.name);

    // Load actual SVG content from Backend
    this.http.get(ApiEndpoints.ICONS.CONTENT(icon.name), { responseType: 'text' }).subscribe({
      next: (code) => {
        this.rawSvgCode.set(code);
        this.generatePassport(code);
      },
      error: (err) => {
        let errorMsg = 'Ошибка загрузки SVG из базы данных.';
        console.error(`Failed to load icon content for: ${icon.name}`, err);

        if (err?.status === 404) {
          errorMsg = `⚠️ Иконка "${icon.name}" не найдена в БД.`;
        }

        this.rawSvgCode.set(errorMsg);
        this.iconPassport.set(null);
        this.showToast(errorMsg);
      },
    });
  }

  private generatePassport(svg: string) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (!svgEl) return;

      const vb = svgEl.getAttribute('viewBox') || 'Not set';
      const w = svgEl.getAttribute('width') || 'Auto';
      const h = svgEl.getAttribute('height') || 'Auto';
      const paths = doc.querySelectorAll('path, circle, rect, polyline, polygon, ellipse').length;
      const hasCurrentColor = svg.includes('currentColor');

      // Check if it's standard 24x24
      const isStandard =
        vb === '0 0 24 24' ||
        (vb === 'Not set' && (w === '24' || w === '24px') && (h === '24' || h === '24px'));

      this.iconPassport.set({
        originalWidth: w,
        originalHeight: h,
        viewBox: vb,
        isStandard,
        pathCount: paths,
        hasCurrentColor,
      });
    } catch (e) {
      this.iconPassport.set(null);
    }
  }

  normalizeToStandard() {
    const raw = this.cleanedSvgCode() || this.rawSvgCode();
    if (!raw || raw.startsWith('Loading')) return;

    try {
      const normalized = this.internalNormalize(raw);
      this.cleanedSvgCode.set(normalized);
      this.generatePassport(normalized);
      this.showToast('Иконка успешно масштабирована до стандарта 24x24!');
    } catch (e) {
      console.error(e);
      this.showToast('Ошибка при нормализации.');
    }
  }

  deleteCurrentIcon() {
    const icon = this.selectedIcon();
    if (!icon) return;

    this.modal.confirm({
      nzTitle: 'Вы уверены, что хотите удалить эту иконку?',
      nzContent: `<b style="color: #e11d48;">${icon.name}</b> будет удалена из Master (Backend) и Assets (Frontend). Это действие необратимо.`,
      nzOkText: 'Удалить',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.delete(ApiEndpoints.ICONS.DELETE(icon.type, true, true)).subscribe({
          next: () => {
            this.message.success(`Иконка ${icon.name} успешно удалена`);
            this.isEditorOpen.set(false);
            this.loadIcons(true);
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.message.error('Ошибка при удалении иконки');
          },
        });
      },
      nzCancelText: 'Отмена',
    });
  }

  applyMetadata() {
    const raw = this.cleanedSvgCode() || this.rawSvgCode();
    if (!raw || raw.startsWith('Loading')) return;

    try {
      const enriched = this.internalApplyMetadata(raw);
      this.cleanedSvgCode.set(enriched);
      this.showToast('Метаданные успешно внедрены!');
    } catch (e) {
      this.showToast('Ошибка при применении метаданных.');
    }
  }

  private internalApplyMetadata(raw: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) throw new Error('Invalid SVG');

    // 1. Inject Title
    if (this.metaTitle()) {
      let titleEl = svg.querySelector('title');
      if (!titleEl) {
        titleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'title') as any;
        if (titleEl) svg.prepend(titleEl);
      }
      if (titleEl) titleEl.textContent = this.metaTitle();
    }

    // 2. Inject Desc
    if (this.metaDesc()) {
      let descEl = svg.querySelector('desc');
      if (!descEl) {
        descEl = doc.createElementNS('http://www.w3.org/2000/svg', 'desc') as any;
        const titleEl = svg.querySelector('title');
        if (titleEl && descEl) titleEl.after(descEl);
        else if (descEl) svg.prepend(descEl);
      }
      if (descEl) descEl.textContent = this.metaDesc();
    }

    // 3. Inject Author Comment
    if (this.metaAuthor()) {
      const comment = doc.createComment(` Author: ${this.metaAuthor()} `);
      svg.prepend(comment);
    }

    // 4. Inject Data Attribute
    if (this.metaDataKey() && this.metaDataValue()) {
      svg.setAttribute(this.metaDataKey(), this.metaDataValue());
    }

    return new XMLSerializer().serializeToString(doc);
  }

  optimizeSvg() {
    const raw = this.rawSvgCode();
    if (!raw || raw.startsWith('Loading')) return;

    try {
      console.log('[IconManager] optimizeSvg called, invoking internalOptimize...');
      const optimized = this.internalOptimize(raw);
      this.cleanedSvgCode.set(optimized);

      // If we are in manual edit mode, also update the manual code
      if (this.isManualEdit()) {
        this.manualEditedCode.set(optimized);
      }

      this.iconPassport.update((p) => {
        if (!p) return null;
        return { ...p, isStandard: true };
      });

      this.showToast('✅ SVG код оптимизирован (предпросмотр)');
    } catch (e) {
      console.error('Optimization error:', e);
      this.showToast('❌ Ошибка оптимизации');
    }
  }

  toggleManualEdit() {
    if (!this.isManualEdit()) {
      // Start editing
      this.manualEditedCode.set(this.cleanedSvgCode());
      this.isManualEdit.set(true);
    } else {
      // Finish editing
      this.cleanedSvgCode.set(this.manualEditedCode());
      this.isManualEdit.set(false);
      this.showToast('✅ Изменения зафиксированы');
    }
  }

  refreshPreview() {
    // Force a small update to trigger re-computation if needed,
    // though signal update should handle it.
    this.showToast('🔄 Предпросмотр обновлен');
    // Generating passport for edited code
    this.generatePassport(this.manualEditedCode());
  }

  onPreviewClick() {
    const code = this.viewCodeSignal() ?? (this.cleanedSvgCode() || this.rawSvgCode());
    if (code) {
      this.cleanedSvgCode.set(code);
      this.generatePassport(code);
      this.showToast('✅ Предпросмотр обновлен из окна просмотра');
    }
  }

  onSaveToDiskClick() {
    const icon = this.selectedIcon();
    if (!icon) return;

    this.saveFileName.set(icon.name);
    this.isSaveModalOpen.set(true);
  }

  confirmSaveToDisk() {
    const name = this.saveFileName();
    const path = this.saveFilePath();
    const content = this.viewCodeSignal() ?? (this.cleanedSvgCode() || this.rawSvgCode());

    if (!name || !path || !content) {
      this.showToast('⚠️ Заполните все поля');
      return;
    }

    this.isSavingToDisk.set(true);

    this.iconDataService.saveToDisk(name, path, content).subscribe({
      next: (res) => {
        this.message.success(`✅ Иконка ${name}.svg успешно сохранена в ${path}`);
        this.isSavingToDisk.set(false);
        this.isSaveModalOpen.set(false);
      },
      error: (err) => {
        console.error('[IconManager] ❌ Save failed', err);
        this.message.error('❌ Ошибка при сохранении на диск');
        this.isSavingToDisk.set(false);
      },
    });
  }

  // --- Folder Browser Methods ---
  openFolderBrowser() {
    this.isCreatingFolder.set(false);
    this.newFolderName.set('');
    this.isFolderBrowserOpen.set(true);
    this.navigateToPath(this.saveFilePath() || '');
  }

  navigateToPath(path: string) {
    this.isBrowserLoading.set(true);
    this.currentBrowserPath.set(path);
    this.iconDataService.browseFileSystem(path).subscribe({
      next: (items) => {
        this.browserItems.set(items);
        this.isBrowserLoading.set(false);
      },
      error: (err) => {
        this.message.error('Ошибка доступа к директории');
        this.isBrowserLoading.set(false);
      },
    });
  }

  goUpInBrowser() {
    const current = this.currentBrowserPath();
    if (!current || current.length <= 3) {
      this.navigateToPath(''); // Go back to drive list
      return;
    }

    // Simple parent directory logic for Windows/Linux
    const lastSlash = Math.max(current.lastIndexOf('/'), current.lastIndexOf('\\'));
    if (lastSlash > 0) {
      let parent = current.substring(0, lastSlash);
      if (parent.endsWith(':')) parent += '/';
      this.navigateToPath(parent);
    } else {
      this.navigateToPath('');
    }
  }

  selectInBrowser(path: string) {
    this.saveFilePath.set(path);
    this.isFolderBrowserOpen.set(false);
  }

  createNewFolderInBrowser() {
    const name = this.newFolderName().trim();
    const current = this.currentBrowserPath();

    if (!name || !current) {
      if (!current) this.message.warning('Выберите диск перед созданием папки');
      return;
    }

    const fullPath =
      current.endsWith('/') || current.endsWith('\\') ? current + name : current + '/' + name;

    this.isBrowserLoading.set(true);
    this.iconDataService.createDirectory(fullPath).subscribe({
      next: () => {
        this.message.success(`Папка "${name}" успешно создана`);
        this.isCreatingFolder.set(false);
        this.newFolderName.set('');
        this.navigateToPath(current); // Refresh
      },
      error: (err) => {
        this.message.error('Ошибка при создании папки');
        this.isBrowserLoading.set(false);
      },
    });
  }

  onManualCodeChange(code: string) {
    if (this.isManualEdit()) {
      this.manualEditedCode.set(code);
    }
  }

  granularSync(toBackend: boolean, toFrontend: boolean) {
    const icon = this.selectedIcon();
    const content = this.cleanedSvgCode() || this.rawSvgCode();

    if (!icon || !content) {
      this.showToast('⚠️ Нет данных для синхронизации');
      return;
    }

    const typeStr =
      toBackend && toFrontend
        ? 'на сервер и клиент'
        : toBackend
        ? 'только на сервер'
        : 'только на клиент';
    this.showToast(`📡 Запуск синхронизации ${typeStr}...`);

    this.http
      .post(ApiEndpoints.ICONS.UPDATE, {
        iconType: icon.type,
        svgContent: content,
        toBackend: toBackend,
        toFrontend: toFrontend,
      })
      .subscribe({
        next: (res: any) => {
          this.showToast(`✅ Синхронизация ${typeStr} выполнена успешно!`);
          if (toFrontend) {
            this.loadIcons(true); // Refresh grid if frontend was updated
          }
        },
        error: (err) => {
          console.error('Granular sync failed', err);
          this.showToast('❌ Ошибка при выполнении синхронизации');
        },
      });
  }

  onUploadClick() {
    this.isUploadModalOpen.set(true);
    this.uploadName.set('');
    this.uploadSvgCode.set('');
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.uploadName()) {
        this.uploadName.set(file.name.replace('.svg', ''));
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadSvgCode.set(e.target.result);
      };
      reader.readAsText(file);
    }
  }

  confirmUpload() {
    const name = this.uploadName();
    const category = this.uploadCategory();
    const content = this.uploadSvgCode();

    if (!name || !category || !content) {
      this.showToast('⚠️ Заполните все поля и выберите файл');
      return;
    }

    const iconType = `${category}/${name}`;

    this.http
      .post(ApiEndpoints.ICONS.UPDATE, {
        iconType: iconType,
        svgContent: content,
      })
      .subscribe({
        next: (res: any) => {
          console.log(`[IconManager] ✅ Upload success for ${name}. Triggering auto-sync...`);
          this.showToast(`✅ Иконка "${name}" успешно загружена!`);
          this.isUploadModalOpen.set(false);
          this.globalIconService.clearCache();
          this.syncToLocal(); // Auto-sync after upload
        },
        error: (err: any) => {
          console.error('[IconManager] ❌ Upload failed', err);
          this.showToast('❌ Ошибка при загрузке иконки');
        },
      });
  }

  onBulkUploadClick() {
    this.isBulkUploadModalOpen.set(true);
    this.bulkUploadFiles.set([]);
    this.bulkUploadCategory.set('general');
    this.bulkUploadProgress.set(0);
    this.isBulkUploading.set(false);
  }

  handleBulkFileUpload(event: any) {
    const files = Array.from(event.target.files) as File[];
    const svgFiles = files.filter((f) => f.name.toLowerCase().endsWith('.svg'));
    if (svgFiles.length < files.length) {
      this.message.warning('Некоторые файлы не являются SVG и были пропущены');
    }
    this.bulkUploadFiles.set(svgFiles);
  }

  async confirmBulkUpload() {
    const files = this.bulkUploadFiles();
    const category = this.bulkUploadCategory();

    if (files.length === 0) {
      this.showToast('⚠️ Выберите файлы для загрузки');
      return;
    }

    this.isBulkUploading.set(true);
    this.bulkUploadProgress.set(0);

    const requests: any[] = [];

    try {
      // 1. Read all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        const name = file.name.replace('.svg', '');
        requests.push({
          iconType: `${category}/${name}`,
          svgContent: content,
          toBackend: true,
          toFrontend: true,
        });

        // Progress for reading
        this.bulkUploadProgress.set(Math.round(((i + 1) / files.length) * 30));
      }

      // 2. Send batch request
      this.http
        .post(ApiEndpoints.ICONS.BATCH_UPDATE, requests, {
          headers: { 'X-Skip-Error-Handler': 'true' },
        })
        .subscribe({
          next: () => {
            console.log('[IconManager] 📦 Batch upload response received');
            this.bulkUploadProgress.set(100);
            this.showToast(`✅ Пакет из ${files.length} иконок успешно загружен!`);
            this.isBulkUploadModalOpen.set(false);
            this.isBulkUploading.set(false);
            this.globalIconService.clearCache();
            this.syncToLocal(); // Auto-sync after bulk upload
          },
          error: (err: any) => {
            console.error('[IconManager] ❌ Bulk upload failed', {
              error: err,
              requestsCount: requests.length,
              sampleRequest: requests[0],
            });
            const detail = err?.detail || err?.message || 'Неизвестная ошибка';
            this.showToast(`❌ Ошибка при массовой загрузке: ${detail}`);
            this.isBulkUploading.set(false);
          },
        });
    } catch (e) {
      console.error('[IconManager] ❌ Error reading files', e);
      this.showToast('❌ Ошибка при чтении файлов');
      this.isBulkUploading.set(false);
    }
  }

  deleteIcon(type: string) {
    this.showToast(`Удаление иконки "${type}" заблокировано в демо-режиме.`);
  }

  copyType(type: string) {
    navigator.clipboard.writeText(type);
    this.showToast(`Тип "${type}" скопирован в буфер!`);
  }

  copyCode(type: string) {
    const code = `<av-icon type="${type}" [size]="24"></av-icon>`;
    navigator.clipboard.writeText(code);
    this.showToast('Код компонента скопирован!');
  }

  copySvg(input: any) {
    const name = typeof input === 'string' ? input.split('/').pop() : input.name;
    if (!name) {
      this.showToast('❌ Не удалось определить имя иконки');
      return;
    }

    this.http.get(ApiEndpoints.ICONS.CONTENT(name), { responseType: 'text' }).subscribe({
      next: (code) => {
        navigator.clipboard.writeText(code);
        this.showToast('✅ SVG скопирован из базы данных');
      },
      error: () => this.showToast('❌ Ошибка загрузки SVG из БД'),
    });
  }

  batchIconsCount = computed(() => {
    if (this.batchMode() === 'all') return this.totalIcons();
    if (this.batchMode() === 'filtered') return this.filteredIcons().length;

    // Category mode
    const catName = this.batchCategoryName();
    if (!catName) return 0;
    const cat = this.categories().find((c) => c.category === catName);
    return cat ? cat.icons.length : 0;
  });

  // Batch Operations
  async startBatchProcess(type: 'optimize' | 'normalize' | 'replace' | 'metadata') {
    let icons: IconMetadata[] = [];

    if (this.batchMode() === 'all') {
      icons = this.categories().flatMap((c: IconCategory) => c.icons);
    } else if (this.batchMode() === 'filtered') {
      icons = this.filteredIcons();
    } else if (this.batchMode() === 'category') {
      const catName = this.batchCategoryName();
      const cat = this.categories().find((c) => c.category === catName);
      icons = cat ? cat.icons : [];
    }

    if (icons.length === 0) {
      this.showToast('⚠️ Нет иконок для обработки');
      return;
    }

    this.batchTotal.set(icons.length);
    this.batchCurrent.set(0);
    this.batchProgress.set(0);
    this.isBatchProcessing.set(true);
    this.batchLog.set([`Запуск массовой обработки (${type}) для ${icons.length} иконок...`]);

    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      this.batchCurrentName.set(icon.name || icon.type);
      try {
        // Find correct path: icon.type might be "category/name" or just "name"
        const code = await firstValueFrom(
          this.http.get(ApiEndpoints.ICONS.CONTENT(icon.name), {
            responseType: 'text',
            headers: { 'X-Skip-Error-Handler': 'true' },
          }),
        );

        let processed = code;
        if (type === 'optimize') {
          processed = this.internalOptimize(code);
        } else if (type === 'normalize') {
          processed = this.internalNormalize(code);
        } else if (type === 'replace' && this.batchSearchQuery()) {
          processed = code.split(this.batchSearchQuery()).join(this.batchReplaceQuery());
        } else if (type === 'metadata') {
          processed = this.internalApplyMetadata(code);
        }

        // Send to backend
        await firstValueFrom(
          this.http.post(ApiEndpoints.ICONS.UPDATE, {
            iconType: icon.type,
            svgContent: processed,
            toBackend: true,
            toFrontend: true,
          }),
        );

        this.batchCurrent.set(i + 1);
        this.batchProgress.set(Math.round(((i + 1) / icons.length) * 100));
        this.addBatchLog(`✅ Обработано и сохранено: ${icon.type}`, 'success');
      } catch (e: any) {
        // Детальная обработка ошибок
        let errorMessage = `❌ Ошибка: ${icon.type}`;

        if (e?.status === 404) {
          errorMessage += ' - Файл не существует (404)';
          console.warn(`Icon file not found: ${icon.type}.svg`);
        } else if (e?.status === 0) {
          errorMessage += ' - Ошибка сети';
        } else if (e?.message) {
          errorMessage += ` - ${e.message}`;
        }

        this.addBatchLog(errorMessage, 'error');
        this.batchCurrent.set(i + 1);
        this.batchProgress.set(Math.round(((i + 1) / icons.length) * 100));
      }
    }

    this.addBatchLog(`Массовая обработка (${type}) завершена!`, 'success');
    setTimeout(() => this.isBatchProcessing.set(false), 2000);
  }

  private isRedundantTransform(val: string): boolean {
    const clean = val.replace(/\s+/g, '').toLowerCase();
    return [
      'matrix(1,0,0,1,0,0)',
      'matrix(100100)',
      'translate(0,0)',
      'translate(0)',
      'scale(1)',
      'scale(1,1)',
    ].includes(clean);
  }

  private convertColorToHex(color: string): string {
    if (!color || color === 'none' || color === 'inherit' || color.startsWith('url')) return color;

    // Use a cached or temporary element to convert color to hex via browser's engine
    // This is most reliable for rgb(), rgba(), named colors, etc.
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return color;
    ctx.fillStyle = color;
    let computed = ctx.fillStyle; // Usually #rrggbb

    // Shorten if possible
    if (computed.startsWith('#') && computed.length === 7) {
      if (
        computed[1] === computed[2] &&
        computed[3] === computed[4] &&
        computed[5] === computed[6]
      ) {
        return '#' + computed[1] + computed[3] + computed[5];
      }
    }
    return computed;
  }

  private internalOptimize(raw: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return raw;

    // 1. Color Analysis: Detect if the icon is multicolor
    // ИСПРАВЛЕНИЕ: Учитываем цвета как из атрибутов, так и из inline-стилей
    const activeColors = new Set<string>();
    const graphicElements = svg.querySelectorAll(
      'path, circle, rect, ellipse, line, polyline, polygon',
    );

    graphicElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Проверяем и атрибут, и стиль
      const fill = el.getAttribute('fill') || htmlEl.style.fill;
      const stroke = el.getAttribute('stroke') || htmlEl.style.stroke;

      if (fill && fill !== 'none' && fill !== 'inherit' && !fill.startsWith('url'))
        activeColors.add(fill.toLowerCase());
      if (stroke && stroke !== 'none' && stroke !== 'inherit' && !stroke.startsWith('url'))
        activeColors.add(stroke.toLowerCase());
    });

    // Monochrome if 0 or 1 unique colors (excluding none/inherit/url)
    const isMonochrome = activeColors.size <= 1;

    // 2. Clean ROOT <svg> attributes
    const attributesToRemove = [
      'id',
      'class',
      'version',
      'x',
      'y',
      'xml:space',
      'style',
      'xmlns:xlink',
    ];
    attributesToRemove.forEach((attr) => svg.removeAttribute(attr));

    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // 3. Clean elements
    svg.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;

      // a. Transplant styles to attributes
      const styleFill = htmlEl.style.fill;
      const styleStroke = htmlEl.style.stroke;

      if (styleFill && !el.hasAttribute('fill')) el.setAttribute('fill', styleFill);
      if (styleStroke && !el.hasAttribute('stroke')) el.setAttribute('stroke', styleStroke);

      // b. Convert colors to HEX
      if (el.hasAttribute('fill'))
        el.setAttribute('fill', this.convertColorToHex(el.getAttribute('fill')!));
      if (el.hasAttribute('stroke'))
        el.setAttribute('stroke', this.convertColorToHex(el.getAttribute('stroke')!));

      // c. Remove garbage attributes
      el.removeAttribute('id');
      el.removeAttribute('class');
      el.removeAttribute('style');

      // d. Conditional Stroke Cleanup
      const stroke = el.getAttribute('stroke');
      if (!stroke || stroke === 'none') {
        [
          'stroke-width',
          'stroke-linecap',
          'stroke-linejoin',
          'stroke-miterlimit',
          'stroke-dasharray',
          'stroke-dashoffset',
        ].forEach((attr) => el.removeAttribute(attr));
      }

      // e. Transform Cleanup
      const transform = el.getAttribute('transform');
      if (transform && this.isRedundantTransform(transform)) {
        el.removeAttribute('transform');
      }

      // f. Apply Monochrome logic
      if (isMonochrome) {
        const fill = el.getAttribute('fill');
        const strk = el.getAttribute('stroke');
        if (fill && fill !== 'none' && !fill.startsWith('url'))
          el.setAttribute('fill', 'currentColor');
        if (strk && strk !== 'none' && !strk.startsWith('url'))
          el.setAttribute('stroke', 'currentColor');
      }
    });

    // 4. Regex & Serialization Cleanup
    let serialized = new XMLSerializer().serializeToString(svg);

    // Remove declarations
    serialized = serialized.replace(/<\?xml.*?\?>/gi, '');
    serialized = serialized.replace(/<!DOCTYPE[^>]*>/gi, '');
    serialized = serialized.replace(/<!--[\s\S]*?-->/g, '');

    // Coordinate Rounding: Round numbers to 2 decimal places and remove trailing zeros
    serialized = serialized.replace(/(\d+\.\d{2,})/g, (m) =>
      parseFloat(m)
        .toFixed(2)
        .replace(/\.?0+$/, ''),
    );

    return serialized.trim();
  }

  private internalNormalize(raw: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return raw;

    let vb = svg.getAttribute('viewBox');
    let w = parseFloat(svg.getAttribute('width') || '0');
    let h = parseFloat(svg.getAttribute('height') || '0');
    let minX = 0,
      minY = 0,
      width = 0,
      height = 0;

    if (vb) {
      [minX, minY, width, height] = vb.split(/[\s,]+/).map(parseFloat);
    } else if (w && h) {
      width = w;
      height = h;
    } else return raw;

    const children = Array.from(svg.childNodes);
    const containerTags = ['defs', 'mask', 'clippath', 'style', 'title', 'desc', 'metadata'];
    const graphicNodes: Node[] = [];
    const containerNodes: Node[] = [];

    children.forEach((node) => {
      if (node.nodeType === 1) {
        const tag = (node as Element).tagName.toLowerCase();
        if (containerTags.includes(tag)) containerNodes.push(node);
        else graphicNodes.push(node);
      } else containerNodes.push(node);
    });

    const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    const scale = Math.min(24 / width, 24 / height);

    graphicNodes.forEach((node) => {
      if (node.nodeType === 1) {
        const el = node as Element;
        if (el.hasAttribute('stroke') || el.getAttribute('stroke-width'))
          el.setAttribute('vector-effect', 'non-scaling-stroke');
        el.querySelectorAll('[stroke], [stroke-width]').forEach((child) =>
          child.setAttribute('vector-effect', 'non-scaling-stroke'),
        );
      }
      group.appendChild(node);
    });

    group.setAttribute('transform', `scale(${scale.toFixed(4)}) translate(${-minX}, ${-minY})`);
    svg.innerHTML = '';
    containerNodes.forEach((node) => svg.appendChild(node));
    svg.appendChild(group);

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    return new XMLSerializer().serializeToString(doc);
  }

  private addBatchLog(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    this.batchLog.update((prev) => [...prev, `[${timestamp}] ${msg}`]);
  }

  copyBatchLog() {
    const log = this.batchLog().join('\n');
    navigator.clipboard.writeText(log);
    this.showToast('Лог скопирован в буфер обмена!');
  }

  clearBatchLog() {
    this.batchLog.set([]);
    this.showToast('Лог сессии очищен');
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  // --- Move Icon Logic ---
  openMoveModal(icon: IconMetadata) {
    this.moveIconSelected.set(icon);
    this.currentCategoryName.set(icon.category || 'Без категории');

    // Пытаемся найти ID текущей категории для предзаполнения
    const currentCat = this.dbCategories().find((c) => c.displayName === icon.category);
    this.targetCategoryId.set(currentCat?.id || null);

    this.isMoveModalOpen.set(true);
  }

  handleMoveCancel() {
    this.isMoveModalOpen.set(false);
    this.moveIconSelected.set(null);
  }

  confirmMove() {
    const icon = this.moveIconSelected();
    const targetId = this.targetCategoryId();

    if (!icon || !targetId) {
      this.message.warning('Выберите целевую категорию');
      return;
    }

    console.log(`[IconManager] 🚀 confirmMove: Icon=${icon.type}, TargetId=${targetId}`);
    this.isMoving.set(true);

    this.iconDataService.moveIcon(icon.type, targetId).subscribe({
      next: (res: any) => {
        console.log('[IconManager] ✅ Move response:', res);
        this.message.success(res.message || 'Иконка успешно перемещена');
        this.isMoving.set(false);
        this.isMoveModalOpen.set(false);
        this.globalIconService.clearCache();
        this.loadIcons(true); // Force reload after move
      },
      error: (err: any) => {
        console.error('[IconManager] ❌ Move error:', err);
        this.message.error(err.error?.message || 'Ошибка перемещения');
        this.isMoving.set(false);
      },
    });
  }

  // --- Rename Icon Logic ---
  startEditName() {
    const icon = this.selectedIcon();
    if (!icon) return;

    this.isEditingName.set(true);
    this.editedName.set(icon.name);
    this.nameError.set(null);
  }

  cancelEditName() {
    this.isEditingName.set(false);
    this.editedName.set('');
    this.nameError.set(null);
  }

  private validateName(name: string): boolean {
    const icon = this.selectedIcon();
    if (!icon) return false;

    // Пустое имя
    if (!name || name.trim() === '') {
      this.nameError.set('Имя не может быть пустым');
      return false;
    }

    // Формат: только a-z, 0-9, _
    if (!/^[a-z0-9_]+$/.test(name)) {
      this.nameError.set('Используйте только a-z, 0-9, _');
      return false;
    }

    // Длина
    if (name.length > 500) {
      this.nameError.set('Имя не может быть длиннее 500 символов');
      return false;
    }

    // Без изменений
    if (name === icon.name) {
      this.nameError.set('Имя не изменилось');
      return false;
    }

    return true;
  }

  saveNewName() {
    const icon = this.selectedIcon();
    if (!icon) return;

    const newName = this.editedName().trim();

    // Валидация на frontend
    if (!this.validateName(newName)) {
      return;
    }

    this.isRenamingInProgress.set(true);
    this.nameError.set(null);

    this.iconDataService.renameIcon(icon.name, newName).subscribe({
      next: () => {
        // Обновить локальное состояние
        const updatedIcon = { ...icon, name: newName, type: `${icon.category}/${newName}` };
        this.selectedIcon.set(updatedIcon);

        // Закрыть режим редактирования
        this.isEditingName.set(false);

        // Показать уведомление
        this.message.success(`✅ Иконка переименована: ${icon.name} → ${newName}`);

        // Обновить кеш и список
        this.globalIconService.clearCache();
        this.loadIcons(true);

        this.isRenamingInProgress.set(false);
      },
      error: (err: Error) => {
        this.nameError.set(err.message);
        this.isRenamingInProgress.set(false);
      },
    });
  }

  onNameDoubleClick() {
    if (!this.isEditingName()) {
      this.startEditName();
    }
  }

  onNameKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.saveNewName();
    } else if (event.key === 'Escape') {
      this.cancelEditName();
    }
  }
}
