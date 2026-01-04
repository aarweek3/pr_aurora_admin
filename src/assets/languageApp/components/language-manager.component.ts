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
import { IconComponent } from '../../../app/shared/components/ui/icon/icon.component';

import { LanguageModalComponent } from '@assets/languageApp/components/language-modal.component';
import { LANGUAGE_ICONS_MAP } from '../config/language-icons.config';
import { AppLanguage } from '../models/appLanguage.model';
import { LanguageApiService } from '../services/language-api.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-language-manager',
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
        <h2>Управление языками</h2>
        <div class="header-actions">
          <button nz-button nzType="primary" (click)="openModal()">
            <i nz-icon nzType="plus"></i>
            Добавить язык
          </button>
        </div>
      </div>

      <nz-table
        #basicTable
        [nzData]="languageService.allLanguages()"
        [nzLoading]="languageService.isLoading()"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th>Флаг</th>
            <th>Иконка (ключ)</th>
            <th>Код (BCP-47)</th>
            <th>Краткий код</th>
            <th>Название (EN)</th>
            <th>Название (Родное)</th>
            <th>Порядок</th>
            <th>Статус</th>
            <th>Default</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
          <tr>
            <td>
              <av-icon [type]="getIconName(data.iconKey)" [size]="24"></av-icon>
            </td>
            <td>{{ data.iconKey }}</td>
            <td>
              <code>{{ data.code }}</code>
            </td>
            <td>{{ data.shortCode }}</td>
            <td>{{ data.title }}</td>
            <td>{{ data.nativeTitle }}</td>
            <td>{{ data.sortOrder }}</td>
            <td>
              <nz-switch
                [ngModel]="data.enabled"
                [nzDisabled]="data.isSystem"
                (click)="$event.stopPropagation()"
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
      }
      .language-manager__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        h2 {
          margin: 0;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
      }
      .flag-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 24px;
        background: #f5f5f5;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        font-size: 10px;
        font-weight: bold;
        color: #8c8c8c;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class LanguageManagerComponent implements OnInit {
  languageService = inject(LanguageService);
  private apiService = inject(LanguageApiService);
  private modalService = inject(NzModalService);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    this.languageService.refreshAdminList();
  }

  getIconName(iconKey?: string): string {
    if (!iconKey) return LANGUAGE_ICONS_MAP['default'];
    return LANGUAGE_ICONS_MAP[iconKey] || iconKey;
  }

  openModal(language?: AppLanguage): void {
    const modal = this.modalService.create({
      nzTitle: language ? 'Редактировать язык' : 'Добавить новый язык',
      nzContent: LanguageModalComponent,
      nzData: { language },
      nzFooter: null,
      nzWidth: 600,
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.languageService.refreshAdminList();
      }
    });
  }

  toggleStatus(language: AppLanguage, enabled: boolean): void {
    this.apiService.toggleStatus(language.id, enabled).subscribe({
      next: () => {
        this.message.success(`Статус языка ${language.code} изменен`);
        this.languageService.refreshAdminList();
      },
      error: (err) => {
        this.message.error('Ошибка при смене статуса');
        console.error(err);
      },
    });
  }

  setDefault(language: AppLanguage): void {
    this.apiService.setDefault(language.id).subscribe({
      next: () => {
        this.message.success(`${language.nativeTitle} теперь язык по умолчанию`);
        this.languageService.refreshAdminList();
      },
      error: (err) => {
        this.message.error('Ошибка при установке языка по умолчанию');
      },
    });
  }

  deleteLanguage(language: AppLanguage): void {
    this.apiService.delete(language.id).subscribe({
      next: () => {
        this.message.success('Язык удален');
        this.languageService.refreshAdminList();
      },
      error: (err) => {
        this.message.error('Ошибка при удалении');
      },
    });
  }
}
