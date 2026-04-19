import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PlatformDetailDto } from '../../models/platform.model';

@Component({
  selector: 'app-platform-view-drawer',
  standalone: true,
  imports: [
    CommonModule,
    NzDrawerModule,
    NzSkeletonModule,
    NzBadgeModule,
    NzButtonModule,
    NzTagModule,
    NzTabsModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzIconModule,
    NzEmptyModule,
    NzSpaceModule,
  ],
  template: `
    <nz-drawer
      [nzVisible]="visible"
      [nzWidth]="'75%'"
      nzTitle="Просмотр деталей платформы"
      (nzOnClose)="close()"
      [nzFooter]="footerTpl"
    >
      <ng-container *nzDrawerContent>
        <nz-skeleton [nzActive]="true" *ngIf="loading && !data"></nz-skeleton>

        <div class="view-container" *ngIf="data">
          <!-- Левая панель: Общие данные -->
          <div class="sidebar">
            <div class="main-info">
              <div class="platform-icon">
                <i nz-icon [nzType]="'windows'" *ngIf="!data.urlPictureMain"></i>
                <img [src]="data.urlPictureMain" *ngIf="data.urlPictureMain" />
              </div>
              <div class="tech-info">
                <div class="info-row">
                  <span class="label">Название:</span>
                  <h2 class="tech-title">{{ data.name }}</h2>
                </div>
                <div class="info-row">
                  <span class="label">Код:</span>
                  <nz-tag nzColor="blue" class="code-tag">{{ data.code }}</nz-tag>
                </div>
              </div>
            </div>

            <nz-divider></nz-divider>

            <div class="stats-group">
              <div class="stat-item">
                <span class="label">Статус:</span>
                <nz-badge
                  [nzStatus]="data.isActive ? 'success' : 'default'"
                  [nzText]="data.isActive ? 'Активен' : 'Отключен'"
                ></nz-badge>
              </div>
              <div class="stat-item">
                <span class="label">Семейство:</span>
                <span class="value">{{ data.family || '---' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Порядок сортировки:</span>
                <span class="value">{{ data.sortOrder }}</span>
              </div>
            </div>

            <nz-divider></nz-divider>

            <div class="dates-info">
              <p>
                <i nz-icon nzType="calendar"></i> Создан:
                {{ data.createdAt | date: 'dd.MM.yyyy HH:mm' }}
              </p>
              <p>
                <i nz-icon nzType="sync"></i> Обновлен:
                {{ data.updatedAt | date: 'dd.MM.yyyy HH:mm' }}
              </p>
            </div>
          </div>

          <!-- Правая панель: Локализация и SEO -->
          <div class="content">
            <nz-tabset [nzSelectedIndex]="defaultIndex">
              <nz-tab *ngFor="let trans of data.translations" [nzTitle]="titleTemplate">
                <ng-template #titleTemplate>
                  <i nz-icon nzType="global"></i>
                  {{ trans.languageCode?.toUpperCase() || 'Язык не указан' }}
                </ng-template>

                <div class="tab-body">
                  <div class="field-item">
                    <span class="field-label">Локализованное название:</span>
                    <h1 class="localized-name">{{ trans.name || '---' }}</h1>
                  </div>

                  <div class="field-item">
                    <span class="field-label">Краткое описание:</span>
                    <blockquote class="short-desc" *ngIf="trans.description">
                      {{ trans.description }}
                    </blockquote>
                    <p class="no-data" *ngIf="!trans.description">---</p>
                  </div>

                  <nz-divider nzText="Основной контент" nzOrientation="left"></nz-divider>

                  <div
                    class="html-container"
                    *ngIf="trans.descriptionFull"
                    [innerHTML]="sanitizeHtml(trans.descriptionFull)"
                  ></div>
                  <nz-empty
                    *ngIf="!trans.descriptionFull"
                    nzNotFoundContent="Полное описание не заполнено"
                  ></nz-empty>

                  <nz-divider nzText="SEO Параметры" nzOrientation="left"></nz-divider>

                  <nz-descriptions [nzColumn]="2" nzBordered nzSize="small">
                    <nz-descriptions-item nzTitle="Meta Title" [nzSpan]="2">
                      {{ trans.seoData?.metaTitle || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Meta Description" [nzSpan]="2">
                      {{ trans.seoData?.metaDescription || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Meta Keywords" [nzSpan]="2">
                      {{ trans.seoData?.metaKeywords || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="URL Slug">
                      <nz-tag nzColor="purple" *ngIf="trans.seoData?.urlSlug">{{
                        trans.seoData?.urlSlug
                      }}</nz-tag>
                      <span *ngIf="!trans.seoData?.urlSlug">---</span>
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Canonical URL">
                      {{ trans.seoData?.canonicalUrl || '---' }}
                    </nz-descriptions-item>

                    <nz-descriptions-item nzTitle="Настройки индексации" [nzSpan]="2">
                      <nz-space>
                        <nz-tag [nzColor]="trans.seoData?.noIndex ? 'error' : 'success'">
                          Index: {{ trans.seoData?.noIndex ? 'NoIndex' : 'Index' }}
                        </nz-tag>
                        <nz-tag [nzColor]="trans.seoData?.noFollow ? 'error' : 'success'">
                          Follow: {{ trans.seoData?.noFollow ? 'NoFollow' : 'Follow' }}
                        </nz-tag>
                      </nz-space>
                    </nz-descriptions-item>

                    <nz-descriptions-item nzTitle="Open Graph (OG) Заголовок">
                      {{ trans.seoData?.ogTitle || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Open Graph (OG) Описание">
                      {{ trans.seoData?.ogDescription || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Twitter Card Title">
                      {{ trans.seoData?.twitterTitle || '---' }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Twitter Card Description">
                      {{ trans.seoData?.twitterDescription || '---' }}
                    </nz-descriptions-item>
                  </nz-descriptions>
                </div>
              </nz-tab>
            </nz-tabset>

            <nz-empty
              *ngIf="!data.translations || data.translations.length === 0"
              nzNotFoundContent="Нет данных о локализации и переводах"
            ></nz-empty>
          </div>
        </div>
      </ng-container>

      <ng-template #footerTpl>
        <div style="float: right">
          <button nz-button (click)="close()">Закрыть</button>
        </div>
      </ng-template>
    </nz-drawer>
  `,
  styles: [
    `
      .view-container {
        display: flex;
        gap: 24px;
        height: 100%;
      }
      .sidebar {
        flex: 0 0 280px;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
      }
      .content {
        flex: 1;
        padding: 8px;
      }
      .main-info {
        text-align: center;
        margin-bottom: 24px;
      }
      .platform-icon {
        font-size: 48px;
        color: #1890ff;
        margin-bottom: 12px;
        background: #fff;
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 50%;
        margin: 0 auto 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .platform-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .tech-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
      }
      .info-row {
        display: flex;
        flex-direction: column;
      }
      .info-row .label {
        font-size: 11px;
        text-transform: uppercase;
        color: #bfbfbf;
        letter-spacing: 0.5px;
      }
      .tech-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }
      .code-tag {
        width: fit-content;
      }
      .stats-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .stat-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
      }
      .stat-item .label {
        color: #8c8c8c;
      }
      .stat-item .value {
        font-weight: 500;
      }
      .dates-info {
        font-size: 12px;
        color: #bfbfbf;
      }
      .dates-info p {
        margin-bottom: 4px;
      }
      .field-item {
        margin-bottom: 24px;
      }
      .field-label {
        display: block;
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
        font-weight: 500;
      }
      .tab-body {
        padding: 16px 0;
      }
      .localized-name {
        font-size: 28px;
        margin: 0;
        color: #262626;
      }
      .short-desc {
        background: #f9f9f9;
        border-left: 4px solid #1890ff;
        padding: 12px 16px;
        margin: 0;
        font-style: italic;
        color: #595959;
      }
      .html-container {
        padding: 16px;
        background: #fff;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        min-height: 200px;
        max-height: 500px;
        overflow-y: auto;
        font-size: 16px;
        line-height: 1.6;
      }
      .no-data {
        color: #bfbfbf;
        font-style: italic;
        margin: 0;
      }
    `,
  ],
})
export class PlatformViewDrawerComponent {
  @Input() visible = false;
  @Input() data: PlatformDetailDto | null = null;
  @Input() loading = false;
  @Output() closeDrawer = new EventEmitter<void>();

  private sanitizer = inject(DomSanitizer);

  get defaultIndex(): number {
    if (!this.data?.translations) return 0;
    const enIndex = this.data.translations.findIndex((t) =>
      t.languageCode?.toLowerCase().startsWith('en'),
    );
    return enIndex >= 0 ? enIndex : 0;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  close(): void {
    this.closeDrawer.emit();
  }
}
