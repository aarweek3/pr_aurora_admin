import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '@environments/environment';
import { HelpUniversalModalComponent } from '@shared/components/help-universal-modal/help-universal-modal.component';
import { IconDataService } from '@core/services/icon/icon-data.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'av-help-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzToolTipModule,
  ],
  template: `
    <form nz-form [formGroup]="validateForm" (ngSubmit)="submitForm()">
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzRequired>ID справки</nz-form-label>
        <nz-form-control [nzSpan]="18" nzErrorTip="Введите ID (только латиница и дефисы)">
          <input nz-input formControlName="helpId" placeholder="Например: user-profile-guide" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzRequired>Заголовок</nz-form-label>
        <nz-form-control [nzSpan]="18" nzErrorTip="Введите заголовок">
          <input nz-input formControlName="title" placeholder="Например: Настройка профиля" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6">Подзаголовок</nz-form-label>
        <nz-form-control [nzSpan]="18">
          <input nz-input formControlName="subtitle" placeholder="Краткое описание раздела" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6">Иконка</nz-form-label>
        <nz-form-control [nzSpan]="18">
          <div class="icon-input-wrapper">
            <nz-input-group [nzPrefix]="prefixIcon">
              <input nz-input formControlName="icon" placeholder="appstore, ⚡ или путь..." />
            </nz-input-group>

            <ng-template #prefixIcon>
              <div class="current-icon-preview">
                @if (isAntIcon(validateForm.get('icon')?.value)) {
                  <span nz-icon [nzType]="validateForm.get('icon')?.value!"></span>
                } @else {
                  {{ validateForm.get('icon')?.value || '📄' }}
                }
              </div>
            </ng-template>
          </div>

          <div class="quick-icons-row">
            <div class="quick-group">
              <span class="q-icon" (click)="setIcon('📘')" nz-tooltip nzTooltipTitle="Книга"
                >📘</span
              >
              <span class="q-icon" (click)="setIcon('🛠️')" nz-tooltip nzTooltipTitle="Инструменты"
                >🛠️</span
              >
              <span class="q-icon" (click)="setIcon('⚡')" nz-tooltip nzTooltipTitle="Быстро"
                >⚡</span
              >
              <span class="q-icon" (click)="setIcon('💡')" nz-tooltip nzTooltipTitle="Идея"
                >💡</span
              >
            </div>
            <nz-divider nzType="vertical"></nz-divider>
            <div class="quick-group">
              <span
                class="q-icon"
                (click)="setIcon('appstore')"
                nz-tooltip
                nzTooltipTitle="Appstore"
                ><span nz-icon nzType="appstore"></span
              ></span>
              <span
                class="q-icon"
                (click)="setIcon('setting')"
                nz-tooltip
                nzTooltipTitle="Настройки"
                ><span nz-icon nzType="setting"></span
              ></span>
              <span class="q-icon" (click)="setIcon('info-circle')" nz-tooltip nzTooltipTitle="Инфо"
                ><span nz-icon nzType="info-circle"></span
              ></span>
              <span
                class="q-icon"
                (click)="setIcon('question-circle')"
                nz-tooltip
                nzTooltipTitle="Помощь"
                ><span nz-icon nzType="question-circle"></span
              ></span>
            </div>
          </div>
          <p class="icon-help">Введите название иконки Ant или любой эмодзи</p>
        </nz-form-control>
      </nz-form-item>

      <div class="footer-actions" style="text-align: right;">
        <button
          nz-button
          nzType="default"
          (click)="cancel()"
          type="button"
          style="margin-right: 8px;"
        >
          Отмена
        </button>
        <button nz-button nzType="primary" [disabled]="!validateForm.valid">Создать</button>
      </div>
    </form>
  `,
  styles: [
    `
      .icon-input-wrapper {
        margin-bottom: 12px;
      }
      .current-icon-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 16px;
        color: #1890ff;
      }
      .quick-icons-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fafafa;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #f0f0f0;
      }
      .quick-group {
        display: flex;
        gap: 12px;
      }
      .q-icon {
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        transition: all 0.2s;
        color: #595959;
      }
      .q-icon:hover {
        transform: scale(1.3);
        color: #1890ff;
      }
      .icon-help {
        margin: 8px 0 0;
        font-size: 11px;
        color: #8c8c8c;
      }
      .footer-actions {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
      }
    `,
  ],
})
export class HelpCreateModalComponent {
  modalRef = inject(NzModalRef);
  validateForm = inject(FormBuilder).group({
    helpId: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    title: ['', [Validators.required]],
    subtitle: [''],
    icon: ['📄'],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      this.modalRef.close(this.validateForm.value);
    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }

  setIcon(icon: string): void {
    this.validateForm.patchValue({ icon });
  }

  isAntIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return icon.length > 2 && !icon.includes('/') && !icon.includes('.');
  }
}

@Component({
  selector: 'av-help-rename-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <div style="padding: 10px 0;">
      <nz-form-item>
        <nz-form-label [nzSpan]="8">Старое имя</nz-form-label>
        <nz-form-control [nzSpan]="16">
          <input nz-input [value]="oldName" disabled />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item style="margin-top: 15px;">
        <nz-form-label [nzSpan]="8" nzRequired>Новое имя (ID)</nz-form-label>
        <nz-form-control [nzSpan]="16" nzErrorTip="Только латиница, цифры и дефис">
          <input
            nz-input
            [formControl]="newNameControl"
            placeholder="Например: new-guide-name"
            (keyup.enter)="submit()"
          />
        </nz-form-control>
      </nz-form-item>

      <div
        style="margin-top: 20px; color: #faad14; font-size: 12px; background: #fffbe6; padding: 8px; border: 1px solid #ffe58f; border-radius: 4px;"
      >
        ⚠️ Смена ID может привести к потере связи со справкой в коде. Будьте внимательны!
      </div>

      <div class="footer-actions" style="text-align: right; margin-top: 20px;">
        <button nz-button nzType="default" (click)="cancel()" style="margin-right: 8px;">
          Выйти
        </button>
        <button
          nz-button
          nzType="primary"
          [disabled]="!newNameControl.valid || newNameControl.value === oldId"
          (click)="submit()"
        >
          Переименовать
        </button>
      </div>
    </div>
  `,
})
export class HelpRenameModalComponent {
  private modalRef = inject(NzModalRef);
  private data = inject(NZ_MODAL_DATA);

  oldName: string;
  oldId: string;
  newNameControl: FormControl;

  constructor() {
    this.oldName = this.data.oldName;
    this.oldId = this.oldName.replace('.json', '');

    this.newNameControl = new FormControl(this.oldId, [
      Validators.required,
      Validators.pattern(/^[a-z0-9-]+$/),
    ]);
  }

  submit(): void {
    if (this.newNameControl.valid) {
      this.modalRef.close(this.newNameControl.value);
    }
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}

@Component({
  selector: 'av-help-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzTableModule,
    NzIconModule,
    NzInputModule,
    NzToolTipModule,
    NzDividerModule,
    NzModalModule,
  ],
  template: ` <div class="management-container">
    <div class="header-section">
      <div class="title-row">
        <h1 class="page-title">Создание и управление справкой</h1>
        <div class="header-buttons">
          <button nz-button nzType="default" (click)="loadHelpFiles()" [nzLoading]="loading()">
            <span nz-icon nzType="sync"></span> Сканировать справки
          </button>
          <button nz-button nzType="primary" (click)="createNewHelp()">
            <span nz-icon nzType="plus"></span> Создать новую справку
          </button>
        </div>
      </div>

      <div class="search-row">
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input
            type="text"
            nz-input
            placeholder="Поиск по ID или заголовку..."
            [(ngModel)]="searchQuery"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </div>
    </div>

    <nz-card class="table-card">
      <nz-table #basicTable [nzData]="filteredFiles()" [nzLoading]="loading()">
        <thead>
          <tr>
            <th nzWidth="60px">Иконка</th>
            <th nzWidth="200px">ID (Файл)</th>
            <th>Заголовок / Подзаголовок</th>
            <th nzWidth="120px">Файл</th>
            <th nzWidth="150px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let file of basicTable.data">
            <td>
              <div class="icon-preview-cell">
                @if (isAntIcon(file.icon)) {
                  <span nz-icon [nzType]="file.icon"></span>
                } @else {
                  {{ file.icon || '📄' }}
                }
              </div>
            </td>
            <td>
              <code>{{ file.name }}</code>
            </td>
            <td>
              <div class="title-cell">
                <strong>{{ file.title || 'Без названия' }}</strong>
                <p class="subtitle-text">{{ file.subtitle }}</p>
              </div>
            </td>
            <td style="text-align: center;">
              <button
                nz-button
                nzType="default"
                nzShape="circle"
                (click)="renameHelpWithModal(file)"
                nz-tooltip
                nzTooltipTitle="Переименовать файл"
              >
                <span nz-icon nzType="file-text" style="color: #1890ff;"></span>
              </button>
            </td>
            <td>
              <div class="actions">
                <button
                  nz-button
                  nzType="text"
                  (click)="openHelp(file, 'view')"
                  nz-tooltip
                  nzTooltipTitle="Просмотр"
                >
                  <span nz-icon nzType="eye"></span>
                </button>
                <button
                  nz-button
                  nzType="text"
                  (click)="duplicateHelp(file)"
                  nz-tooltip
                  nzTooltipTitle="Создать дубликат (JSON)"
                >
                  <span nz-icon nzType="copy"></span>
                </button>
                <button
                  nz-button
                  nzType="text"
                  (click)="exportToTxt(file)"
                  nz-tooltip
                  nzTooltipTitle="Создать документацию (.txt)"
                >
                  <span nz-icon nzType="file-text"></span>
                </button>
                <button
                  nz-button
                  nzType="text"
                  (click)="openHelp(file, 'edit')"
                  nz-tooltip
                  nzTooltipTitle="Редактировать"
                >
                  <span nz-icon nzType="edit"></span>
                </button>
                <button
                  nz-button
                  nzType="text"
                  nzDanger
                  (click)="deleteHelp(file)"
                  nz-tooltip
                  nzTooltipTitle="Удалить"
                >
                  <span nz-icon nzType="delete"></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <!-- Блок документации -->
    <div class="documentation-section">
      <h2 class="doc-title"><span nz-icon nzType="book"></span> Руководство разработчика</h2>

      <div class="doc-grid">
        <!-- Как подключить -->
        <nz-card nzTitle="1. Подключение в коде" class="doc-card">
          <p>
            <b>Чтобы быстро вызвать справку из любой части программы:</b> используйте этот кусок
            кода в вашем компоненте.
          </p>
          <pre><code>// Чтобы это заработало, добавьте:
private modal = inject(NzModalService);

openHelp() &lcub;
  this.modal.create(&lcub;
    nzContent: HelpUniversalModalComponent,
    nzData: &lcub;
      helpId: 'my-guide', // Чтобы открылся нужный файл
      initialMode: 'view'
    &rcub;
  &rcub;);
&rcub;</code></pre>
        </nz-card>

        <!-- Структура файла -->
        <nz-card nzTitle="2. Структура JSON" class="doc-card">
          <p>
            <b>Чтобы компьютер понял ваш файл:</b> он должен иметь строго определенный вид. Просто
            скопируйте это:
          </p>
          <pre><code>&lcub;
  "helpId": "id-файла",
  "title": "Главный заголовок",
  "reference": [
    &lcub;
      "id": "r1",
      "title": "Общая справка",
      "content": "Этот текст виден сразу...",
      "type": "standard"
    &rcub;
  ],
  "blocks": [
    &lcub;
      "id": "b1",
      "title": "Дополнительно",
      "content": "Этот текст скрыт за иконкой Глаз...",
      "type": "standard"
    &rcub;
  ]
&rcub;</code></pre>
          <p>
            <small
              >💡 <b>Чтобы создать меню слева:</b> просто добавляйте новые объекты в список
              <code>blocks</code>.</small
            >
          </p>
        </nz-card>

        <!-- Иконки -->
        <nz-card nzTitle="3. Выбор иконки" class="doc-card">
          <p>
            <b>Чтобы ваша справка не была скучной:</b> добавьте ей узнаваемую иконку одним из
            способов:
          </p>
          <ul>
            <li>
              <strong>Чтобы использовать эмодзи:</strong> просто вставьте ⚡ или 📘 в поле
              <code>icon</code>.
            </li>
            <li>
              <strong>Чтобы использовать системную иконку:</strong> напишите её название, например
              <code>rocket</code>.
            </li>
            <li>
              <strong>Чтобы использовать свой файл:</strong> укажите путь, например
              <code>assets/icons/star.svg</code>.
            </li>
          </ul>
        </nz-card>

        <!-- Как это работает -->
        <nz-card nzTitle="4. Порядок действий (Ваш план)" class="doc-card">
          <p><b>Чтобы всё заработало с первого раза, сделайте это:</b></p>
          <ol>
            <li>
              <strong>Как создать файл?</strong>
              Нажмите синюю кнопку
              <span style="color: #1890ff">«Создать новую справку»</span> вверху этой страницы. Или
              просто создайте пустой файл <code>название.json</code> в папке
              <code>src/assets/help-data</code>.
            </li>
            <li>
              <strong>Как наполнить?</strong>
              Скопируйте текст из примера №2 и вставьте в ваш файл. Не забудьте поменять
              <code>helpId</code> на название вашего файла.
            </li>
            <li>
              <strong>Как вызвать из кода?</strong>
              Используйте код из <b>примера №1</b>. Главное — укажите там ID вашего файла.
            </li>
            <li>
              <strong>Что будет после сканирования?</strong>
              Нажмите кнопку <span style="color: #52c41a">«Сканировать»</span> — ваша новая справка
              появится в таблице выше.
            </li>
            <li>
              <strong>Как увидеть результат?</strong>
              В таблице выше найдите вашу справку и нажмите кнопку
              <span nz-icon nzType="eye"></span> (Просмотр). Она откроется так, как её увидит
              пользователь.
            </li>
          </ol>
        </nz-card>

        <!-- Типы блоков -->
        <nz-card nzTitle="5. Цветные блоки" class="doc-card">
          <p>
            <b>Чтобы выделить важную мысль цветом:</b> поменяйте значение в поле
            <code>"type"</code>:
          </p>

          <div
            style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px dashed #d9d9d9;"
          >
            <ul style="margin-bottom: 0;">
              <li>
                <code style="color: #1890ff; font-weight: bold;">"info"</code> — Блок станет
                <b>голубым</b>. Полезно для «Кстати...» или «Заметьте...».
              </li>
              <li>
                <code style="color: #faad14; font-weight: bold;">"warning"</code> — Блок станет
                <b>желтым</b>. Идеально для «Внимание!» или «Осторожно!».
              </li>
              <li>
                <code style="color: #ff4d4f; font-weight: bold;">"danger"</code> — Блок станет
                <b>красным</b>. Для самых важных запретов или ошибок.
              </li>
            </ul>
          </div>

          <p style="margin-top: 15px;">
            <small
              >✨ <b>Результат:</b> Как только вы сохраните файл и нажмете «Сканировать», цвет блока
              изменится мгновенно!</small
            >
          </p>
        </nz-card>
      </div>
    </div>
  </div>`,
  styles: [
    `
      .management-container {
        padding: 24px;
        max-width: 1300px;
        margin: 0 auto;
      }

      .header-section {
        margin-bottom: 24px;
      }

      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .header-buttons {
        display: flex;
        gap: 12px;
      }

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }

      .search-row {
        max-width: 400px;
      }

      .table-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .file-icon {
        font-size: 24px;
      }

      .title-cell {
        display: flex;
        flex-direction: column;
      }

      .subtitle-text {
        margin: 0;
        font-size: 12px;
        color: #8c8c8c;
      }

      .actions {
        display: flex;
        gap: 4px;
      }

      code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 4px;
        color: #e83e8c;
        font-size: 12px;
      }

      /* Документация */
      .documentation-section {
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
      }

      .doc-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #262626;
      }

      .doc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
        gap: 20px;
      }

      .doc-card {
        height: 100%;
        border-radius: 8px;
      }

      .doc-card ::ng-deep .ant-card-head-title {
        font-weight: 600;
        color: #1890ff;
      }

      pre {
        background: #282c34;
        color: #abb2bf;
        padding: 12px;
        border-radius: 6px;
        font-size: 13px;
        overflow-x: auto;
        margin: 10px 0;
      }

      pre code {
        background: transparent;
        color: inherit;
        padding: 0;
      }

      .icon-preview-cell {
        font-size: 20px;
        color: #1890ff;
        display: flex;
        justify-content: center;
      }

      ul {
        padding-left: 20px;
        margin: 0;
      }

      li {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class HelpManagementComponent implements OnInit {
  private iconLab = inject(IconDataService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private http = inject(HttpClient);

  helpFiles = signal<any[]>([]);
  loading = signal(false);
  searchQuery = '';

  // Пути теперь берутся из environment
  helpDataPath = environment.help.storagePath;
  helpAssetsUrl = environment.help.assetsPath;

  ngOnInit(): void {
    this.loadHelpFiles();
  }

  loadHelpFiles(): void {
    this.loading.set(true);
    this.iconLab.browseFileSystem(this.helpDataPath).subscribe({
      next: (files: any[]) => {
        const jsonFiles = files.filter((f) => f.name.endsWith('.json'));

        const detailPromises = jsonFiles.map((file) => {
          // Читаем контент файла напрямую через API бэкенда
          return this.iconLab
            .readFile(`${this.helpDataPath}/${file.name}`)
            .toPromise()
            .then((text) => {
              try {
                const content = JSON.parse(text || '{}');
                return {
                  ...file,
                  title: content.title,
                  subtitle: content.subtitle,
                  icon: content.icon,
                  fullData: content,
                };
              } catch (e) {
                console.error('Error parsing JSON for', file.name, e);
                return { ...file, title: 'Ошибка JSON', subtitle: file.name };
              }
            })
            .catch((err) => {
              console.error('Error loading help file details', file.name, err);
              return { ...file, title: 'Ошибка загрузки', subtitle: file.name };
            });
        });

        Promise.all(detailPromises).then((results) => {
          this.helpFiles.set(results);
          this.loading.set(false);
          if (results.length > 0) {
            this.message.success(`Найдено справок: ${results.length}`);
          }
        });
      },
      error: () => {
        this.message.error('Не удалось загрузить список справок');
        this.loading.set(false);
      },
    });
  }

  filteredFiles() {
    if (!this.searchQuery) return this.helpFiles();
    const q = this.searchQuery.toLowerCase();
    return this.helpFiles().filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.title && f.title.toLowerCase().includes(q)) ||
        (f.subtitle && f.subtitle.toLowerCase().includes(q)),
    );
  }

  openHelp(file: any, mode: 'view' | 'edit'): void {
    const modalRef = this.modal.create({
      nzTitle: undefined,
      nzContent: HelpUniversalModalComponent,
      nzData: {
        ...file.fullData,
        initialMode: mode,
        docPath: `${this.helpDataPath}/${file.name}`,
      },
      nzFooter: null,
      nzWidth: file.fullData?.width || 1000,
      nzCentered: true,
      nzClassName: 'help-universal-modal-wrapper',
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadHelpFiles();
      }
    });
  }

  createNewHelp(): void {
    const modal = this.modal.create({
      nzTitle: 'Новая универсальная справка',
      nzContent: HelpCreateModalComponent,
      nzFooter: null,
      nzWidth: 500,
    });

    modal.afterClose.subscribe((formData) => {
      if (formData) {
        const { helpId, title, subtitle, icon } = formData;
        const newHelpData = {
          helpId,
          title,
          subtitle,
          icon,
          width: 1000,
          reference: [
            {
              id: 'r1',
              title: 'Общая справка',
              content: '<p>Эта информация всегда видна пользователю при открытии.</p>',
              type: 'standard',
            },
          ],
          blocks: [
            {
              id: 'b1',
              title: 'Подробности',
              content: '<p>А эти подробности скрыты по умолчанию.</p>',
              type: 'standard',
            },
          ],
          docPath: `${this.helpDataPath}/${helpId}.json`,
        };

        this.iconLab
          .saveToDisk(`${helpId}.json`, this.helpDataPath, JSON.stringify(newHelpData, null, 2))
          .subscribe({
            next: () => {
              this.modal.success({
                nzTitle: 'Справка успешно создана!',
                nzContent: `
                  <div style="padding-top: 10px;">
                    <p><b>ID:</b> ${helpId}</p>
                    <p><b>Заголовок:</b> ${title}</p>
                    <p><b>Путь на диске:</b> <br><code style="font-size: 11px;">${newHelpData.docPath}</code></p>
                  </div>
                `,
                nzOnOk: () => {
                  this.loadHelpFiles();
                  this.openHelp({ name: `${helpId}.json`, fullData: newHelpData }, 'edit');
                },
              });
            },
            error: () => this.message.error('Ошибка при сохранении файла'),
          });
      }
    });
  }

  renameHelpWithModal(file: any): void {
    const modal = this.modal.create({
      nzTitle: 'Управление файлом справки',
      nzContent: HelpRenameModalComponent,
      nzData: { oldName: file.name },
      nzFooter: null,
      nzWidth: 400,
    });

    modal.afterClose.subscribe((newId) => {
      if (newId) {
        const newName = `${newId}.json`;
        const oldPath = `${this.helpDataPath}/${file.name}`;
        const newPath = `${this.helpDataPath}/${newName}`;

        this.iconLab.renameFile(oldPath, newPath).subscribe({
          next: () => {
            this.modal.success({
              nzTitle: 'Успех!',
              nzContent: `Файл <b>${file.name}</b> успешно переименован в <b>${newName}</b>.`,
              nzOnOk: () => this.loadHelpFiles(),
            });
          },
          error: (err) => {
            this.modal.error({
              nzTitle: 'Ошибка переименования',
              nzContent: err.error?.message || 'Не удалось переименовать файл на сервере.',
            });
          },
        });
      }
    });
  }

  renameFile(file: any): void {
    const oldName = file.name;
    const oldId = oldName.replace('.json', '');

    this.modal.confirm({
      nzTitle: 'Переименование файла',
      nzContent: `
        <p>Введите новое имя файла (ID) для <b>${oldName}</b>:</p>
        <input type="text" id="new-help-id" class="ant-input" value="${oldId}" placeholder="Только латинские буквы, цифры и дефис">
        <p style="margin-top: 10px; color: #ff4d4f; font-size: 12px;">
          ⚠️ Внимание: если вы измените ID, ссылки на эту справку в коде (helpId) нужно будет обновить вручную!
        </p>
      `,
      nzOnOk: () => {
        const input = document.getElementById('new-help-id') as HTMLInputElement;
        const newId = input.value.trim();

        if (!newId || newId === oldId) return;
        if (!/^[a-z0-9-]+$/.test(newId)) {
          this.message.error('Неверный формат ID (только a-z, 0-9 и дефис)');
          return false;
        }

        const newName = `${newId}.json`;
        const oldPath = `${this.helpDataPath}/${oldName}`;
        const newPath = `${this.helpDataPath}/${newName}`;

        this.iconLab.renameFile(oldPath, newPath).subscribe({
          next: () => {
            this.message.success('Файл успешно переименован');
            this.loadHelpFiles();
          },
          error: (err) => {
            console.error('Rename error', err);
            this.message.error(err.error?.message || 'Ошибка при переименовании');
          },
        });
        return true;
      },
    });
  }

  duplicateHelp(file: any): void {
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    const oldId = file.name.replace('.json', '');
    const newId = `${oldId}-${timestamp}`;
    const newFilename = `${newId}.json`;

    const newContent = {
      ...file.fullData,
      helpId: newId,
    };

    this.iconLab
      .saveToDisk(newFilename, `${this.helpDataPath}/arhiv`, JSON.stringify(newContent, null, 2))
      .subscribe({
        next: () => {
          this.message.success(`Дубликат создан: ${newFilename}`);
          this.loadHelpFiles();
        },
        error: () => this.message.error('Не удалось создать дубликат'),
      });
  }

  exportToTxt(file: any): void {
    const oldId = file.name.replace('.json', '');
    const newFilename = `${oldId}.txt`;

    let text = `==========================================\n`;
    text += `ДОКУМЕНТАЦИЯ: ${file.title || oldId}\n`;
    text += `ID: ${oldId}\n`;
    text += `Подзаголовок: ${file.subtitle || '-'}\n`;
    text += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
    text += `==========================================\n\n`;

    const processBlocks = (blocks: any[], sectionTitle: string) => {
      if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return '';
      let section = `>>> ${sectionTitle} <<<\n\n`;
      blocks.forEach((block: any) => {
        section += `[ ${block.title} ]\n`;
        section += `------------------------------------------\n`;
        // Базовая очистка HTML для TXT
        const plainContent = (block.content || '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<\/li>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&mdash;/g, '—')
          .replace(/&ndash;/g, '–')
          .replace(/&laquo;/g, '«')
          .replace(/&raquo;/g, '»')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&');

        section += `${plainContent.trim()}\n\n`;
      });
      return section + `\n`;
    };

    const data = file.fullData;
    if (data.reference) text += processBlocks(data.reference, 'БАЗОВАЯ СПРАВКА / REFERENCE');
    if (data['blocks-main']) text += processBlocks(data['blocks-main'], 'ОСНОВНЫЕ РАЗДЕЛЫ (MAIN)');
    if (data['blocks-front']) text += processBlocks(data['blocks-front'], 'ФРОНТЕНД (FRONT)');
    if (data['blocks-server'])
      text += processBlocks(data['blocks-server'], 'СЕРВЕР / БЭКЕНД (SERVER)');

    // Если есть старый формат блоков
    if (data.blocks) text += processBlocks(data.blocks, 'ДОПОЛНИТЕЛЬНЫЕ БЛОКИ');

    this.iconLab.saveToDisk(newFilename, `${this.helpDataPath}/txt`, text).subscribe({
      next: () => {
        this.message.success(`Документация сохранена: ${newFilename}`);
        this.loadHelpFiles();
      },
      error: () => this.message.error('Не удалось сохранить TXT файл'),
    });
  }

  deleteHelp(file: any): void {
    this.modal.confirm({
      nzTitle: 'Удаление справки',
      nzContent: `Вы действительно хотите удалить "${file.title || file.name}"? Файл <b>${file.name}</b> будет безвозвратно удален с диска.`,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzOnOk: () => {
        const fullPath = `${this.helpDataPath}/${file.name}`;

        this.iconLab.deleteFile(fullPath).subscribe({
          next: () => {
            this.message.success('Файл удален');
            this.loadHelpFiles();
          },
          error: (err) => {
            console.error('Delete error', err);
            this.message.error('Ошибка при удалении файла');
          },
        });
      },
    });
  }

  isAntIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return icon.length > 2 && !icon.includes('/') && !icon.includes('.');
  }
}
