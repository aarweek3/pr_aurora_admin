import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageHardResetModalComponent } from '@language-app/components/language-hard-reset-modal.component';
import { LanguageModalComponent } from '@language-app/components/language-modal.component';
import { IconComponent } from '@shared/components/ui/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
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
        <div class="title-with-help">
          <h2>Управление языками</h2>
          <button
            nz-button
            nzType="text"
            nz-tooltip
            nzTooltipTitle="Справка"
            class="help-btn"
            (click)="showHelp()"
          >
            <i nz-icon nzType="question-circle" nzTheme="outline"></i>
          </button>
        </div>
        <div class="header-actions">
          <button nz-button nzType="default" nzDanger (click)="showHardResetConfirm()">
            <i nz-icon nzType="warning"></i>
            Hard Reset
          </button>

          @if (languageService.allLanguages().length === 0) {
            <button
              nz-button
              nzType="default"
              (click)="initialize()"
              [nzLoading]="languageService.isLoading()"
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

        .title-with-help {
          display: flex;
          align-items: center;
          gap: 8px;

          h2 {
            margin: 0;
          }

          .help-btn {
            color: #1890ff;
            font-size: 18px;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              color: #40a9ff;
            }
          }
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

  showHardResetConfirm(): void {
    const modal = this.modalService.create({
      nzTitle: 'Опасное действие: Hard Reset',
      nzContent: LanguageHardResetModalComponent,
      nzFooter: null,
      nzWidth: 400,
    });

    modal.afterClose.subscribe((result) => {
      if (result === true) {
        this.hardReset();
      }
    });
  }

  hardReset(): void {
    this.apiService.hardReset().subscribe({
      next: () => {
        this.message.success('База данных языков полностью очищена, ID сброшены');
        this.languageService.refreshAdminList();
      },
      error: (err) => {
        this.message.error('Ошибка при выполнении Hard Reset');
        console.error(err);
      },
    });
  }

  initialize(): void {
    this.apiService.initialize().subscribe({
      next: () => {
        this.message.success('Языки успешно инициализированы из эталонного JSON');
        this.languageService.refreshAdminList();
      },
      error: (err) => {
        this.message.error('Ошибка при инициализации');
        console.error(err);
      },
    });
  }

  showHelp(): void {
    this.modalService.info({
      nzTitle: 'Справка: Управление языками',
      nzWidth: 700,
      nzContent: `
        <div style="line-height: 1.8; font-size: 14px;">
          <h3 style="margin-top: 0; color: #1890ff;">📋 Общее описание</h3>
          <p>
            Компонент управления мультиязычностью приложения. Позволяет добавлять, редактировать,
            активировать/деактивировать языки интерфейса и устанавливать язык по умолчанию.
          </p>

          <h3 style="color: #1890ff; margin-top: 20px;">🚀 Первый запуск</h3>
          <ol style="padding-left: 20px;">
            <li><strong>Инициализация:</strong> При первом запуске база пустая. Нажмите кнопку
            <strong>"Инициализировать"</strong> для загрузки стандартного набора языков из JSON-файла.</li>
            <li><strong>Выбор языка по умолчанию:</strong> После инициализации выберите основной язык
            интерфейса кнопкой <strong>"Set"</strong> напротив нужного языка.</li>
            <li><strong>Активация языков:</strong> Включите переключатели для языков, которые будут
            доступны пользователям.</li>
          </ol>

          <h3 style="color: #1890ff; margin-top: 20px;">⚙️ Основные операции</h3>
          <ul style="padding-left: 20px;">
            <li><strong>🔄 Инициализировать:</strong> Кнопка доступна только при пустой базе языков
            (при первом запуске). Загружает стандартный набор языков из JSON-файла на сервере.
            Включает популярные языки мира с правильными кодами BCP-47, названиями и иконками флагов.
            После инициализации кнопка автоматически скрывается. Повторную инициализацию можно
            выполнить только через <strong>Hard Reset</strong>.</li>
            <li><strong>Добавить язык:</strong> Кнопка "+ Добавить язык" открывает форму создания
            нового языка с указанием кода (BCP-47), названий, иконки и порядка сортировки.</li>
            <li><strong>Редактировать:</strong> Иконка карандаша позволяет изменить параметры языка
            (название, иконку, порядок отображения).</li>
            <li><strong>Вкл/Выкл статус:</strong> Переключатель активирует/деактивирует язык.
            Деактивированные языки не отображаются в селекторе языка на фронтенде.</li>
            <li><strong>Установить по умолчанию:</strong> Язык по умолчанию загружается при первом
            посещении сайта неавторизованными пользователями.</li>
            <li><strong>Удалить:</strong> Иконка корзины удаляет язык (недоступно для системных языков).</li>
          </ul>

          <h3 style="color: #ff4d4f; margin-top: 20px;">⚠️ Hard Reset</h3>
          <p style="background: #fff1f0; padding: 12px; border-left: 4px solid #ff4d4f; border-radius: 4px;">
            <strong>Опасная операция!</strong> Кнопка <strong>"Hard Reset"</strong> полностью очищает
            таблицу языков и сбрасывает счетчик ID. Используйте только при необходимости полной
            переинициализации базы данных языков.
          </p>

          <h3 style="color: #1890ff; margin-top: 20px;">💡 Советы</h3>
          <ul style="padding-left: 20px;">
            <li>Код языка должен соответствовать стандарту <strong>BCP-47</strong> (например: ru-RU, en-US, zh-CN)</li>
            <li>Краткий код (2 символа) используется для компактного отображения в интерфейсе</li>
            <li>Иконка (ключ) определяет флаг языка в UI-компонентах</li>
            <li>Порядок сортировки (SortOrder) влияет на последовательность отображения в селекторе</li>
            <li>Системные языки (IsSystem=true) нельзя удалить, они защищены от случайного удаления</li>
          </ul>

          <h3 style="color: #1890ff; margin-top: 20px;">🔗 Связанные компоненты</h3>
          <ul style="padding-left: 20px;">
            <li><strong>LanguageService:</strong> Центральный сервис, предоставляющий список языков
            всем компонентам приложения</li>
            <li><strong>LanguageApiService:</strong> HTTP-клиент для работы с API языков на бэкенде</li>
            <li><strong>Формы с многоязычностью:</strong> Все формы с полями на разных языках (SEO,
            описания платформ и т.д.) зависят от инициализированных языков</li>
          </ul>
        </div>
      `,
      nzOkText: 'Понятно',
      nzCentered: true,
    });
  }
}
