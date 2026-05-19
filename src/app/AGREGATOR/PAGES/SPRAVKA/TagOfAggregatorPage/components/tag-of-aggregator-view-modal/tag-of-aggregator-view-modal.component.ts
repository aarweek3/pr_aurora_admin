import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { TagOfAggregatorStateService } from '../../services/tag-of-aggregator-state.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

@Component({
  selector: 'app-tag-of-aggregator-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzTagModule,
    NzTabsModule,
    NzIconModule,
    NzDescriptionsModule,
    NzCollapseModule,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.viewModalVisible()"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="state.closeViewModal()"
      [nzWidth]="1000"
    >
      <ng-container *nzModalContent>
        <div class="modal-body-scroll" *ngIf="state.viewItem() as tag">
          <!-- Техническая информация -->
          <nz-descriptions
            nzTitle="⚙️ Техническая информация"
            nzBordered
            [nzColumn]="{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
          >
            <nz-descriptions-item nzTitle="ID">{{ tag.id }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Системный код (Slug)">
              <nz-tag nzColor="blue">{{ tag.slug }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Порядок">{{ tag.sortOrder }}</nz-descriptions-item>

            <nz-descriptions-item nzTitle="Категория">{{ tag.categoryName }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Тип">{{ tag.type }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Статус">
              <nz-tag [nzColor]="tag.isActive ? 'success' : 'default'">
                {{ tag.isActive ? 'Активен' : 'Пауза' }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Стиль (Preview)">
              <div class="live-preview-container">
                <nz-tag [nzColor]="getResolvedColor(tag)" class="live-tag">
                  @if (tag.iconPath) {
                    <div
                      *ngIf="isCustomIcon(tag.iconPath); else standardIcon"
                      class="live-tag-icon"
                      [style.-webkit-mask-image]="
                        'url(' + imgService.getAssetUrl(tag.iconPath) + ')'
                      "
                      [style.mask-image]="'url(' + imgService.getAssetUrl(tag.iconPath) + ')'"
                    ></div>
                    <ng-template #standardIcon>
                      <i
                        nz-icon
                        [nzType]="getStandardIcon(tag.iconPath)"
                        class="live-tag-icon-standard"
                      ></i>
                    </ng-template>
                  }
                  <span class="live-tag-text">{{ tag.localizedName || tag.slug }}</span>
                </nz-tag>
                <span class="color-hex-label">{{ tag.color }}</span>
              </div>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Создан">{{
              tag.createdAt | date: 'dd.MM.yyyy HH:mm'
            }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Обновлен">{{
              tag.updatedAt | date: 'dd.MM.yyyy HH:mm'
            }}</nz-descriptions-item>
          </nz-descriptions>

          <div class="section-divider"></div>

          <!-- Локализации и SEO -->
          <h3 class="section-title"><i nz-icon nzType="global"></i> Локализации и SEO</h3>
          <nz-tabset nzType="card" class="l10n-tabs">
            <nz-tab *ngFor="let loc of tag.localizations" [nzTitle]="tabTitle">
              <ng-template #tabTitle>
                <div class="tab-label">
                  <i nz-icon nzType="global"></i>
                  <span
                    >{{ loc.languageName || loc.languageCode }} (ID:
                    {{ loc.languageOfAggregatorId }})</span
                  >
                </div>
              </ng-template>

              <div class="tab-content">
                <nz-descriptions [nzColumn]="1" nzBordered>
                  <nz-descriptions-item nzTitle="Название">{{ loc.name }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="H1 Заголовок">{{
                    loc.h1Title || '—'
                  }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Описание">{{
                    loc.description || '—'
                  }}</nz-descriptions-item>
                </nz-descriptions>

                <nz-collapse nzGhost style="margin-top: 16px;">
                  <nz-collapse-panel nzHeader="SEO Мета-теги" [nzActive]="false">
                    <nz-descriptions [nzColumn]="1" nzSize="small">
                      <nz-descriptions-item nzTitle="Meta Title">{{
                        loc.metaTitle || '—'
                      }}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="Meta Description">{{
                        loc.metaDescription || '—'
                      }}</nz-descriptions-item>
                    </nz-descriptions>
                  </nz-collapse-panel>
                </nz-collapse>
              </div>
            </nz-tab>
          </nz-tabset>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <i nz-icon nzType="eye" class="header-icon"></i>
          <span
            >Просмотр тега:
            <strong>{{ state.viewItem()?.localizedName || state.viewItem()?.slug }}</strong></span
          >
        </div>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="state.closeViewModal()">Закрыть</button>
      </ng-template>
    </nz-modal>
  `,
  styles: [
    `
      .modal-header-custom {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
      }
      .header-icon {
        color: #1890ff;
        font-size: 20px;
      }
      .modal-body-scroll {
        max-height: 70vh;
        overflow-y: auto;
        padding: 12px;
      }

      .section-divider {
        height: 24px;
      }
      .section-title {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .live-preview-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .live-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 14px;
        border-radius: 8px;
        font-weight: 600;
        height: auto;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .live-tag-icon {
        width: 16px;
        height: 16px;
        background-color: #fff;
        mask-size: contain;
        -webkit-mask-size: contain;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-position: center;
      }
      .live-tag-icon-standard {
        color: #fff;
        font-size: 16px;
      }
      .live-tag-text {
        color: #fff;
        font-size: 14px;
      }
      .color-hex-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: #94a3b8;
      }

      .tab-label {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tab-content {
        padding: 16px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        border-top: none;
        border-radius: 0 0 8px 8px;
      }

      ::ng-deep .ant-descriptions-item-label {
        width: 150px;
        background: #f8fafc !important;
        font-weight: 600;
        color: #475569;
      }
    `,
  ],
})
export class TagOfAggregatorViewModalComponent {
  public state = inject(TagOfAggregatorStateService);
  public imgService = inject(ImageServiceUniversal);

  isCustomIcon(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.includes('.') || icon.includes('/');
  }

  getStandardIcon(icon: string | undefined): string {
    if (!icon) return 'tag';
    if (icon.startsWith('nz-icon:')) {
      return icon.replace('nz-icon:', '');
    }
    return icon;
  }

  getResolvedColor(tag: any): string {
    if (tag.color && tag.color !== 'inherit') return tag.color;

    // Попытка найти цвет из категории в общем стейте
    if (tag.categoryTagId) {
      const cat = this.state.categories().find((c) => c.id === tag.categoryTagId);
      if (cat?.color && cat.color !== 'inherit') return cat.color;
    }

    return '#1890ff'; // Default
  }
}
