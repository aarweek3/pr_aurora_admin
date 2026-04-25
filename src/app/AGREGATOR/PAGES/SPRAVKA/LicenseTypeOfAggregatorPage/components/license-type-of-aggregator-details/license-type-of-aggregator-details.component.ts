import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LicenseTypeOfAggregatorDetailDto, LicenseTypeOfAggregatorLocalizationDto } from '../../models/license-type-of-aggregator.model';

@Component({
  selector: 'app-license-type-of-aggregator-details',
  standalone: true,
  imports: [
    CommonModule, 
    NzDescriptionsModule, 
    NzTabsModule, 
    NzTagModule, 
    NzCollapseModule,
    NzIconModule
  ],
  template: `
    <div class="details-container" *ngIf="data">
      <!-- Основная техническая информация -->
      <nz-descriptions nzTitle="Техническая информация" nzBordered [nzColumn]="{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }">
        <nz-descriptions-item nzTitle="Каноническое название">
          <nz-tag nzColor="blue">{{ data.canonicalName }}</nz-tag>
        </nz-descriptions-item>
        <nz-descriptions-item nzTitle="Slug">
          <nz-tag nzColor="orange">{{ data.slug }}</nz-tag>
        </nz-descriptions-item>
        <nz-descriptions-item nzTitle="Порядок сортировки">{{ data.sortOrder }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Статус">
          <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
            {{ data.isActive ? 'Активен' : 'Отключен' }}
          </nz-tag>
        </nz-descriptions-item>
        <nz-descriptions-item nzTitle="Создан">{{ data.createdAt | date:'dd.MM.yyyy HH:mm' }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Обновлен">{{ data.updatedAt | date:'dd.MM.yyyy HH:mm' }}</nz-descriptions-item>
      </nz-descriptions>

      <div class="section-divider"></div>

      <!-- Локализации -->
      <h3 class="section-title"><i nz-icon nzType="global"></i> Локализации и SEO</h3>
      <nz-tabset nzType="card" class="l10n-tabs">
        <nz-tab *ngFor="let loc of data.localizations" [nzTitle]="tabTitle">
          <ng-template #tabTitle>
            <span class="tab-label">
               <i nz-icon nzType="global" style="font-size: 14px;"></i>
               <span *ngIf="loc.languageNativeName || loc.languageName || loc.languageCode; else onlyId">
                 {{ loc.languageNativeName || loc.languageName || loc.languageCode }} (ID: {{ loc.languageOfAggregatorId }})
               </span>
               <ng-template #onlyId>ID: {{ loc.languageOfAggregatorId }}</ng-template>
            </span>
          </ng-template>

          <div class="tab-content">
            <nz-descriptions [nzColumn]="1" nzBordered class="loc-descriptions">
              <nz-descriptions-item nzTitle="Название">{{ loc.name }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Описание">{{ loc.description || '—' }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="HTML контент">
                 <div class="html-preview" [innerHTML]="loc.htmlContent || '—'"></div>
              </nz-descriptions-item>
            </nz-descriptions>

            <nz-collapse nzGhost style="margin-top: 16px;">
              <nz-collapse-panel nzHeader="SEO Параметры" [nzActive]="false">
                <nz-descriptions [nzColumn]="1" nzSize="small">
                  <nz-descriptions-item nzTitle="Meta Title">{{ loc.seoData?.metaTitle || '—' }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Meta Description">{{ loc.seoData?.metaDescription || '—' }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Url Slug">
                     <nz-tag nzColor="orange">{{ loc.seoData?.urlSlug || '—' }}</nz-tag>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="OpenGraph Title">{{ loc.seoData?.ogTitle || '—' }}</nz-descriptions-item>
                </nz-descriptions>
              </nz-collapse-panel>
            </nz-collapse>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    .details-container { padding: 8px; }
    .section-divider { height: 24px; }
    .section-title { margin-bottom: 16px; font-size: 16px; font-weight: 600; color: #1f1f1f; display: flex; align-items: center; gap: 8px; }
    .tab-content { padding: 16px; background: #fafafa; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 8px 8px; }
    .html-preview { max-height: 200px; overflow-y: auto; padding: 8px; background: white; border: 1px solid #d9d9d9; border-radius: 4px; }
    .tab-label { display: flex; align-items: center; gap: 6px; }
    
    .loc-descriptions ::ng-deep .ant-descriptions-item-label {
      width: 120px;
    }
  `]
})
export class LicenseTypeOfAggregatorDetailsComponent {
  @Input() data: LicenseTypeOfAggregatorDetailDto | null = null;
}
