import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'app-program-add-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTimelineModule,
    NzAlertModule,
    NzTagModule,
    NzDividerModule,
    NzGridModule,
    NzIconModule,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Архитектурный гайд: Модуль создания программ"
        subtitle="Полное руководство по реализации связей между БД и UI (Frontend + Backend)."
        icon="🏗️"
        [componentPath]="'src/app/pages/help/program-add-help/program-add-help.component.ts'"
      ></av-help-path-header>

      <nz-alert
        nzType="warning"
        nzMessage="Важное правило для Junior"
        nzDescription="Никогда не начинай писать код формы, пока не поймешь структуру БД. Каждое поле ввода на фронте — это колонка в таблице или связь. Ошибешься в типе данных — сломаешь транзакцию."
        nzShowIcon
        class="main-alert"
      ></nz-alert>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. PREREQUISITES & STATE -->
        <nz-tab nzTitle="📦 1. Подготовка (State & Dictionaries)">
          <div class="tab-content">
            <!-- Таблица справочников -->
            <nz-card nzTitle="Справочники (Dictionaries) — Что грузим в State?">
              <p>
                Для работы формы создания программы в памяти браузера должны быть загружены
                следующие коллекции:
              </p>

              <nz-table
                #dictionariesTable
                [nzData]="dictionariesInfo"
                [nzFrontPagination]="false"
                nzSize="small"
              >
                <thead>
                  <tr>
                    <th>Справочник</th>
                    <th>Модель БД (C#)</th>
                    <th>Зачем нужен в форме?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of dictionariesTable.data">
                    <td>
                      <nz-tag [nzColor]="item.color">{{ item.name }}</nz-tag>
                    </td>
                    <td>
                      <code>{{ item.model }}</code>
                    </td>
                    <td>{{ item.reason }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <!-- Формирование URL (Hierarchical Strategy) -->
            <nz-card nzTitle="🔗 Формирование URL (Hierarchical Strategy)" class="premium-card" style="margin-top: 24px; border-left: 4px solid #1890ff;">
              <ng-container>
                <div class="url-info">
                  <p>
                    В системе Aurora v3.5 принят <b>Вариант 1: Иерархический (через Платформу)</b>.
                    Это самый «чистый» и премиальный вариант, где платформа становится частью пути.
                  </p>
                  
                  <ng-container>
                    <div class="example-box" style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <div class="example-item" style="margin-bottom: 8px;">
                        <b style="color: #64748b; width: 80px; display: inline-block;">Windows:</b>
                        <code style="color: #0f172a;">site.com/windows/browsers/chrome</code>
                      </div>
                      <div class="example-item" style="margin-bottom: 8px;">
                        <b style="color: #64748b; width: 80px; display: inline-block;">Android:</b>
                        <code style="color: #0f172a;">site.com/android/browsers/chrome</code>
                      </div>
                      <div class="example-item">
                        <b style="color: #64748b; width: 80px; display: inline-block;">macOS:</b>
                        <code style="color: #0f172a;">site.com/macos/browsers/chrome</code>
                      </div>
                    </div>
                  </ng-container>

                  <div class="rule-box" style="margin-top: 20px; padding: 16px; background: #e6f7ff; border-radius: 12px;">
                    <h4 style="margin-top: 0; color: #0050b3;">🛠 Правила и требования:</h4>
                    <ul style="margin-bottom: 0;">
                      <li>Slug программы уникален <b>только</b> в связке с Основной платформой (<code>Slug + MainPlatformId</code>).</li>
                      <li>Полный путь формируется по иерархии: <code>/{{ '{' }}platform{{ '}' }}/{{ '{' }}category{{ '}' }}/{{ '{' }}subcategory{{ '}' }}/{{ '{' }}program-slug{{ '}' }}</code>.</li>
                      <li>Данный подход позволяет создавать отдельные страницы для одной и той же программы под разные ОС с уникальным контентом и SEO.</li>
                      <li>При изменении иерархии (смене категории или платформы) система должна обеспечивать автоматический 301-редирект.</li>
                    </ul>
                  </div>
                </div>
              </ng-container>
            </nz-card>

            <!-- Полная таблица полей -->
            <nz-card nzTitle="Полный перечень полей (Database Schema Mapping)">
              <p>
                Ниже приведена полная таблица всех полей, которые должны быть обработаны формой
                <b>Add Program</b>.
              </p>

              <nz-table
                #allFieldsTable
                [nzData]="allFieldsData"
                [nzFrontPagination]="false"
                nzSize="small"
                [nzScroll]="{ y: '600px' }"
              >
                <thead>
                  <tr>
                    <th nzWidth="60px">№</th>
                    <th nzWidth="220px">Имя поля (Property)</th>
                    <th>Описание и требования</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let field of allFieldsTable.data">
                    <td>{{ field.id }}</td>
                    <td>
                      <code [style.color]="field.isLinked ? '#1890ff' : '#c41d7f'">{{
                        field.name
                      }}</code>
                    </td>
                    <td>
                      <div [innerHTML]="field.description"></div>
                      <div *ngIf="field.isLinked" style="margin-top: 4px;">
                        <nz-tag nzColor="processing" nzSize="small"
                          >Связанная таблица / Relation</nz-tag
                        >
                      </div>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <div class="logic-box bg-blue">
              <b>💡 Архитектурный совет:</b> Используйте <code>combineLatest</code> для загрузки
              всех справочников разом. Форма не должна отображаться, пока
              <code>prerequisitesLoaded$</code> не станет <code>true</code>.
            </div>
          </div>
        </nz-tab>

        <!-- 2. FRONT-END ARCHITECTURE -->
        <nz-tab nzTitle="🌐 2. Front-end (Angular Reactive Forms)">
          <div class="tab-content">
            <nz-card nzTitle="Структура Reactive Form">
              <p>Дерево формы должно в точности повторять структуру DTO:</p>
              <div class="form-tree">
                <ul>
                  <li>
                    <code>form</code> (Root)
                    <ul>
                      <li>
                        Base:
                        <code>canonicalName, slug, categoryId, subCategoryId, developerId...</code>
                      </li>
                      <li><b>Localizations (FormArray)</b>: Массив объектов локализации.</li>
                      <li><b>Platforms (FormArray)</b>: Связи с ОС и ссылками.</li>
                      <li>
                        <b>Media (Files)</b>: Иконка, скриншоты, видео (через Upload сервисы).
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. UI ADD (Business Logic & Details) -->
        <nz-tab nzTitle="🎨 3. UI Add (Логика и UI)">
          <div class="tab-content">
            <nz-card nzTitle="Предложения по реализации UI для создания программ">
              <p>
                Для создания качественного и удобного интерфейса (Premium UI), рекомендуется
                реализовать следующие элементы:
              </p>

              <nz-table
                #uiTable
                [nzData]="uiAddProposals"
                [nzFrontPagination]="false"
                nzSize="middle"
              >
                <thead>
                  <tr>
                    <th nzWidth="80px">№</th>
                    <th nzWidth="250px">Элемент</th>
                    <th>Описание реализации</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of uiTable.data">
                    <td>
                      <b>{{ item.id }}</b>
                    </td>
                    <td>
                      <nz-tag nzColor="blue">{{ item.element }}</nz-tag>
                    </td>
                    <td>{{ item.description }}</td>
                  </tr>
                </tbody>
              </nz-table>

              <div class="logic-box bg-blue" style="margin-top: 20px;">
                <b>💡 Совет для Junior:</b> Всегда думай о пользователе (контент-менеджере). Если
                ему нужно сделать 10 кликов там, где можно 2 — интерфейс плохой. Используй
                компоненты <code>ng-zorro-antd</code> для стандартных задач.
              </div>
            </nz-card>

            <div class="ui-details-grid">
              <nz-card nzTitle="🧠 Логика работы (Business Logic)" class="detail-card logic-card">
                <ul class="checklist">
                  <li>
                    <b>Two-Step Creation:</b> Сначала сохраняется основная запись, затем связанные
                    модели.
                  </li>
                  <li>
                    <b>Language Fallback:</b> Если поля пусты, данные тянутся из English Master.
                  </li>
                  <li>
                    <b>SEO Automation:</b> Автозаполнение Meta Title/Desc на основе
                    Name/Description.
                  </li>
                  <li><b>Slug Logic:</b> Автогенерация с механизмом Lock.</li>
                </ul>
              </nz-card>
              <nz-card nzTitle="📝 Текстовый редактор" class="detail-card tinymce-card">
                <p>Используйте <code>AvTinymceControlComponent</code> для описаний.</p>
              </nz-card>
            </div>
          </div>
        </nz-tab>

        <!-- 4. STEP BY STEP GUIDE -->
        <nz-tab nzTitle="🛠️ Пошаговый план (Steps 1-13)">
          <div class="tab-content">
            <div nz-row [nzGutter]="24">
              <div nz-col [nzSpan]="12">
                <nz-card nzTitle="🗺️ Карта Бэкенд-модуля (DAL & API)" class="map-card">
                  <pre class="tree-view">
[DAL] Слой доступа к данным
├── 📂 Models/Aggregator/
│   ├── 📄 DeveloperOfAggregator.cs
│   └── 📄 Localizations/Devel...Localization.cs
├── 📂 Repositories/
│   ├── 📄 DeveloperOfAggregatorRepository.cs
│   └── 📄 Interfaces/IDeveloperOfAgg...Repository.cs
├── 📄 AppDbContext.Aggregator.cs
└── 📄 AggregatorModelConfiguration.cs
                  </pre
                  >
                </nz-card>
              </div>

              <div nz-col [nzSpan]="12">
                <nz-card nzTitle="🗺️ Карта Фронтенд-модуля" class="map-card frontend-map">
                  <pre class="tree-view">
src/app/AGREGATOR/PAGES/SPRAVKA/DeveloperOfAggregatorPage/
├── 📂 components/
├── 📂 models/
├── 📂 services/
└── 📄 end-points.ts
                  </pre
                  >
                </nz-card>
              </div>
            </div>

            <nz-timeline nzMode="alternate" class="steps-timeline">
              <nz-timeline-item nzColor="blue">
                <nz-card nzTitle="Step 1-3: Backend Setup">
                  <p>Создание Entity, Repositories, Services и Controllers по стандарту v3.5.</p>
                </nz-card>
              </nz-timeline-item>
              <nz-timeline-item nzColor="green">
                <nz-card nzTitle="Step 4-5: Frontend Setup">
                  <p>Создание API/State сервисов и UI компонентов с поддержкой Сигналов.</p>
                </nz-card>
              </nz-timeline-item>
              <nz-timeline-item nzColor="orange">
                <nz-card nzTitle="Step 6-13: Advanced Logic">
                  <p>Реализация Fallbacks, SEO, Поиска, Корзины и Обработки ошибок.</p>
                </nz-card>
              </nz-timeline-item>
            </nz-timeline>

            <nz-divider
              nzText="Детализация реализации (Actions & Layout)"
              nzOrientation="left"
            ></nz-divider>

            <div nz-row [nzGutter]="24">
              <div nz-col [nzSpan]="12">
                <nz-table
                  #actionsTable
                  [nzData]="actionsDetails"
                  [nzFrontPagination]="false"
                  nzSize="small"
                >
                  <thead>
                    <tr>
                      <th>Действие</th>
                      <th>Метод State</th>
                      <th>UX</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of actionsTable.data">
                      <td><i nz-icon [nzType]="item.icon"></i> {{ item.action }}</td>
                      <td>
                        <code>{{ item.method }}</code>
                      </td>
                      <td>{{ item.ux }}</td>
                    </tr>
                  </tbody>
                </nz-table>
              </div>
              <div nz-col [nzSpan]="12">
                <nz-card nzTitle="DTO & Entity Mapping" nzSize="small">
                  <pre class="code-snippet">{{ csDetailedEntity }}</pre>
                </nz-card>
              </div>
            </div>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .help-container {
        padding: 32px;
        max-width: 1400px;
        margin: 0 auto;
      }
      .main-alert {
        margin: 24px 0;
      }
      .tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px 0;
      }
      .logic-box {
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        border-left: 4px solid #52c41a;
        font-size: 13px;
      }
      .bg-blue {
        background: #f0f7ff;
        border-left-color: #1890ff;
      }
      .form-tree {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        font-family: monospace;
      }
      code {
        background: #f5f5f5;
        padding: 2px 5px;
        border-radius: 4px;
        color: #c41d7f;
      }
      .checklist {
        list-style: disc;
        padding-left: 20px;
      }
      .checklist li {
        margin-bottom: 8px;
        font-size: 13px;
      }
      .ui-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .detail-card {
        height: 100%;
        border-top: 4px solid #1890ff;
      }
      .logic-card {
        border-top-color: #722ed1;
      }
      .tinymce-card {
        border-top-color: #fa8c16;
      }
      .tree-view {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 8px;
        font-size: 12px;
        overflow: auto;
      }
      .code-snippet {
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #dee2e6;
        font-size: 12px;
        margin: 8px 0;
        overflow: auto;
      }
      .steps-timeline {
        margin-top: 32px;
      }
      .map-card {
        border-top: 4px solid #faad14;
      }
      .frontend-map {
        border-top-color: #52c41a;
      }
    `,
  ],
})
export class ProgramAddHelpComponent {
  dictionariesInfo = [
    {
      name: 'Категории',
      model: 'CategoryOfAggregator',
      reason: 'Основные разделы каталога.',
      color: 'blue',
    },
    {
      name: 'Разработчики',
      model: 'DeveloperOfAggregator',
      reason: 'Авторы программного обеспечения.',
      color: 'cyan',
    },
    {
      name: 'Языки',
      model: 'LanguageOfAggregator',
      reason: 'Список языков для локализации.',
      color: 'geekblue',
    },
    {
      name: 'Платформы',
      model: 'PlatformOfAggregator',
      reason: 'ОС (Windows, MacOS, Android...).',
      color: 'purple',
    },
    { name: 'Теги', model: 'TagOfAggregator', reason: 'Функциональные метки.', color: 'magenta' },
    {
      name: 'Типы лицензий',
      model: 'LicenseTypeOfAggregator',
      reason: 'Free, Trial, Shareware и т.д.',
      color: 'orange',
    },
    {
      name: 'Источники',
      model: 'AggregatorSource',
      reason: 'Магазины и сайты (Steam, Play Market).',
      color: 'gold',
    },
    {
      name: 'Группы тегов',
      model: 'CategoryTagOfAggregator',
      reason: 'Для группировки тегов в UI.',
      color: 'volcano',
    },
  ];

  allFieldsData = [
    { id: 1, name: 'CanonicalName', description: 'Системное название.' },
    { id: 2, name: 'Slug', description: 'URL-префикс.' },
    { id: 3, name: 'CategoryId', description: 'ID основной категории.', isLinked: true },
    { id: 4, name: 'SubCategoryId', description: 'ID подкатегории.', isLinked: true },
    { id: 5, name: 'DeveloperId', description: 'ID разработчика.', isLinked: true },
    { id: 6, name: 'IconPath', description: 'Путь к иконке.' },
    { id: 7, name: 'Website', description: 'Официальный сайт.' },
    { id: 8, name: 'SortOrder', description: 'Порядок отображения.' },
    { id: 9, name: 'IsActive', description: 'Флаг активности.' },
    { id: 10, name: 'Status', description: 'Draft, Published.' },
    { id: 11, name: 'LocalizedName', description: 'Название на языке.' },
    { id: 12, name: 'ShortDescription', description: 'Краткое описание.' },
    { id: 13, name: 'FullDescription', description: 'Полное описание (HTML).' },
    { id: 14, name: 'Pros / Cons', description: 'Плюсы и минусы.' },
    { id: 15, name: 'MetaTitle / MetaDesc', description: 'SEO данные.' },
    { id: 16, name: 'LicenseTypeId', description: 'ID типа лицензии.', isLinked: true },
    { id: 17, name: 'PlatformIds', description: 'Массив ID платформ.', isLinked: true },
    { id: 18, name: 'TagIds', description: 'Массив ID тегов.', isLinked: true },
    { id: 19, name: 'DownloadUrls', description: 'Ссылки на скачивание.' },
    { id: 20, name: 'MarketData', description: 'Данные из маркетов.', isLinked: true },
    { id: 21, name: 'Screenshots', description: 'Скриншоты.', isLinked: true },
    { id: 22, name: 'Videos', description: 'Видео.', isLinked: true },
    { id: 23, name: 'IsSystem', description: 'Защита от удаления.' },
  ];

  actionsDetails = [
    { action: 'Просмотр', icon: 'eye', method: 'openView()', ux: 'Modal (Read-only)' },
    { action: 'Редактировать', icon: 'edit', method: 'updateState()', ux: 'Modal с формой' },
    { action: 'В корзину', icon: 'rest', method: 'delete()', ux: 'Soft Delete' },
    { action: 'Восстановить', icon: 'undo', method: 'restore()', ux: 'Возврат в список' },
    { action: 'Hard Delete', icon: 'fire', method: 'hardDelete()', ux: 'Challenge (Капча)' },
  ];

  csDetailedEntity = `public class ProgramOfAggregator {
    public string CanonicalName { get; set; }
    public string Slug { get; set; }
    public string Website { get; set; }
    public int CategoryOfAggregatorId { get; set; }
    public virtual ICollection<Localization> Localizations { get; set; }
}`;

  uiAddProposals = [
    { id: 1, element: 'Input', description: 'Для CanonicalName.' },
    { id: 2, element: 'Lock Input', description: 'Для Slug с автогенерацией.' },
    { id: 3, element: 'Select', description: 'Для CategoryId (Обязательно).' },
    { id: 4, element: 'Dependent Select', description: 'Для SubCategoryId.' },
    { id: 5, element: 'Searchable Select', description: 'Для DeveloperId (Обязательно).' },
    { id: 6, element: 'Uploader', description: 'Для IconPath.' },
    { id: 7, element: 'Input', description: 'Для Website.' },
    { id: 8, element: 'Number', description: 'Для SortOrder.' },
    { id: 9, element: 'Switch', description: 'Для IsActive.' },
    { id: 10, element: 'Radio', description: 'Для Status.' },
    { id: 11, element: 'Localized Input', description: 'Во вкладках языков.' },
    { id: 12, element: 'TinyMCE (Simple)', description: 'Для ShortDescription.' },
    { id: 13, element: 'TinyMCE (Full)', description: 'Для FullDescription.' },
    { id: 14, element: 'Dynamic List', description: 'Для Pros/Cons.' },
    { id: 15, element: 'SEO Block', description: 'Для MetaTitle и MetaDesc.' },
  ];
}
