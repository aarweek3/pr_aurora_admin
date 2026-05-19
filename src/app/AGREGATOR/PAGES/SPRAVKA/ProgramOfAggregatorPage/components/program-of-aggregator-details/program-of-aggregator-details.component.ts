import { CommonModule } from '@angular/common';
import { Component, Input, inject, OnInit } from '@angular/core';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { FormsModule } from '@angular/forms';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { ProgramOfAggregatorDetail } from '../../models/program-of-aggregator.model';
import { CategoryOfAggregatorApiService } from '../../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { DeveloperOfAggregatorApiService } from '../../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorApiService } from '../../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';

@Component({
  selector: 'app-program-of-aggregator-details',
  standalone: true,
  imports: [
    CommonModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzTagModule,
    NzCollapseModule,
    NzIconModule,
    NzImageModule,
    NzDividerModule,
    NzGridModule,
    NzBadgeModule,
    NzSegmentedModule,
    FormsModule,
  ],
  template: `
    <div class="details-wrapper" *ngIf="data">
      <!-- Глобальный переключатель языка в самом верху -->
      <div class="global-lang-selector">
        <span class="selector-label">Выберите язык контента:</span>
        <nz-segmented
          [nzOptions]="langOptions"
          [(ngModel)]="activeLangIndex"
          (ngModelChange)="onLangChange($event)"
          class="premium-segmented"
        >
        </nz-segmented>
      </div>

      <nz-tabset nzType="line" class="main-tabs" nzSize="large">
        <!-- 1. ОСНОВНЫЕ СВЕДЕНИЯ -->
        <nz-tab nzTitle="Основные сведения">
          <ng-template nz-tab>
            <div class="tab-content scrollable">
              <nz-descriptions [nzColumn]="1" nzBordered nzSize="small">
                <nz-descriptions-item nzTitle="ID"
                  ><b>{{ data.id }}</b></nz-descriptions-item
                >
                <nz-descriptions-item nzTitle="Slug"
                  ><code>{{ data.slug }}</code></nz-descriptions-item
                >
                <nz-descriptions-item nzTitle="Каноническое имя">{{
                  data.canonicalName
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Разработчик">{{
                  getDeveloperName(data.developerOfAggregatorId)
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Официальный сайт">
                  <a
                    *ngIf="data.website"
                    [href]="data.website"
                    target="_blank"
                    class="premium-link"
                  >
                    <i nz-icon nzType="global"></i> {{ data.website }}
                  </a>
                  <span *ngIf="!data.website" class="empty-text">—</span>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Основная платформа">{{
                  getPlatformName(data.mainPlatformId)
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Поддерживаемые платформы">
                  <nz-tag *ngFor="let pid of data.platformIds" nzColor="blue">{{
                    getPlatformName(pid)
                  }}</nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Категория (Tree)">{{
                  getCategoryName(data.categoryOfAggregatorId)
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Мастер-категория (V2)">{{
                  data.simplifiedCategoryName || '—'
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Подкатегория (V2)">{{
                  data.simplifiedSubcategoryName || '—'
                }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Теги">
                  <div class="tags-cloud">
                    <nz-tag
                      *ngFor="let tag of data.tags"
                      [nzColor]="tag.color && tag.color !== 'inherit' ? tag.color : 'blue'"
                      class="premium-tag"
                    >
                      <i nz-icon nzType="tag"></i> {{ tag.name }}
                    </nz-tag>
                    <span *ngIf="!data.tags.length" class="empty-text">Теги отсутствуют</span>
                  </div>
                </nz-descriptions-item>
              </nz-descriptions>
            </div>
          </ng-template>
        </nz-tab>

        <!-- 2. МЕДИА -->
        <nz-tab nzTitle="Медиа">
          <ng-template nz-tab>
            <div class="tab-content scrollable">
              <nz-divider nzText="ГЛАВНАЯ ИКОНКА" nzOrientation="left"></nz-divider>
              <div class="icon-section">
                <div class="media-preview-box">
                  <img
                    [src]="imgService.getAssetUrl(data.iconPath)"
                    (error)="imgService.handleError($event)"
                    class="main-icon-img"
                  />
                </div>
                <div class="icon-details">
                  <div class="label">Путь к файлу:</div>
                  <div class="path-code">{{ data.iconPath || 'не задан' }}</div>
                </div>
              </div>

              <nz-divider nzText="ГАЛЕРЕЯ СКРИНШОТОВ" nzOrientation="left"></nz-divider>
              <div class="screenshots-container">
                <div
                  *ngIf="
                    getScreenshotsForLang(activeLocalization?.languageOfAggregatorId || null)
                      .length > 0;
                    else noScreens
                  "
                >
                  <nz-image-group>
                    <div class="screenshot-grid">
                      <div
                        class="screenshot-card"
                        *ngFor="
                          let scr of getScreenshotsForLang(
                            activeLocalization?.languageOfAggregatorId || null
                          )
                        "
                      >
                        <img
                          nz-image
                          [nzSrc]="imgService.getAssetUrl(scr.filePath)"
                          (error)="imgService.handleError($event)"
                          [alt]="getScreenshotAltText(scr, activeLocalization?.languageOfAggregatorId || null) || 'Скриншот'"
                        />
                        <div class="card-footer">
                           <div class="scr-title" [title]="getScreenshotTitle(scr, activeLocalization?.languageOfAggregatorId || null)">
                             {{ getScreenshotTitle(scr, activeLocalization?.languageOfAggregatorId || null) || 'Без описания' }}
                           </div>
                           <div class="scr-alt" [title]="getScreenshotAltText(scr, activeLocalization?.languageOfAggregatorId || null)">
                             Alt: {{ getScreenshotAltText(scr, activeLocalization?.languageOfAggregatorId || null) || '—' }}
                           </div>
                           <div class="scr-order">Порядок: {{ scr.sortOrder }}</div>
                        </div>
                      </div>
                    </div>
                  </nz-image-group>
                </div>
                <ng-template #noScreens>
                  <div class="no-data-hint placeholder-wrapper">
                    <img
                      [src]="
                        imgService
                          .getPlaceholder()
                          .replace('placeholder-program', 'placeholder-screenshot')
                      "
                      class="screenshot-placeholder-img"
                    />
                    <div style="margin-top: 16px;">Скриншоты для выбранного языка не найдены</div>
                  </div>
                </ng-template>
              </div>
            </div>
          </ng-template>
        </nz-tab>

        <!-- 3. МЕТАДАННЫЕ -->
        <nz-tab nzTitle="Метаданные">
          <ng-template nz-tab>
            <div class="tab-content scrollable">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-item">
                    <i nz-icon nzType="download" style="color: #3b82f6; font-size: 24px;"></i>
                    <div>
                      <div class="stat-value">{{ data.totalDownloads | number }}</div>
                      <div class="stat-label">Загрузок</div>
                    </div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-item">
                    <i
                      nz-icon
                      nzType="star"
                      [nzTheme]="'fill'"
                      style="color: #f59e0b; font-size: 24px;"
                    ></i>
                    <div>
                      <div class="stat-value">{{ data.averageRating }}</div>
                      <div class="stat-label">Рейтинг</div>
                    </div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-item">
                    <i nz-icon nzType="sort-ascending" style="color: #10b981; font-size: 24px;"></i>
                    <div>
                      <div class="stat-value">{{ data.sortOrder }}</div>
                      <div class="stat-label">Порядок</div>
                    </div>
                  </div>
                </div>
              </div>

              <nz-descriptions [nzColumn]="1" nzBordered nzSize="small" style="margin-top: 24px;">
                <nz-descriptions-item nzTitle="Статус">
                  <nz-badge
                    [nzStatus]="getStatusColor(data.isActive)"
                    [nzText]="data.isActive ? 'Активен' : 'Отключен'"
                  ></nz-badge>
                </nz-descriptions-item>
                <!-- Даты создания/обновления доступны только в списке (Item), в Detail их сейчас нет -->
              </nz-descriptions>
            </div>
          </ng-template>
        </nz-tab>

        <!-- 4. ЛОКАЛИЗАЦИЯ & SEO -->
        <nz-tab nzTitle="Локализация & SEO">
          <ng-template nz-tab>
            <div class="tab-content scrollable">
              <div *ngIf="activeLocalization; else noLoc" class="loc-sub-content">
                <nz-descriptions [nzColumn]="1" nzBordered nzSize="small">
                  <nz-descriptions-item nzTitle="Локализованное название">
                    <b style="font-size: 16px;">{{ activeLocalization.name }}</b>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Краткое описание">
                    <div class="description-box">{{ activeLocalization.shortDescription }}</div>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Полное описание">
                    <div class="description-box full">{{ activeLocalization.fullDescription }}</div>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Особенности">
                    <div nz-row [nzGutter]="16">
                      <div nz-col [nzSpan]="12">
                        <div class="pros-cons-box pros">
                          <div class="pc-title"><i nz-icon nzType="check-circle"></i> ПЛЮСЫ</div>
                          <div class="pc-text">{{ activeLocalization.pros || '—' }}</div>
                        </div>
                      </div>
                      <div nz-col [nzSpan]="12">
                        <div class="pros-cons-box cons">
                          <div class="pc-title"><i nz-icon nzType="close-circle"></i> МИНУСЫ</div>
                          <div class="pc-text">{{ activeLocalization.cons || '—' }}</div>
                        </div>
                      </div>
                    </div>
                  </nz-descriptions-item>
                </nz-descriptions>

                <nz-collapse nzGhost style="margin-top: 16px;">
                  <nz-collapse-panel nzHeader="SEO МЕТА-ДАННЫЕ" [nzActive]="false">
                    <nz-descriptions [nzColumn]="1" nzBordered nzSize="small">
                      <nz-descriptions-item nzTitle="SEO Title">{{
                        activeLocalization.metaTitle || '—'
                      }}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="SEO Description">{{
                        activeLocalization.metaDescription || '—'
                      }}</nz-descriptions-item>
                    </nz-descriptions>
                  </nz-collapse-panel>
                </nz-collapse>
              </div>
              <ng-template #noLoc>
                <div class="no-data-hint">Локализация для выбранного языка отсутствует.</div>
              </ng-template>
            </div>
          </ng-template>
        </nz-tab>

        <!-- 5. ВЕРСИИ -->
        <nz-tab nzTitle="Версии">
          <ng-template nz-tab>
            <div class="tab-content scrollable">
              <div class="versions-header">
                <div class="stat-item">
                  <span class="stat-label">Всего версий: </span>
                  <span class="stat-value" style="margin-left: 8px;">{{
                    data.versions.length
                  }}</span>
                </div>
              </div>

              <div *ngIf="data.versions.length; else noVersions" class="versions-list">
                <div
                  class="version-card"
                  *ngFor="let v of sortedVersions"
                  style="margin-bottom: 16px;"
                >
                  <div class="v-header">
                    <span class="v-num">v{{ v.versionNumber }}</span>
                    <nz-tag *ngIf="v.isLatest" nzColor="gold">LATEST</nz-tag>
                    <span class="v-date">{{ v.releasedAt | date: 'dd.MM.yyyy' }}</span>
                  </div>

                  <div class="changelog-section" *ngIf="v.localizations?.length">
                    <div *ngFor="let cl of v.localizations">
                      <div
                        *ngIf="
                          cl.languageOfAggregatorId === activeLocalization?.languageOfAggregatorId
                        "
                      >
                        <div class="changelog-p">{{ cl.changelog }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="v-footer">
                    <div class="download-link" *ngFor="let link of v.downloadLinks">
                      <i nz-icon nzType="download"></i>
                      <a [href]="link.url" target="_blank">{{ link.url }}</a>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noVersions>
                <div class="no-data-hint">Версии еще не добавлены.</div>
              </ng-template>
            </div>
          </ng-template>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .details-wrapper {
        padding: 4px;
      }
      .global-lang-selector {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        margin: -24px -24px 16px -24px;
      }
      .selector-label {
        font-weight: 600;
        color: #475569;
        font-size: 13px;
      }
      .premium-segmented {
        font-weight: 500;
      }
      .tab-content {
        padding: 16px 0;
      }
      .id-badge {
        font-size: 10px;
        color: #94a3b8;
        background: #f1f5f9;
        padding: 1px 4px;
        border-radius: 4px;
        margin-left: 4px;
      }
      .link-with-icon {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #3b82f6;
        &:hover {
          text-decoration: underline;
        }
      }
      /* Icon Section */
      .icon-section {
        display: flex;
        gap: 24px;
        align-items: center;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .media-preview-box {
        width: 80px;
        height: 80px;
        background: #fff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .main-icon-img {
        max-width: 50px;
        max-height: 50px;
        object-fit: contain;
      }
      .path-code {
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 4px;
        color: #475569;
        font-family: monospace;
        font-size: 13px;
      }
      .icon-details .label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
      }

      /* Screenshots */
      .screenshot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        padding: 16px 0;
      }
      .screenshot-card {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        background: #fff;
        transition: transform 0.2s;
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
      }
      .screenshot-card img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        cursor: zoom-in;
      }
      .card-footer {
        padding: 8px 12px;
        font-size: 11px;
        background: #f8fafc;
        color: #64748b;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .scr-title {
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .scr-alt {
        color: #94a3b8;
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .scr-order {
        text-align: right;
        font-weight: 500;
        margin-top: 4px;
      }

      /* Stats */
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
      }
      .stat-label {
        font-size: 12px;
        color: #64748b;
        margin-top: 4px;
      }

      /* Localization */
      .loc-sub-content {
        padding: 16px 0;
      }
      .description-box {
        background: #f8fafc;
        padding: 12px 16px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        color: #334155;
        line-height: 1.6;
      }
      .description-box.full {
        min-height: 100px;
        white-space: pre-wrap;
      }

      .pros-cons-box {
        padding: 12px;
        border-radius: 8px;
        height: 100%;
      }
      .pros-cons-box.pros {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        .pc-title {
          color: #166534;
        }
      }
      .pros-cons-box.cons {
        background: #fef2f2;
        border: 1px solid #fecaca;
        .pc-title {
          color: #991b1b;
        }
      }
      .pc-title {
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pc-text {
        font-size: 14px;
        color: #374151;
      }

      /* Versions */
      .versions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 12px 16px;
        background: #f1f5f9;
        border-radius: 8px;
      }
      .version-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      }
      .v-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .v-num {
        font-size: 18px;
        font-weight: 800;
        color: #1e293b;
      }
      .v-date {
        font-size: 13px;
        color: #64748b;
        margin-left: auto;
      }
      .changelog-section {
        margin-bottom: 12px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .lang-tag {
        font-size: 11px;
        font-weight: 700;
        color: #3b82f6;
        text-transform: uppercase;
        margin-right: 8px;
      }
      .changelog-p {
        margin: 4px 0 0 0;
        font-size: 14px;
        color: #334155;
        white-space: pre-wrap;
      }
      .v-footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px dashed #e2e8f0;
      }
      .download-link {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #2563eb;
        margin-bottom: 4px;
        &:hover {
          text-decoration: underline;
        }
      }

      .tags-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .premium-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 10px;
        font-weight: 500;
      }
      .no-data-hint {
        padding: 40px;
        text-align: center;
        color: #94a3b8;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
      }
      .screenshot-placeholder-img {
        width: 120px;
        opacity: 0.5;
      }
      .placeholder-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }

      ::ng-deep .ant-descriptions-item-label {
        background: #f8fafc !important;
        color: #475569 !important;
        font-weight: 600;
        width: 180px;
      }
      ::ng-deep .main-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
    `,
  ],
})
export class ProgramOfAggregatorDetailsComponent implements OnInit {
  public imgService = inject(ImageServiceUniversal);
  private catApi = inject(CategoryOfAggregatorApiService);
  private devApi = inject(DeveloperOfAggregatorApiService);
  private platApi = inject(PlatformOfAggregatorApiService);

  @Input() data: ProgramOfAggregatorDetail | null = null;

  // Логика управления языком
  activeLangIndex = 0;
  langOptions: any[] = [];

  // Локальный кэш названий (ID -> Name)
  private categoryNames = new Map<number, string>();
  private developerNames = new Map<number, string>();
  private platformNames = new Map<number, string>();

  // Множества для отслеживания загружаемых ID (чтобы не спамить запросами)
  private loadingCats = new Set<number>();
  private loadingDevs = new Set<number>();
  private loadingPlats = new Set<number>();

  get activeLocalization() {
    if (!this.data || !this.data.localizations.length) return null;

    return this.data.localizations[this.activeLangIndex];
  }

  ngOnInit(): void {
    if (this.data) {
      // Инициализируем опции для переключателя языков
      if (this.data.localizations.length) {
        this.langOptions = this.data.localizations.map((l, index) => ({
          label: l.languageName || l.languageCode || 'Unknown',
          value: index,
        }));
        // По умолчанию выбираем первый язык
        this.activeLangIndex = 0;
      }

      this.preloadNames();
    }
  }

  onLangChange(index: any): void {
    this.activeLangIndex = index;
  }

  /**
   * Предзагрузка имен для текущего объекта
   */
  private preloadNames(): void {
    if (!this.data) return;

    if (this.data.categoryOfAggregatorId) {
      this.getCategoryName(this.data.categoryOfAggregatorId);
    }
    if (this.data.developerOfAggregatorId) {
      this.getDeveloperName(this.data.developerOfAggregatorId);
    }
    if (this.data.platformIds) {
      this.data.platformIds.forEach((id) => this.getPlatformName(id));
    }
  }

  getCategoryName(id: number): string {
    if (this.categoryNames.has(id)) return this.categoryNames.get(id)!;

    if (!this.loadingCats.has(id)) {
      this.loadingCats.add(id);
      this.catApi.getById(id).subscribe({
        next: (cat: any) => {
          this.categoryNames.set(id, cat.localizedName || cat.canonicalName);
          this.loadingCats.delete(id);
        },
        error: () => {
          this.categoryNames.set(id, `ID: ${id}`);
          this.loadingCats.delete(id);
        },
      });
    }

    return 'Загрузка...';
  }

  getDeveloperName(id: number | undefined): string {
    if (!id) return '—';
    if (this.developerNames.has(id)) return this.developerNames.get(id)!;

    if (!this.loadingDevs.has(id)) {
      this.loadingDevs.add(id);
      this.devApi.getById(id).subscribe({
        next: (dev: any) => {
          this.developerNames.set(id, dev.name || dev.canonicalName);
          this.loadingDevs.delete(id);
        },
        error: () => {
          this.developerNames.set(id, `ID: ${id}`);
          this.loadingDevs.delete(id);
        },
      });
    }

    return 'Загрузка...';
  }

  getPlatformName(id: number): string {
    if (this.platformNames.has(id)) return this.platformNames.get(id)!;

    if (!this.loadingPlats.has(id)) {
      this.loadingPlats.add(id);
      this.platApi.getById(id).subscribe({
        next: (plat: any) => {
          this.platformNames.set(id, plat.name || plat.canonicalName);
          this.loadingPlats.delete(id);
        },
        error: () => {
          this.platformNames.set(id, `ID: ${id}`);
          this.loadingPlats.delete(id);
        },
      });
    }

    return 'Загрузка...';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'success' : 'default';
  }

  getScreenshotsForLang(langId: number | null): any[] {
    if (!this.data?.screenshots) return [];

    // 1. Пытаемся найти для текущего языка
    let screens = this.data.screenshots.filter((s) => s.languageOfAggregatorId === langId);

    // 2. Если пусто и это не английский - пытаемся найти английские (Fallback)
    if (screens.length === 0 && langId !== null) {
      const enLang = this.data.localizations?.find((l) => l.languageCode?.toLowerCase() === 'en');
      if (enLang && enLang.languageOfAggregatorId !== langId) {
        screens = this.data.screenshots.filter(
          (s) => s.languageOfAggregatorId === enLang.languageOfAggregatorId,
        );
      }
    }

    // 3. Если всё еще пусто - пробуем "Общие" (без привязки к языку)
    if (screens.length === 0 && langId !== null) {
      screens = this.data.screenshots.filter((s) => !s.languageOfAggregatorId);
    }

    return screens.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  getScreenshotTitle(scr: any, langId: number | null): string {
    if (!scr.localizations) return '';
    const loc = scr.localizations.find((l: any) => l.languageOfAggregatorId === langId);
    return loc?.title || '';
  }

  getScreenshotAltText(scr: any, langId: number | null): string {
    if (!scr.localizations) return '';
    const loc = scr.localizations.find((l: any) => l.languageOfAggregatorId === langId);
    return loc?.altText || '';
  }

  get sortedVersions() {
    if (!this.data?.versions) return [];
    return [...this.data.versions].sort((a, b) => {
      if (a.isLatest) return -1;
      if (b.isLatest) return 1;
      return (b.sortOrder || 0) - (a.sortOrder || 0);
    });
  }

  getLatestVersion() {
    return this.data?.versions?.find((v) => v.isLatest);
  }
}
