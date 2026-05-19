import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SystemRequirementStateService } from '../services/system-requirement-state.service';
import { PlatformOfAggregatorStateService } from '../../PlatformOfAggregatorPage/services/platform-of-aggregator-state.service';
import {
  PlatformOsVersionDto,
  PlatformOsVersionLocalizationDto,
} from '../models/system-requirement.model';

@Component({
  selector: 'app-os-version-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzIconModule,
    NzModalModule,
    NzButtonModule,
    NzTagModule,
  ],
  template: `
    <nz-modal
      [nzVisible]="state.osModalVisible()"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="1000"
    >
      <ng-container *nzModalContent>
        <div class="os-form-premium" *ngIf="state.osEditingItem() || state.osModalMode() === 'add'">
          <!-- Секция: Техническая информация -->
          <div class="section-header">
            <i nz-icon nzType="setting" nzTheme="outline"></i>
            <span>Техническая информация</span>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">Системный код</div>
              <div class="info-value">
                <input
                  *ngIf="state.osModalMode() !== 'view'; else viewCode"
                  nz-input
                  nzSize="small"
                  class="inline-input code-box"
                  [ngModel]="state.osEditingItem()?.systemCode"
                  (ngModelChange)="updateItem({ systemCode: $event })"
                />
                <ng-template #viewCode
                  ><span class="code-tag">{{
                    state.osEditingItem()?.systemCode
                  }}</span></ng-template
                >
              </div>

              <div class="info-label">Платформа</div>
              <div class="info-value">
                <nz-select
                  *ngIf="state.osModalMode() !== 'view'; else viewPlatform"
                  nzSize="small"
                  style="width: 100%"
                  [ngModel]="state.osEditingItem()?.platformId"
                  (ngModelChange)="updateItem({ platformId: $event })"
                >
                  @for (p of platformState.items(); track p.id) {
                    <nz-option [nzValue]="p.id" [nzLabel]="p.name"></nz-option>
                  }
                </nz-select>
                <ng-template #viewPlatform>
                  <div class="platform-badge">
                    <i nz-icon [nzType]="getPlatformIcon(state.osEditingItem()?.platformId)"></i>
                    <span>{{ getPlatformName(state.osEditingItem()?.platformId) }}</span>
                  </div>
                </ng-template>
              </div>

              <div class="info-label">Статус</div>
              <div class="info-value">
                <nz-switch
                  *ngIf="state.osModalMode() !== 'view'; else viewStatus"
                  nzSize="small"
                  [ngModel]="state.osEditingItem()?.isActive ?? true"
                  (ngModelChange)="updateItem({ isActive: $event })"
                ></nz-switch>
                <ng-template #viewStatus>
                  <nz-tag [nzColor]="state.osEditingItem()?.isActive ? 'success' : 'error'">
                    {{ state.osEditingItem()?.isActive ? 'Активен' : 'Неактивен' }}
                  </nz-tag>
                </ng-template>
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">Порядок сортировки</div>
              <div class="info-value">
                <input
                  *ngIf="state.osModalMode() !== 'view'; else viewSort"
                  type="number"
                  nz-input
                  nzSize="small"
                  class="inline-input"
                  [ngModel]="state.osEditingItem()?.sortOrder"
                  (ngModelChange)="updateItem({ sortOrder: $event })"
                />
                <ng-template #viewSort>{{ state.osEditingItem()?.sortOrder }}</ng-template>
              </div>

              <div class="info-label">Создан</div>
              <div class="info-value text-muted">
                {{ state.osEditingItem()?.createdAt | date: 'dd.MM.yyyy HH:mm' }}
              </div>

              <div class="info-label">Обновлен</div>
              <div class="info-value text-muted">
                {{ state.osEditingItem()?.updatedAt | date: 'dd.MM.yyyy HH:mm' }}
              </div>
            </div>
          </div>

          <!-- Секция: Локализации -->
          <div class="section-header mt-24">
            <i nz-icon nzType="global" nzTheme="outline"></i>
            <span>Локализации</span>
          </div>

          <div class="loc-container">
            <nz-tabset nzType="card" class="premium-tabs">
              @for (lang of state.languages(); track lang.id) {
                <nz-tab [nzTitle]="langTitle">
                  <ng-template #langTitle>
                    <div class="tab-label">
                      <i nz-icon nzType="global"></i>
                      <span>{{ lang.nativeTitle }} (ID: {{ lang.id }})</span>
                    </div>
                  </ng-template>

                  <div class="tab-content">
                    <div class="field-row">
                      <div class="field-label">Название</div>
                      <div class="field-control">
                        <input
                          *ngIf="state.osModalMode() !== 'view'; else viewName"
                          nz-input
                          [ngModel]="getLocValue(lang.id, 'name')"
                          (ngModelChange)="updateLoc(lang.id, { name: $event })"
                          placeholder="Введите название на языке {{ lang.nativeTitle }}"
                        />
                        <ng-template #viewName
                          ><span class="name-text">{{
                            getLocValue(lang.id, 'name')
                          }}</span></ng-template
                        >
                      </div>
                    </div>

                    <div class="field-row mt-12">
                      <div class="field-label">Описание</div>
                      <div class="field-control">
                        <textarea
                          *ngIf="state.osModalMode() !== 'view'; else viewDesc"
                          nz-input
                          [nzAutosize]="{ minRows: 2 }"
                          [ngModel]="getLocValue(lang.id, 'description')"
                          (ngModelChange)="updateLoc(lang.id, { description: $event })"
                          placeholder="Введите описание (опционально)"
                        ></textarea>
                        <ng-template #viewDesc>
                          <div class="text-muted italic">
                            {{ getLocValue(lang.id, 'description') || 'Описание отсутствует.' }}
                          </div>
                        </ng-template>
                      </div>
                    </div>
                  </div>
                </nz-tab>
              }
            </nz-tabset>
          </div>
        </div>
      </ng-container>

      <ng-template #modalTitle>
        <div class="modal-header-custom">
          <i
            nz-icon
            [nzType]="state.osModalMode() === 'view' ? 'eye' : 'edit'"
            class="header-icon"
          ></i>
          <span>{{ getTitleText() }}</span>
        </div>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">
          {{ state.osModalMode() === 'view' ? 'Закрыть' : 'Отмена' }}
        </button>
        <button
          *ngIf="state.osModalMode() !== 'view'"
          nz-button
          nzType="primary"
          (click)="handleOk()"
          [nzLoading]="state.osModalLoading()"
        >
          Сохранить
        </button>
      </ng-template>
    </nz-modal>
  `,
  styles: [
    `
      .os-form-premium {
        padding: 8px;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 16px;

        i {
          color: #64748b;
        }
      }

      .info-grid {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 24px;
      }

      .info-row {
        display: grid;
        grid-template-columns: 160px 1fr 160px 1fr 120px 1fr;
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          border-bottom: none;
        }
      }

      .info-label {
        background: #f8fafc;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #0066cc;
        border-right: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
      }

      .info-value {
        padding: 8px 16px;
        font-size: 13px;
        color: #1e293b;
        display: flex;
        align-items: center;
        border-right: 1px solid #e2e8f0;

        &:last-child {
          border-right: none;
        }

        .code-tag {
          background: #f1f5f9;
          color: #334155;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          border: 1px solid #cbd5e1;
        }

        .platform-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          i {
            font-size: 16px;
            color: #64748b;
          }
        }
      }

      .loc-container {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1px;
      }

      .premium-tabs {
        ::ng-deep .ant-tabs-nav {
          margin: 0 !important;
          background: #ffffff;
          border-radius: 8px 8px 0 0;
        }
      }

      .tab-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
      }

      .tab-content {
        padding: 24px;
        background: #ffffff;
        border-radius: 0 0 8px 8px;
      }

      .field-row {
        display: grid;
        grid-template-columns: 140px 1fr;
        align-items: center;
        gap: 16px;
      }

      .field-label {
        font-size: 13px;
        font-weight: 600;
        color: #0066cc;
      }

      .field-control {
        .name-text {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }
      }

      .mt-24 {
        margin-top: 24px;
      }
      .mt-12 {
        margin-top: 12px;
      }
      .text-muted {
        color: #94a3b8;
      }
      .italic {
        font-style: italic;
      }

      .modal-header-custom {
        display: flex;
        align-items: center;
        gap: 12px;
        .header-icon {
          color: #1890ff;
          font-size: 18px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsVersionFormComponent {
  readonly state = inject(SystemRequirementStateService);
  readonly platformState = inject(PlatformOfAggregatorStateService);

  getTitleText(): string {
    const mode = this.state.osModalMode();
    const name = this.state.osEditingItem()?.name;

    if (mode === 'add') return 'Добавление новой версии ОС';
    if (mode === 'edit') return `Редактирование: ${name}`;
    return `Просмотр информации о версии ОС: ${name}`;
  }

  getPlatformName(id?: number): string {
    if (!id) return '—';
    const platform = this.platformState.items().find((p) => p.id === id);
    return platform ? platform.name : `ID: ${id}`;
  }

  getPlatformIcon(id?: number): string {
    if (!id) return 'desktop';
    const platform = this.platformState.items().find((p) => p.id === id);
    return platform ? platform.iconPath || 'desktop' : 'question-circle';
  }

  /**
   * Получить значение локализации для конкретного языка
   */
  getLocValue(languageId: number, field: keyof PlatformOsVersionLocalizationDto): string {
    const item = this.state.osEditingItem();
    if (!item?.localizations) return '';
    const loc = item.localizations.find((l) => l.languageId === languageId);
    return loc ? (loc[field] as string) || '' : '';
  }

  /**
   * Обновить локализацию (вызывается при вводе в табах)
   */
  updateLoc(languageId: number, changes: Partial<PlatformOsVersionLocalizationDto>): void {
    const item = this.state.osEditingItem();
    if (!item) return;

    const locs = [...(item.localizations || [])];
    const index = locs.findIndex((l) => l.languageId === languageId);

    if (index !== -1) {
      locs[index] = { ...locs[index], ...changes };
    } else {
      locs.push({ languageId, name: '', ...changes } as PlatformOsVersionLocalizationDto);
    }

    // Если меняем имя на русском (ID: 2 обычно в Aurora), обновляем и основное поле Name
    const rootNameChange = languageId === 2 && changes.name ? { name: changes.name } : {};

    this.state.updateOsEditingItem({ ...rootNameChange, localizations: locs });
  }

  updateItem(changes: Partial<PlatformOsVersionDto>): void {
    this.state.updateOsEditingItem(changes);
  }

  handleOk(): void {
    if (this.state.osModalMode() === 'view') {
      this.state.closeOsOsModal();
      return;
    }
    this.state.saveOsVersion();
  }

  handleCancel(): void {
    this.state.closeOsOsModal();
  }
}
