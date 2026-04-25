import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CategoryOfAggregatorStateService } from '../../services/category-of-aggregator-state.service';

@Component({
  selector: 'app-category-of-aggregator-view-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzTagModule,
    NzTabsModule,
    NzIconModule,
    NzToolTipModule,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.viewModalVisible()"
      [nzTitle]="modalTitle"
      (nzOnCancel)="state.closeViewModal()"
      [nzWidth]="isFullScreen ? '100%' : 800"
      [nzStyle]="isFullScreen ? { top: '0', margin: '0', padding: '0', maxWidth: '100%' } : {}"
      [nzBodyStyle]="isFullScreen ? { height: 'calc(100vh - 55px)', overflowY: 'auto' } : {}"
      [nzFooter]="null"
      [nzDraggable]="!isFullScreen"
    >
      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <span>Детальная информация о категории</span>
          <button
            nz-button
            nzType="text"
            (click)="isFullScreen = !isFullScreen"
            class="fullscreen-btn"
            nz-tooltip
            [nzTooltipTitle]="isFullScreen ? 'Свернуть' : 'Развернуть на весь экран'"
          >
            <i nz-icon [nzType]="isFullScreen ? 'fullscreen-exit' : 'fullscreen'"></i>
          </button>
        </div>
      </ng-template>
      <ng-container *nzModalContent>
        @if (state.viewItem(); as item) {
          <div class="view-container">
            <div class="header-info">
              @if (item.iconPath) {
                <img [src]="imgService.getAssetUrl(item.iconPath)" class="view-icon" />
              }
              <div class="title-group">
                <h3>{{ item.canonicalName }}</h3>
                <span class="slug">Slug: {{ item.slug }}</span>
              </div>
              <div style="flex: 1;"></div>
              <nz-tag [nzColor]="item.isActive ? 'success' : 'default'">
                {{ item.isActive ? 'Активен' : 'Пауза' }}
              </nz-tag>
              @if (item.isSystem) {
                <nz-tag nzColor="warning">Системная</nz-tag>
              }
            </div>

            <nz-descriptions nzBordered [nzColumn]="2" nzSize="small">
              <nz-descriptions-item nzTitle="ID">{{ item.id }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Порядок">{{ item.sortOrder }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Родитель ID">{{
                item.parentId || '—'
              }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Дата создания">{{
                item.createdAt | date: 'dd.MM.yyyy HH:mm'
              }}</nz-descriptions-item>
            </nz-descriptions>

            <div class="loc-section" style="margin-top: 24px;">
              <h4>Локализации и SEO</h4>
              <nz-tabset [nzAnimated]="false">
                @for (loc of item.localizations; track loc.languageOfAggregatorId) {
                  <nz-tab [nzTitle]="loc.languageCode || 'Lang'">
                    <div class="tab-padding">
                      <nz-descriptions nzBordered [nzColumn]="1" nzSize="small">
                        <nz-descriptions-item nzTitle="Название">{{
                          loc.name
                        }}</nz-descriptions-item>
                        <nz-descriptions-item nzTitle="Описание">{{
                          loc.description || '—'
                        }}</nz-descriptions-item>
                        <nz-descriptions-item nzTitle="Meta Title">{{
                          loc.metaTitle || '—'
                        }}</nz-descriptions-item>
                        <nz-descriptions-item nzTitle="Meta Description">{{
                          loc.metaDescription || '—'
                        }}</nz-descriptions-item>
                      </nz-descriptions>
                    </div>
                  </nz-tab>
                }
              </nz-tabset>
            </div>
          </div>
        }
      </ng-container>
    </nz-modal>
  `,
  styles: [
    `
      .view-container {
        padding: 10px;
      }
      .header-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .view-icon {
        width: 48px;
        height: 48px;
        object-fit: contain;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 8px;
      }
      .title-group {
        h3 {
          margin: 0;
        }
        .slug {
          color: #64748b;
          font-size: 12px;
          font-family: monospace;
        }
      }
      .tab-padding {
        padding-top: 16px;
      }
      h4 {
        margin-bottom: 12px;
        font-weight: 600;
        color: #1e293b;
      }

      .modal-header-custom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 24px;
        width: 100%;
      }
      .fullscreen-btn {
        color: #64748b;
        &:hover {
          color: #1890ff;
          background: rgba(24, 144, 255, 0.05);
        }
      }
    `,
  ],
})
export class CategoryOfAggregatorViewModalComponent {
  state = inject(CategoryOfAggregatorStateService);
  imgService = inject(ImageServiceUniversal);
  isFullScreen = false;
}
