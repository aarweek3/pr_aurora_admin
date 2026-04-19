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
import { LANGUAGE_ICONS_MAP } from '@assets/languageApp/config/language-icons.config';
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
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
            <tr [class.disabled-row]="!data.enabled">
              <td>
                <av-icon [type]="getIconName(data)" [size]="24"></av-icon>
              </td>
              <td>
                <code>{{ data.code }}</code>
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
                <nz-switch
                  [ngModel]="data.enabled"
                  [nzDisabled]="data.isSystem"
                  (ngModelChange)="toggleStatus(data, $event)"
                ></nz-switch>
              </td>
              <td>
                @if (data.isDefault) {
                  <nz-tag nzColor="blue">Default</nz-tag>
                } @else if (data.enabled) {
                  <button nz-button nzType="link" (click)="setDefault(data)">Set</button>
                }
              </td>
              <td>
                <div class="actions">
                  <button
                    nz-button
                    nzType="text"
                    nz-tooltip
                    nzToolTipTitle="Редактировать"
                    (click)="openModal(data)"
                  >
                    <i nz-icon nzType="edit"></i>
                  </button>

                  @if (!data.isSystem) {
                    <button
                      nz-button
                      nzType="text"
                      nzDanger
                      nz-popconfirm
                      nzPopconfirmTitle="Вы уверены, что хотите удалить этот язык?"
                      (nzOnConfirm)="deleteLanguage(data)"
                    >
                      <i nz-icon nzType="delete"></i>
                    </button>
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
        .title-with-help h2 { margin: 0; }
        .header-actions { display: flex; gap: 16px; }
      }
      .actions { display: flex; gap: 8px; }
      .disabled-row { opacity: 0.6; }
    `,
  ],
})
export class LanguageOfAggregatorManagerComponent implements OnInit {
  service = inject(LanguageAggregatorService);
  private apiService = inject(LanguageAggregatorApiService);
  private modalService = inject(NzModalService);
  private message = inject(NzMessageService);

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
    
    console.log(`[LanguageAggregator] Row Debug:`, { id: data.id, code, iconKey, resultingIcon: final });
    
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

  deleteLanguage(language: LanguageAggregator): void {
    this.apiService.delete(language.id).subscribe({
      next: () => {
        this.message.success('Язык удален');
        this.service.refreshList();
      },
      error: () => this.message.error('Ошибка при удалении'),
    });
  }

  showHardResetConfirm(): void {
    this.modalService.confirm({
      nzTitle: 'Вы уверены, что хотите выполнить Hard Reset?',
      nzContent: 'Это полностью очистит таблицу языков агрегатора!',
      nzOkText: 'Да, очистить',
      nzOkDanger: true,
      nzOnOk: () => this.hardReset(),
    });
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
