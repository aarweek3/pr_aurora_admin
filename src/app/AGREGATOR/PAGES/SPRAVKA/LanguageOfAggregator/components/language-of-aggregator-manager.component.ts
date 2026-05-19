import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { LANGUAGE_ICONS_MAP } from '@language-app/config/language-icons.config';
import { LanguageAggregator } from '../models/language-aggregator.model';
import { LanguageAggregatorApiService } from '../services/language-aggregator-api.service';
import { LanguageAggregatorService } from '../services/language-aggregator.service';
import { LanguageOfAggregatorModalComponent } from './language-of-aggregator-modal.component';

@Component({
  selector: 'app-language-of-aggregator-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzModalModule,
    NzSwitchModule,
    IconComponent,
  ],
  template: `
    <div class="language-manager">
      <div class="language-manager__header">
        <div class="title-with-help">
          <h2>Языки Агрегатора</h2>
        </div>
        <div class="header-actions">
          <div class="header-controls">
            <span class="control-label">Показать удаленные</span>
            <nz-switch
              [ngModel]="service.includeDeleted()"
              (ngModelChange)="service.refreshList($event)"
            ></nz-switch>
          </div>

          <button nz-button nzType="default" nzDanger (click)="showHardResetConfirm()">
            <i nz-icon nzType="warning"></i>
            Hard Reset
          </button>

          @if (service.allLanguages().length === 0) {
            <button
              nz-button
              nzType="default"
              (click)="initialize()"
              [nzLoading]="service.isLoading()"
            >
              <i nz-icon nzType="cloud-download"></i>
              Инициализировать
            </button>
          }

          <button nz-button nzType="primary" (click)="openModal()">
            <i nz-icon nzType="plus"></i>
            Добавить язык
          </button>
        </div>
      </div>

      <nz-table
        #basicTable
        [nzData]="service.allLanguages()"
        [nzLoading]="service.isLoading()"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th>Флаг</th>
            <th>Код (BCP-47)</th>
            <th>Краткий код</th>
            <th>Название (EN)</th>
            <th>Название (Родное)</th>
            <th>RTL</th>
            <th>Порядок</th>
            <th>Статус</th>
            <th>Default</th>
            <th>Создан</th>
            <th>Обновлен</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
            <tr [class.disabled-row]="!data.enabled" [class.row-deleted]="data.isDeleted">
              <td>
                <av-icon [type]="getIconName(data)" [size]="24"></av-icon>
              </td>
              <td>
                <span class="av-tag-slug">{{ data.code }}</span>
              </td>
              <td>{{ data.shortCode }}</td>
              <td>{{ data.title }}</td>
              <td>{{ data.nativeTitle }}</td>
              <td>
                @if (data.isRtl) {
                  <nz-tag nzColor="orange">RTL</nz-tag>
                }
              </td>
              <td>{{ data.sortOrder }}</td>
              <td>
                <div class="status-badges">
                  <nz-switch
                    [ngModel]="data.enabled"
                    [nzDisabled]="data.isSystem || data.isDeleted"
                    (ngModelChange)="toggleStatus(data, $event)"
                  ></nz-switch>

                  @if (data.isDeleted) {
                    <nz-tag nzColor="error" class="status-tag">Удален</nz-tag>
                  } @else if (!data.enabled) {
                    <nz-tag nzColor="default" class="status-tag">Отключен</nz-tag>
                  }
                </div>
              </td>
              <td>
                @if (data.isDefault) {
                  <nz-tag nzColor="blue">Default</nz-tag>
                } @else if (data.enabled && !data.isDeleted) {
                  <button nz-button nzType="link" (click)="setDefault(data)">Set</button>
                }
              </td>
              <td>
                <span nz-tooltip [nzTooltipTitle]="data.createdAt | date: 'yyyy-MM-dd HH:mm:ss'">
                  {{ data.createdAt | date: 'dd.MM.yyyy' }}
                </span>
              </td>
              <td>
                <span nz-tooltip [nzTooltipTitle]="data.updatedAt | date: 'yyyy-MM-dd HH:mm:ss'">
                  {{ data.updatedAt | date: 'dd.MM.yyyy' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button
                    nz-button
                    nzType="text"
                    nz-tooltip
                    nzTooltipTitle="Редактировать"
                    (click)="openModal(data)"
                  >
                    <i nz-icon nzType="edit"></i>
                  </button>

                  @if (!data.isSystem) {
                    @if (data.isDeleted) {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Восстановить"
                        style="color: #52c41a"
                        (click)="restoreLanguage(data)"
                      >
                        <i nz-icon nzType="undo"></i>
                      </button>

                      <button
                        nz-button
                        nzType="text"
                        nzDanger
                        nz-tooltip
                        nzTooltipTitle="Удалить окончательно"
                        (click)="hardDeleteLanguage(data)"
                      >
                        <i nz-icon nzType="delete" nzTheme="fill"></i>
                      </button>
                    } @else {
                      <button
                        nz-button
                        nzType="text"
                        nz-tooltip
                        nzTooltipTitle="Переместить в корзину"
                        (click)="deleteLanguage(data)"
                      >
                        <i nz-icon nzType="delete"></i>
                      </button>

                      <button
                        nz-button
                        nzType="text"
                        nzDanger
                        nz-tooltip
                        nzTooltipTitle="Удалить безвозвратно"
                        (click)="hardDeleteLanguage(data)"
                      >
                        <i nz-icon nzType="delete" nzTheme="fill"></i>
                      </button>
                    }
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [
    `
      .language-manager {
        padding: 24px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      .language-manager__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .title-with-help h2 {
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;

          .header-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-right: 8px;
            padding: 4px 12px;
            background: #f5f5f5;
            border-radius: 4px;

            .control-label {
              font-size: 13px;
              color: #666;
            }
          }
        }
      }
      .status-badges {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-tag {
          margin-right: 0;
        }
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .disabled-row {
        opacity: 0.6;
      }
      .row-deleted {
        opacity: 0.5;
        background-color: #f9f9f9;
        text-decoration: line-through;
        color: #999;

        .av-tag-slug {
          opacity: 0.7;
        }

        av-icon {
          filter: grayscale(1);
        }
      }
    `,
  ],
})
export class LanguageOfAggregatorManagerComponent implements OnInit {
  service = inject(LanguageAggregatorService);
  private apiService = inject(LanguageAggregatorApiService);
  private message = inject(NzMessageService);
  private modalService = inject(NzModalService);
  private auroraModal = inject(ModalService);

  ngOnInit(): void {
    this.refresh();
  }

  getIconName(data: LanguageAggregator): string {
    const { iconKey, code } = data;

    // 1. Пытаемся по ключу иконки
    let mapped = iconKey ? LANGUAGE_ICONS_MAP[iconKey] : null;

    // 2. Если нет, пытаемся по коду (ru-RU, en-US)
    if (!mapped && code) {
      mapped = LANGUAGE_ICONS_MAP[code];
    }

    // 3. Fallback на дефолт
    const final = mapped || LANGUAGE_ICONS_MAP['default'];

    return final;
  }

  refresh(): void {
    this.service.refreshList();
  }

  openModal(language?: LanguageAggregator): void {
    const modal = this.modalService.create({
      nzTitle: language ? 'Редактировать язык агрегатора' : 'Добавить язык агрегатора',
      nzContent: LanguageOfAggregatorModalComponent,
      nzData: { language },
      nzFooter: null,
      nzWidth: 600,
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.service.refreshList();
      }
    });
  }

  toggleStatus(language: LanguageAggregator, enabled: boolean): void {
    this.apiService.toggleStatus(language.id, enabled).subscribe({
      next: () => {
        this.message.success(`Статус языка ${language.code} изменен`);
        this.service.refreshList();
      },
      error: () => this.message.error('Ошибка при смене статуса'),
    });
  }

  setDefault(language: LanguageAggregator): void {
    this.apiService.setDefault(language.id).subscribe({
      next: () => {
        this.message.success(`${language.nativeTitle} установлен по умолчанию`);
        this.service.refreshList();
      },
      error: () => this.message.error('Ошибка при установке значения по умолчанию'),
    });
  }

  async deleteLanguage(language: LanguageAggregator): Promise<void> {
    const confirmed = await this.auroraModal.confirm({
      title: 'Удалить язык?',
      message: `Вы действительно хотите переместить язык «${language.title}» в корзину?`,
      confirmText: 'В корзину',
      cancelText: 'Отмена',
      confirmType: 'danger',
      icon: 'actions/av_trash',
      centered: true,
    });

    if (confirmed) {
      this.apiService.delete(language.id).subscribe({
        next: () => {
          this.message.warning(`Язык ${language.title} перемещен в корзину`);
          this.service.refreshList();
        },
        error: () => this.message.error('Ошибка при перемещении в корзину'),
      });
    }
  }

  async hardDeleteLanguage(language: LanguageAggregator): Promise<void> {
    const confirmed = await this.auroraModal.challenge(
      `Вы действительно хотите ПОЛНОСТЬЮ СТЕРЕТЬ язык «${language.title}» из базы данных? Это действие необратимо.`,
      '2 + 2 * 2 = ?',
      '6',
      'Критическое удаление',
    );

    if (confirmed) {
      this.apiService.hardDelete(language.id).subscribe({
        next: () => {
          this.message.success(`Язык ${language.title} полностью удален`);
          this.service.refreshList();
        },
        error: () => this.message.error('Ошибка при полном удалении'),
      });
    }
  }

  restoreLanguage(language: LanguageAggregator): void {
    this.service.restore(language.id);
    this.message.success(`Язык ${language.title} восстановлен`);
  }

  async showHardResetConfirm(): Promise<void> {
    const confirmed = await this.auroraModal.challenge(
      'Вы действительно хотите СТЕРЕТЬ ВСЕ ДАННЫЕ из справочника языков? Это действие очистит всю таблицу.',
      '2 + 2 * 2 = ?',
      '6',
      'Критический сброс базы',
    );

    if (confirmed) {
      this.hardReset();
    }
  }

  hardReset(): void {
    this.apiService.hardReset().subscribe({
      next: () => {
        this.message.success('Таблица очищена');
        this.service.refreshList();
      },
      error: () => this.message.error('Ошибка при сбросе'),
    });
  }

  initialize(): void {
    this.apiService.initialize().subscribe({
      next: () => {
        this.message.success('Инициализация завершена');
        this.service.refreshList();
      },
      error: () => this.message.error('Ошибка при инициализации'),
    });
  }
}
