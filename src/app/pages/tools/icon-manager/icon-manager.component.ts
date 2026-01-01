import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoints } from '../../../../environments/api-endpoints';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { IconDataService } from '../../../shared/services/icon-data.service';
import { IconMetadata } from '../../ui-demo/old-control/icon-ui/icon-metadata.model';
import { ICON_REGISTRY, IconCategory } from '../../ui-demo/old-control/icon-ui/icon-registry';

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
                <av-icon type="folder_icon-icons.com_70963" [size]="18"></av-icon>
                <span>{{ cat.category }}</span>
                <span class="count">{{ cat.icons.length }}</span>
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
              <div class="meta-item">
                <span class="label">Название</span>
                <span class="value">{{ icon.name }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Путь</span>
                <span class="value">{{ icon.type }}.svg</span>
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
            <nz-tabset>
              <nz-tab nzTitle="Исходный код">
                <div class="code-editor-wrapper">
                  <textarea readonly>{{ rawSvgCode() }}</textarea>
                </div>
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
              <nz-tab nzTitle="Оптимизированный код">
                <div class="code-editor-wrapper">
                  <textarea readonly>{{ cleanedSvgCode() }}</textarea>
                </div>
              </nz-tab>
              <nz-tab nzTitle="Синхронизация">
                <div class="sync-tab-content">
                  <div class="sync-info-banner">
                    <av-icon type="system/av_info" [size]="16"></av-icon>
                    <span>Выберите целевое назначение для синхронизации текущих изменений</span>
                  </div>

                  <div class="sync-actions-list">
                    <button class="sync-action-btn primary" (click)="granularSync(true, true)">
                      <div class="btn-icon">
                        <av-icon type="actions/av_save" [size]="20"></av-icon>
                        <div class="plus-badge">+</div>
                      </div>
                      <div class="btn-text">
                        <span class="title">Сервер + Клиент</span>
                        <span class="desc">Полная синхронизация (Master + Assets)</span>
                      </div>
                    </button>

                    <button class="sync-action-btn" (click)="granularSync(true, false)">
                      <div class="btn-icon">
                        <av-icon type="system/av_cog" [size]="20"></av-icon>
                      </div>
                      <div class="btn-text">
                        <span class="title">Только на Сервер</span>
                        <span class="desc">Сохранить только в Master хранилище</span>
                      </div>
                    </button>

                    <button class="sync-action-btn" (click)="granularSync(false, true)">
                      <div class="btn-icon">
                        <av-icon type="actions/av_upload" [size]="20"></av-icon>
                      </div>
                      <div class="btn-text">
                        <span class="title">Только на Клиент</span>
                        <span class="desc">Обновить только ассеты фронтенда</span>
                      </div>
                    </button>
                  </div>
                </div>
              </nz-tab>
            </nz-tabset>

            <!-- Actions Footer -->
            <div class="editor-footer">
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
              <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
                <label style="font-size: 13px; font-weight: 600;">Область обработки:</label>
                <button
                  [class.btn-primary]="batchMode() === 'all'"
                  [class.btn-outline]="batchMode() !== 'all'"
                  style="padding: 4px 12px; height: 32px;"
                  (click)="batchMode.set('all')"
                >
                  Вся библиотека ({{ totalIcons() }})
                </button>
                <button
                  [class.btn-primary]="batchMode() === 'filtered'"
                  [class.btn-outline]="batchMode() !== 'filtered'"
                  style="padding: 4px 12px; height: 32px;"
                  (click)="batchMode.set('filtered')"
                >
                  Отфильтрованные ({{ filteredIcons().length }})
                </button>
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
                <button
                  class="btn-outline"
                  [style.height]="'24px'"
                  [style.padding]="'0 8px'"
                  [style.font-size]="'10px'"
                  [style.border-radius]="'6px'"
                  (click)="copyBatchLog()"
                >
                  <av-icon type="actions/av_save" [size]="10" style="margin-right: 4px;"></av-icon>
                  Копировать лог
                </button>
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
                <nz-option nzValue="general" nzLabel="Общие"></nz-option>
                <nz-option nzValue="actions" nzLabel="Действия"></nz-option>
                <nz-option nzValue="arrows" nzLabel="Стрелки"></nz-option>
                <nz-option nzValue="charts" nzLabel="Графики"></nz-option>
                <nz-option nzValue="communication" nzLabel="Коммуникация"></nz-option>
                <nz-option nzValue="editor" nzLabel="Редактор"></nz-option>
                <nz-option nzValue="files" nzLabel="Файлы"></nz-option>
                <nz-option nzValue="media" nzLabel="Медиа"></nz-option>
                <nz-option nzValue="settings" nzLabel="Настройки"></nz-option>
                <nz-option nzValue="system" nzLabel="Система"></nz-option>
                <nz-option nzValue="time" nzLabel="Время"></nz-option>
                <nz-option nzValue="user" nzLabel="Пользователь"></nz-option>
              </nz-select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Файл SVG</label>
              <input type="file" (change)="handleFileUpload($event)" accept=".svg" />
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
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        background: #f1f5f9;
        padding: 16px;
        border-radius: 12px;
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
        margin-top: 12px;
      }

      .code-editor-wrapper textarea {
        width: 100%;
        height: 250px;
        background: #1e293b;
        color: #cbd5e1;
        border-radius: 12px;
        padding: 16px;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.6;
        border: none;
        resize: none;
        outline: none;
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
    `,
  ],
})
export class IconManagerComponent {
  private http = inject(HttpClient);
  private iconDataService = inject(IconDataService);
  private message = inject(NzMessageService);
  private sanitizer = inject(DomSanitizer);

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
  isBatchProcessing = signal(false);
  batchProgress = signal(0);
  batchLog = signal<string[]>([]);
  batchTotal = signal(0);
  batchCurrent = signal(0);
  batchCurrentName = signal('');
  batchMode = signal<'all' | 'filtered'>('all');
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
  uploadFileContent = signal<string | null>(null);

  // Technical Passport Signals
  iconPassport = signal<{
    originalWidth: string;
    originalHeight: string;
    viewBox: string;
    isStandard: boolean;
    pathCount: number;
    hasCurrentColor: boolean;
  } | null>(null);

  // Static/Computed Data
  categories = signal<IconCategory[]>([]);

  constructor() {
    this.loadIcons();
  }

  private loadIcons(force: boolean = false) {
    console.log(`[IconManager] 🛠️ loadIcons(force=${force}) started...`);
    this.isLoading.set(true);
    this.iconDataService.getIcons(force).subscribe({
      next: (data) => {
        console.log(`[IconManager] 📦 Data received in component: ${data.length} categories`);
        const sorted = [...data].sort((a, b) => {
          if (a.category === 'Другие') return 1;
          if (b.category === 'Другие') return -1;
          return a.category.localeCompare(b.category);
        });
        this.categories.set(sorted);
        this.dataSource.set('backend');
        this.isLoading.set(false);
        console.log('[IconManager] 🏁 UI Refresh complete.');
      },
      error: (err: unknown) => {
        console.error('[IconManager] ❌ Failed to load icons', err);
        // Fallback to registry if API fails
        this.categories.set([...ICON_REGISTRY]);
        this.dataSource.set('local');
        this.isLoading.set(false);
        this.message.warning('Используется локальная библиотека иконок (бэкенд недоступен)');
      },
    });
  }

  syncToLocal() {
    this.isSyncing.set(true);
    console.log('[IconManager] 🔄 syncToLocal started...');
    this.http.post(ApiEndpoints.ICONS.SYNC_TO_LOCAL, {}).subscribe({
      next: () => {
        console.log('[IconManager] ✅ Sync to local success. Triggering force reload...');
        this.message.success('✅ Библиотека иконок успешно синхронизирована с фронтендом!');
        this.isSyncing.set(false);
        this.loadIcons(true); // Force reload after sync
      },
      error: (err: unknown) => {
        console.error('[IconManager] ❌ Sync failed', err);
        this.message.error('❌ Ошибка синхронизации иконок');
        this.isSyncing.set(false);
      },
    });
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
    const code = this.cleanedSvgCode();
    if (!code) return '';
    return this.sanitizer.bypassSecurityTrustHtml(code);
  });

  onSearchChange(val: string) {
    this.searchQuery.set(val);
  }

  // Editor Actions
  openEditor(icon: any) {
    this.selectedIcon.set(icon);
    this.cleanedSvgCode.set('');
    this.rawSvgCode.set('Загрузка кода...');
    this.isEditorOpen.set(true);

    // Reset enrichment
    this.metaTitle.set('');
    this.metaDesc.set('');
    this.metaAuthor.set('Aurora Studio');
    this.metaDataKey.set('data-icon-id');
    this.metaDataValue.set(icon.name);

    // Load actual SVG file
    const path = `assets/icons/${icon.type}.svg`;
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (code) => {
        this.rawSvgCode.set(code);
        this.generatePassport(code);
      },
      error: (err) => {
        let errorMsg = 'Ошибка загрузки SVG.';

        if (err?.status === 404) {
          errorMsg = `⚠️ Файл не найден: ${icon.type}.svg\n\nФайл может быть:\n- Удалён из assets/icons\n- Переименован\n- Указан неверный путь в реестре`;
          console.error(`Icon file not found: ${path}`, err);
        } else if (err?.status === 0) {
          errorMsg = '⚠️ Ошибка сети. Проверьте подключение.';
        } else if (err?.message) {
          errorMsg = `⚠️ Ошибка: ${err.message}`;
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
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) throw new Error('Invalid SVG');

      // 1. Get current viewBox or dimensions
      let vb = svg.getAttribute('viewBox');
      let w = parseFloat(svg.getAttribute('width') || '0');
      let h = parseFloat(svg.getAttribute('height') || '0');

      let minX = 0,
        minY = 0,
        width = 0,
        height = 0;

      if (vb) {
        const parts = vb.split(/[\s,]+/).map(parseFloat);
        [minX, minY, width, height] = parts;
      } else if (w && h) {
        width = w;
        height = h;
      } else {
        throw new Error('Could not determine original scale');
      }

      // 2. Wrap all content into a group for scaling
      const children = Array.from(svg.childNodes);
      const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Calculate scale to fit into 24x24
      const scaleX = 24 / width;
      const scaleY = 24 / height;
      const scale = Math.min(scaleX, scaleY);

      // Move children to group
      children.forEach((child) => group.appendChild(child));

      // Apply transform to center and scale
      // Offset by -minX/-minY to start from 0, then scale
      group.setAttribute('transform', `scale(${scale.toFixed(4)}) translate(${-minX}, ${-minY})`);

      // Clear SVG and add normalized group
      svg.innerHTML = '';
      svg.appendChild(group);

      // 3. Set standard attributes
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.removeAttribute('width');
      svg.removeAttribute('height');

      const normalized = new XMLSerializer().serializeToString(doc);
      this.cleanedSvgCode.set(normalized);
      this.generatePassport(normalized); // Update passport data
      this.showToast('Иконка успешно масштабирована до стандарта 24x24!');
    } catch (e) {
      console.error(e);
      this.showToast('Ошибка при нормализации.');
    }
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
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const svg = doc.querySelector('svg');

      if (!svg) throw new Error('Invalid SVG');

      // 1. Root-level cleanup
      const attributesToRemove = [
        'width',
        'height',
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

      // 2. Remove comments and processing instructions
      const iterator = doc.createNodeIterator(
        doc,
        NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_PROCESSING_INSTRUCTION,
      );
      let node;
      while ((node = iterator.nextNode())) {
        node.parentNode?.removeChild(node);
      }

      // 3. Recursive cleanup for all child elements
      const all = svg.querySelectorAll('*');
      all.forEach((el) => {
        // Remove common junk attributes
        el.removeAttribute('id');
        el.removeAttribute('class');
        el.removeAttribute('style');

        // Clean namespaces and meta attributes (often from AI/Figma)
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          if (
            attr.name.startsWith('inkscape:') ||
            attr.name.startsWith('sodipodi:') ||
            attr.name.startsWith('adobe:')
          ) {
            el.removeAttribute(attr.name);
          }
        }

        // Inject currentColor for managed fills/strokes
        if (el.hasAttribute('fill')) {
          const fill = el.getAttribute('fill');
          if (fill && fill !== 'none' && fill !== 'currentColor') {
            el.setAttribute('fill', 'currentColor');
          }
        } else if (!el.hasAttribute('stroke')) {
          // If no fill and no stroke, assume it's a fill path that needs currentColor
          el.setAttribute('fill', 'currentColor');
        }

        if (el.hasAttribute('stroke')) {
          const stroke = el.getAttribute('stroke');
          if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
            el.setAttribute('stroke', 'currentColor');
          }
        }
      });

      // 4. Serialize and final string cleanup
      let cleaned = new XMLSerializer().serializeToString(doc);

      // Remove any remaining XML declarations if serialization added them
      cleaned = cleaned.replace(/<\?xml.*\?>/g, '').trim();

      this.cleanedSvgCode.set(cleaned);
      this.showToast('Оптимизация завершена! Код очищен и внедрен currentColor.');
    } catch (e) {
      this.showToast('Не удалось разобрать SVG для оптимизации.');
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
    this.uploadFileContent.set(null);
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadName.set(file.name.replace('.svg', ''));
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadFileContent.set(e.target.result);
      };
      reader.readAsText(file);
    }
  }

  confirmUpload() {
    const name = this.uploadName();
    const category = this.uploadCategory();
    const content = this.uploadFileContent();

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
          this.syncToLocal(); // Auto-sync after upload
        },
        error: (err) => {
          console.error('[IconManager] ❌ Upload failed', err);
          this.showToast('❌ Ошибка при загрузке иконки');
        },
      });
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

  copySvg(type: string) {
    const path = `assets/icons/${type}.svg`;
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (code) => {
        navigator.clipboard.writeText(code);
        this.showToast('Чистый SVG код скопирован!');
      },
      error: () => this.showToast('❌ Ошибка загрузки SVG для копирования'),
    });
  }

  // Batch Operations
  async startBatchProcess(type: 'optimize' | 'normalize' | 'replace' | 'metadata') {
    const icons =
      this.batchMode() === 'all'
        ? this.categories().flatMap((c: IconCategory) => c.icons)
        : this.filteredIcons();

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
        let path = `assets/icons/${icon.type}.svg`;
        if (!icon.type.includes('/')) {
          // If no slash, maybe it's in folders? No, we should prefer the full path from type
        }

        const code = await firstValueFrom(this.http.get(path, { responseType: 'text' }));

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

        // In a real app we'd send to backend here
        // For now we simulate success
        this.batchCurrent.set(i + 1);
        this.batchProgress.set(Math.round(((i + 1) / icons.length) * 100));
        this.addBatchLog(`✅ Обработано: ${icon.type}`, 'success');
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

  private internalOptimize(raw: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return raw;

    const attributesToRemove = [
      'width',
      'height',
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

    svg.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('id');
      el.removeAttribute('class');
      el.removeAttribute('style');
      if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none')
        el.setAttribute('fill', 'currentColor');
      if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none')
        el.setAttribute('stroke', 'currentColor');
    });

    return new XMLSerializer().serializeToString(doc);
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
    const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    const scale = Math.min(24 / width, 24 / height);
    children.forEach((child) => group.appendChild(child));
    group.setAttribute('transform', `scale(${scale.toFixed(4)}) translate(${-minX}, ${-minY})`);

    svg.innerHTML = '';
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

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
